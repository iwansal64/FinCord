use actix_web::{
        Either::{Left, Right},
        HttpResponse,
        cookie::Cookie,
        post, web,
};
use entity::users;
use sea_orm::{
        ActiveModelTrait, ActiveValue, ColumnTrait, DatabaseConnection, DbErr, EntityTrait,
        QueryFilter, prelude::Uuid,
};
use serde::Deserialize;
use validator::Validate;

#[derive(Deserialize, Validate)]
struct LoginDataUsingEmail {
        #[validate(email)]
        email: String,
        password: String,
}

#[derive(Deserialize)]
struct LoginDataUsingUsername {
        username: String,
        password: String,
}

#[post("/user/login")]
pub async fn user_login(
        db: web::Data<DatabaseConnection>,
        data: actix_web::Either<web::Json<LoginDataUsingEmail>, web::Json<LoginDataUsingUsername>>,
) -> HttpResponse {
        // ? Validate data
        if let Left(data) = &data {
                match data.validate() {
                        Ok(_) => (),
                        Err(err) => {
                                tracing::warn!(
                                        "Failed to validate data using validator. Error: {}",
                                        err.to_string()
                                );
                                return HttpResponse::BadRequest().finish();
                        }
                }
        }

        // ? Verify user and password from the database
        let user_data_result: Result<Option<users::Model>, DbErr> = users::Entity::find()
                .filter(match &data {
                        Left(data_using_email) => users::Column::Email.eq(&data_using_email.email),
                        Right(data_using_username) => {
                                users::Column::Username.eq(&data_using_username.username)
                        }
                })
                .one(db.get_ref())
                .await;

        let user_data: users::Model = match user_data_result {
                Ok(data) => match data {
                        Some(model) => model,
                        None => {
                                return HttpResponse::Unauthorized().finish();
                        }
                },
                Err(err) => {
                        tracing::error!(
                                "There's an error when trying to get registration entry from database. Error: {}",
                                err.to_string()
                        );
                        return HttpResponse::InternalServerError().finish();
                }
        };

        let data_password = match &data {
                Left(data) => &data.password,
                Right(data) => &data.password,
        };

        if data_password.as_str() != user_data.password {
                return HttpResponse::Unauthorized().finish();
        }

        // ? Generate session token and update the session token for the associated user data
        let generated_session_token = Uuid::new_v4();

        let mut user_data: users::ActiveModel = user_data.into();
        user_data.session_token = ActiveValue::Set(generated_session_token);

        match user_data.update(db.get_ref()).await {
                Ok(_) => (),
                Err(err) => {
                        tracing::error!(
                                "There's an error when trying to update session token for associated user data. Error: {}",
                                err.to_string()
                        );
                        return HttpResponse::InternalServerError().finish();
                }
        }

        // ? Create cookie to store session token
        let cookie: Cookie<'_> =
                Cookie::build("session_token", generated_session_token.to_string())
                        .path("/")
                        .secure(std::env::var("DEV").is_err())
                        .http_only(true)
                        .same_site(actix_web::cookie::SameSite::Lax)
                        .finish();

        // ? Return success with cookie
        return HttpResponse::Ok().cookie(cookie).finish();
}
