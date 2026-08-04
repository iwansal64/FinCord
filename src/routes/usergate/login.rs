use actix_web::{HttpResponse, cookie::Cookie, post, web};
use entity::users;
use sea_orm::{
        ActiveModelTrait, ActiveValue, ColumnTrait, DatabaseConnection, DbErr, EntityTrait,
        QueryFilter, prelude::Uuid,
};
use serde::Deserialize;

use crate::utils::mail_util::verify_email;

#[derive(Deserialize)]
struct LoginData {
        email_or_username: String,
        password: String,
}

enum UsernameOrEmail<'a> {
        Username(&'a str),
        Email(&'a str),
}

#[post("/user/login")]
pub async fn user_login(
        db: web::Data<DatabaseConnection>,
        data: web::Json<LoginData>,
) -> HttpResponse {
        // ? Verify if it's username or email
        let email_or_username: UsernameOrEmail = match verify_email(&data.email_or_username).await {
                Ok(result) => match result {
                        true => UsernameOrEmail::Email(&data.email_or_username),
                        false => UsernameOrEmail::Username(&data.email_or_username),
                },
                Err(err_str) => {
                        tracing::error!("Failed to verify email address. Error: {err_str}");
                        return HttpResponse::InternalServerError().finish();
                }
        };

        // ? Verify user and password from the database
        let user_data_result: Result<Option<users::Model>, DbErr> = users::Entity::find()
                .filter(match email_or_username {
                        UsernameOrEmail::Username(username) => users::Column::Username.eq(username),
                        UsernameOrEmail::Email(email) => users::Column::Email.eq(email),
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

        if data.password.as_str() != user_data.password {
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
