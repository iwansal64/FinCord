use actix_web::{HttpResponse, post, web};
use actix_web_httpauth::extractors::bearer::BearerAuth;
use sea_orm::DatabaseConnection;
use serde::{Deserialize, Serialize};

use crate::db_interfaces::{
        transaction_records_db_interface::{
                CreateTransactionRecordResult, create_transaction_records,
        },
        user_db_interface::verify_ai_bearer_token,
};

#[derive(Serialize, Deserialize)]
struct CreateTransactionRecordsData {
        user_id: i32,
        title: String,
        description: String,
        amount: i64,
}

#[post("/ai/records")]
pub async fn create_transaction_records_for_ai_endpoint(
        data: web::Json<CreateTransactionRecordsData>,
        db: web::Data<DatabaseConnection>,
        auth: BearerAuth,
) -> HttpResponse {
        // ? Verify if it's authenticated user
        let token = auth.token();
        if !verify_ai_bearer_token(token) {
                return HttpResponse::Unauthorized().finish();
        }

        // ? Create record data
        let create_record_result = create_transaction_records(
                data.user_id,
                data.title.clone(),
                data.description.clone(),
                data.amount,
                &db,
        )
        .await;

        match create_record_result {
                CreateTransactionRecordResult::Success => return HttpResponse::Ok().finish(),
                CreateTransactionRecordResult::Err(err) => {
                        tracing::error!(
                                "There's an error when trying to create record data to database. Error: {}",
                                err
                        );
                        return HttpResponse::InternalServerError().finish();
                }
        };
}
