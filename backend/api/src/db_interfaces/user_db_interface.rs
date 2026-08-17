use std::str::FromStr;

use actix_web::{HttpRequest, cookie::Cookie};
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

pub enum UnverifiedReasons {
        SessionTokenNotExists,
        SessionNotValid,
        SessionNotExistsInDatabase,
}

pub enum VerificationResult {
        Verified(PartialUser),
        Unverified(UnverifiedReasons),
        Err(String),
}

pub async fn verify_user_by_req(req: HttpRequest, db: &DatabaseConnection) -> VerificationResult {
        // ? Verify if there's session token
        let session_token: Option<Cookie<'static>> = req.cookie("session_token");

        let session_token: Uuid = match session_token {
                Some(cookie) => {
                        let cookie_string: &str = cookie.value();
                        match Uuid::from_str(&cookie_string) {
                                Ok(data) => data,
                                Err(_) => {
                                        return VerificationResult::Unverified(
                                                UnverifiedReasons::SessionNotValid,
                                        );
                                }
                        }
                }
                None => {
                        return VerificationResult::Unverified(
                                UnverifiedReasons::SessionTokenNotExists,
                        );
                }
        };

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
                .one(db)
                .await;

        // ? Get the user data if it exists
        let user_data = match user_data_result {
                Ok(user_data_optional) => match user_data_optional {
                        Some(user_data) => user_data,
                        None => {
                                return VerificationResult::Unverified(
                                        UnverifiedReasons::SessionNotExistsInDatabase,
                                );
                        }
                },
                Err(err) => {
                        return VerificationResult::Err(err.to_string());
                }
        };

        VerificationResult::Verified(user_data)
}
