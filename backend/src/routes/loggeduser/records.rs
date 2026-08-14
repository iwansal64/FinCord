use actix_web::{HttpRequest, HttpResponse, get, web};
use sea_orm::DatabaseConnection;
use serde::Serialize;

use crate::db_interfaces::{
        transaction_records_db_interface::{
                GetTransactionRecordsResult, PartialTransactionRecords,
                get_transaction_records_by_user_id,
        },
        user_db_interface::{
                PartialUser, UnverifiedReasons, VerificationResult, verify_user_by_req,
        },
};

#[derive(Serialize)]
struct ResponseData {
        error_message: Option<String>,
        records_data: Option<Vec<PartialTransactionRecords>>,
}

#[get("/records")]
pub async fn get_transaction_records(
        req: HttpRequest,
        db: web::Data<DatabaseConnection>,
) -> HttpResponse {
        // ? Verify if it's authenticated user
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
                                records_data: None,
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

        // ? Get user records
        let user_records: Vec<PartialTransactionRecords> = match get_transaction_records_by_user_id(
                &user_data.id,
                db.get_ref(),
        )
        .await
        {
                GetTransactionRecordsResult::Success(data) => data,
                GetTransactionRecordsResult::Err(err) => {
                        tracing::error!(
                                "There's an error when trying to get record data from database. Error: {}",
                                err
                        );
                        return HttpResponse::InternalServerError().finish();
                }
        };

        HttpResponse::Ok().json(ResponseData {
                error_message: None,
                records_data: Some(user_records),
        })
}
