use std::str::FromStr;

use actix_web::{HttpRequest, HttpResponse, cookie::Cookie, post, web};
use entity::users;
use sea_orm::{
        ColumnTrait, DatabaseConnection, DbErr, EntityTrait, FromQueryResult, QueryFilter,
        QuerySelect,
        prelude::{DateTimeWithTimeZone, Uuid},
};
use serde::Serialize;

#[derive(FromQueryResult, Debug, Serialize)]
pub struct PartialUser {
        pub id: i32,
        pub username: String,
        pub email: String,
        pub created_at: DateTimeWithTimeZone,
}

#[post("/user/verify")]
pub async fn verify_logged_user(
        req: HttpRequest,
        db: web::Data<DatabaseConnection>,
) -> HttpResponse {
        // ? Verify if there's session token
        let session_token: Option<Cookie<'static>> = req.cookie("session_token");

        let session_token: Uuid = match session_token {
                Some(cookie) => {
                        let cookie_string: &str = cookie.value();
                        tracing::info!("cookie_string: {cookie_string}");
                        match Uuid::from_str(&cookie_string) {
                                Ok(data) => data,
                                Err(_) => {
                                        return HttpResponse::Unauthorized().finish();
                                }
                        }
                }
                None => {
                        return HttpResponse::Unauthorized().finish();
                }
        };
        tracing::info!("passed: {session_token}");

        // ? Check if the session token is valid
        let user_data_result: Result<Option<PartialUser>, DbErr> = users::Entity::find()
                .filter(users::Column::SessionToken.eq(session_token))
                .select_only()
                .columns([
                        users::Column::Username,
                        users::Column::Id,
                        users::Column::Email,
                        users::Column::CreatedAt,
                ])
                .into_model::<PartialUser>()
                .one(db.get_ref())
                .await;

        // ? Get the user data if it exists
        let user_data = match user_data_result {
                Ok(user_data_optional) => match user_data_optional {
                        Some(user_data) => user_data,
                        None => {
                                return HttpResponse::Unauthorized().finish();
                        }
                },
                Err(err) => {
                        tracing::error!(
                                "There's an error when trying to get user data from database. Error: {}",
                                err.to_string()
                        );
                        return HttpResponse::InternalServerError().finish();
                }
        };

        return HttpResponse::Ok().json(user_data);
}
