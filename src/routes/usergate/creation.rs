use actix_web::{HttpResponse, cookie::Cookie, post, web};
use entity::{registration_entries, users};
use sea_orm::{
        ActiveModelTrait, ActiveValue, ColumnTrait, DatabaseConnection, DbErr, EntityTrait,
        QueryFilter, prelude::Uuid,
};
use serde::Deserialize;
use validator::Validate;

#[derive(Deserialize, Validate)]
struct CreateAccountData {
        #[validate(email)]
        email: String,
        token: String,
        username: String,
        password: String,
}

#[post("/user/register/create")]
pub async fn user_create(
        db: web::Data<DatabaseConnection>,
        data: web::Json<CreateAccountData>,
) -> HttpResponse {
        // ? Validate data
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

        // ? Verify from the database
        let registration_entry_result: Result<Option<registration_entries::Model>, DbErr> =
                registration_entries::Entity::find()
                        .filter(registration_entries::Column::Email.eq(&data.email))
                        .one(db.get_ref())
                        .await;

        let registration_entry: registration_entries::Model = match registration_entry_result {
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

        if data.token != registration_entry.token {
                return HttpResponse::Unauthorized().finish();
        }

        // ? If verified, set create user account
        let generated_session_token = Uuid::new_v4();
        let user_data = users::ActiveModel {
                name: ActiveValue::Set(data.username.clone()),
                password: ActiveValue::Set(data.password.clone()),
                session_token: ActiveValue::Set(generated_session_token),
                ..Default::default()
        };

        match user_data.save(db.get_ref()).await {
                Ok(_) => (),
                Err(err) => {
                        tracing::error!(
                                "There's an error when saving user data. Error: {}",
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
