use std::{env, time::Duration};

use sea_orm::prelude::Uuid;
use serde::{Deserialize, Serialize};

use crate::db_interfaces::transaction_records_db_interface::PendingSyncTransaction;

#[derive(Serialize)]
struct AIChatAPIRequestBody {
        message: String,
        user_id: i32,
        pending_data: Vec<PendingSyncTransaction>,
}

#[derive(Deserialize)]
struct AIChatAPIResponseBody {
        job_id: Uuid,
}

pub enum SendMessageToAIResult {
        Success(Uuid),
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

        tracing::info!("KEY_ACCESS: {key_access}");
        let request_result: Result<reqwest::Response, reqwest::Error> = requester
                .post(format!("{ai_api_base_url}/ask"))
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

        let response_data_result = ok_response.json::<AIChatAPIResponseBody>().await;

        match response_data_result {
                Ok(data) => SendMessageToAIResult::Success(data.job_id),
                Err(err) => SendMessageToAIResult::Err(err.to_string()),
        }
}

#[derive(Serialize)]
pub struct AIGetAPIRequestBody<'a> {
        job_id: &'a str,
}

#[derive(Deserialize, PartialEq)]
pub enum Status {
        #[serde(rename = "finished")]
        Finished,
        #[serde(rename = "running")]
        Running,
        #[serde(rename = "error")]
        Error,
}

#[derive(Deserialize)]
pub struct AIGetAPIResponseBody {
        status: Status,
        message: Option<String>,
}

pub type AIResponse = String;

pub enum WaitAIMessageResult {
        Success(AIResponse),
        Err(String),
}

pub async fn wait_message_from_ai(
        requester: &reqwest::Client,
        job_id: &str,
) -> WaitAIMessageResult {
        let ai_api_base_url: String = env::var("AI_API_BASE_URL").unwrap();
        let key_access: String = env::var("KEY_ACCESS").unwrap();

        let request_body: AIGetAPIRequestBody = AIGetAPIRequestBody { job_id: job_id };

        loop {
                let request_result: Result<reqwest::Response, reqwest::Error> = requester
                        .post(format!("{ai_api_base_url}/get"))
                        .bearer_auth(&key_access)
                        .json(&request_body)
                        .send()
                        .await;

                let response = match request_result {
                        Ok(response) => response,
                        Err(err) => {
                                return WaitAIMessageResult::Err(err.to_string());
                        }
                };

                let ok_response = match response.error_for_status() {
                        Ok(ok_response) => ok_response,
                        Err(err) => {
                                return WaitAIMessageResult::Err(err.to_string());
                        }
                };

                let response_text: String = ok_response.text().await.unwrap();
                let response_data_result =
                        serde_json::from_str::<AIGetAPIResponseBody>(&response_text);
                let response_data: AIGetAPIResponseBody = match response_data_result {
                        Ok(data) => data,
                        Err(err) => {
                                tracing::error!(
                                        "THERE'S AN ERROR WHEN TRYING TO PARSE JSON FORMATTED FROM AI. RESPONSE: {}",
                                        response_text
                                );
                                return WaitAIMessageResult::Err(err.to_string());
                        }
                };

                if response_data.status == Status::Finished
                        && let Some(message) = response_data.message
                {
                        return WaitAIMessageResult::Success(message);
                }

                tokio::time::sleep(Duration::from_secs(5)).await;
        }
}
