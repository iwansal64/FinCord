use actix_web::{HttpRequest, HttpResponse, post, web};
use futures::{self, StreamExt};
use sea_orm::{DatabaseConnection};
use serde::{Deserialize, Serialize};

use crate::{
        ai_interface::chat_ai_interface::{
                SendMessageToAIResult, send_message_to_ai,
        },
        db_interfaces::{
                transaction_records_db_interface::{
                        ClearPendingTransactionRecordsResult, GetPendingTransactionResult,
                        PendingSyncTransaction, SucceedGetPendingTransactionResult,
                        clear_pending_transaction_records_by_transaction_ids,
                        get_pending_transaction_records_by_user_id,
                },
                user_db_interface::{
                        PartialUser, UnverifiedReasons, VerificationResult, verify_user_by_req,
                },
        },
};

#[derive(Serialize)]
struct ResponseData {
        error_message: Option<String>,
        ai_response: Option<String>,
}

#[derive(Deserialize)]
struct RequestData {
        message: String,
}

#[post("/user/chat")]
pub async fn chat_with_ai(
        req: HttpRequest,
        body: web::Json<RequestData>,
        db: web::Data<DatabaseConnection>,
        requester: web::Data<reqwest::Client>,
) -> HttpResponse {
        // ? Verify user token
        let user_data_result: VerificationResult = verify_user_by_req(req, db.get_ref()).await;
        let user_data: PartialUser = match user_data_result {
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
                                ai_response: None,
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

        // ? Get pending transaction data
        let get_pending_transaction_records_result: GetPendingTransactionResult =
                get_pending_transaction_records_by_user_id(&user_data.id, db.get_ref()).await;

        let pending_transaction_records: SucceedGetPendingTransactionResult =
                match get_pending_transaction_records_result {
                        GetPendingTransactionResult::Success(data) => data,
                        GetPendingTransactionResult::Err(err) => {
                                tracing::error!(
                                        "There's an error when trying to get record data from database. Error: {}",
                                        err
                                );
                                return HttpResponse::InternalServerError().finish();
                        }
                };
        let pending_transaction_records_data: Vec<PendingSyncTransaction> =
                pending_transaction_records.pending_sync_transactions;
        let pending_deleted_transactions_ids: Vec<i32> =
                pending_transaction_records.pending_sync_transactions_ids;

        // ? Send request to AI backend server
        let send_message_result: SendMessageToAIResult = send_message_to_ai(
                requester.get_ref(),
                &body.message,
                &user_data.id,
                pending_transaction_records_data,
        )
        .await;

        let ai_response = match send_message_result {
                SendMessageToAIResult::Success(job_id) => job_id,
                SendMessageToAIResult::Err(err) => {
                        tracing::error!(
                                "There's an error when trying to get AI response! Error: {}",
                                err
                        );
                        return HttpResponse::InternalServerError().json(ResponseData {
                                ai_response: None,
                                error_message: Some(String::from(
                                        "There's an error from our server side",
                                )),
                        });
                }
        };

        let ai_streamed_response = ai_response.bytes_stream();

        let stream_iter = futures::stream::unfold(ai_streamed_response, |mut streamed_response| async {
                if let Some(chunk) = streamed_response.next().await {
                        let bytes = match chunk {
                                Ok(bytes) => bytes,
                                Err(err) => {
                                        tracing::error!("There's an error when trying to get bytes from the stream. Error: {}", err.to_string());
                                        return None;
                                }
                        };
                        let data_parse_result = String::from_utf8(bytes.to_vec());
                        let data = match data_parse_result {
                                Ok(data) => data,
                                Err(err) => {
                                        tracing::error!("There's an error when trying to parse bytes from the stream. Error: {}", err.to_string());
                                        return None;
                                }
                        };
                        
                        return Some((data, streamed_response));
                }

                None
        }).then(|data| async move {
                Ok::<_, actix_web::Error>(web::Bytes::from(data))
        });

        // ? Clear pending transaction records data
        let clear_pending_transactions_result: ClearPendingTransactionRecordsResult =
                clear_pending_transaction_records_by_transaction_ids(
                        pending_deleted_transactions_ids,
                        &db,
                )
                .await;

        match clear_pending_transactions_result {
                ClearPendingTransactionRecordsResult::Success => (),
                ClearPendingTransactionRecordsResult::Err(err) => {
                        tracing::error!(
                                "There's an error when trying to clear pending transaction records! Error: {}",
                                err
                        );
                        return HttpResponse::InternalServerError().json(ResponseData {
                                ai_response: None,
                                error_message: Some(String::from(
                                        "There's an error from our server side",
                                )),
                        });
                }
        }

        // ? Stream the result

        HttpResponse::Ok()
                .content_type("text/event-stream")
                .insert_header(("Cache-Control", "no-cache"))
                .insert_header(("X-Accel-Buffering", "no"))
                .streaming(stream_iter)
}
