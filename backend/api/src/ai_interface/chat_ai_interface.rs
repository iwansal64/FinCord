use std::env;

use reqwest::Response;
use serde::Serialize;
use serde_json;

use crate::db_interfaces::transaction_records_db_interface::PendingSyncTransaction;

#[derive(Serialize)]
struct AIChatAPIRequestBody {
        message: String,
        user_id: i32,
        pending_data: Vec<PendingSyncTransaction>,
}

pub enum SendMessageToAIResult {
        Success(Response),
        Err(String),
}

pub async fn send_message_to_ai(
        requester: &reqwest::Client,
        message: &str,
        user_id: &i32,
        pending_data: Vec<PendingSyncTransaction>,
) -> SendMessageToAIResult {
        let ai_api_base_url: String = env::var("AI_API_BASE_URL").unwrap();
        let key_access: String = env::var("KEY_ACCESS").unwrap();

        let request_body: AIChatAPIRequestBody = AIChatAPIRequestBody {
                message: message.to_string(),
                user_id: *user_id,
                pending_data: pending_data,
        };

        tracing::info!(
                "request body: {}",
                serde_json::to_string(&request_body).unwrap()
        );
        let request_result: Result<reqwest::Response, reqwest::Error> = requester
                .post(format!("{ai_api_base_url}/ask/stream"))
                .bearer_auth(key_access)
                .json(&request_body)
                .send()
                .await;

        let response = match request_result {
                Ok(response) => response,
                Err(err) => {
                        return SendMessageToAIResult::Err(err.to_string());
                }
        };

        let ok_response = match response.error_for_status() {
                Ok(ok_response) => ok_response,
                Err(err) => {
                        return SendMessageToAIResult::Err(err.to_string());
                }
        };

        SendMessageToAIResult::Success(ok_response)
}
