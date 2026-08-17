use actix_web::{HttpRequest, HttpResponse, post, web};
use sea_orm::DatabaseConnection;
use serde::Serialize;

use crate::db_interfaces::user_db_interface::{
        PartialUser, UnverifiedReasons, VerificationResult, verify_user_by_req,
};

#[derive(Serialize)]
struct ResponseData {
        error_message: Option<String>,
        user_data: Option<PartialUser>,
}

#[post("/user/verify")]
pub async fn verify_logged_user(
        req: HttpRequest,
        db: web::Data<DatabaseConnection>,
) -> HttpResponse {
        // ? Get the user data if it exists
        let user_data: PartialUser = match verify_user_by_req(req, db.get_ref()).await {
                VerificationResult::Verified(data) => data,
                VerificationResult::Unverified(reason) => {
                        let message = match reason {
                                UnverifiedReasons::SessionTokenNotExists => "Haven't login",
                                UnverifiedReasons::SessionNotValid => "Session is not valid",
                                UnverifiedReasons::SessionNotExistsInDatabase => {
                                        "Session is not valid"
                                }
                        };

                        return HttpResponse::Unauthorized().json(ResponseData {
                                error_message: Some(message.to_string()),
                                user_data: None,
                        });
                }
                VerificationResult::Err(err) => {
                        tracing::error!(
                                "There's an error when trying to get user data from database. Error: {}",
                                err
                        );
                        return HttpResponse::InternalServerError().finish();
                }
        };

        HttpResponse::Ok().json(ResponseData {
                error_message: None,
                user_data: Some(user_data),
        })
}
