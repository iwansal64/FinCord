use chrono::{FixedOffset, Utc};
use entity::{transaction_records, users};
use sea_orm::{
        ActiveModelTrait, ActiveValue, ColumnTrait, DatabaseConnection, EntityTrait,
        FromQueryResult, QuerySelect, prelude::DateTimeWithTimeZone,
};
use serde::Serialize;

#[derive(FromQueryResult, Debug, Serialize)]
pub struct PartialTransactionRecords {
        pub id: i32,
        pub title: String,
        pub description: String,
        pub amount: i64,
        pub is_income: bool,
        pub created_at: DateTimeWithTimeZone,
}

pub enum GetTransactionRecordsResult {
        Success(Vec<PartialTransactionRecords>),
        Err(String),
}

pub async fn get_transaction_records_by_user_id(
        id: &i32,
        db: &DatabaseConnection,
) -> GetTransactionRecordsResult {
        let records = transaction_records::Entity::find()
                .has_related(users::Entity, users::Column::Id.eq(id))
                .select_only()
                .columns([
                        transaction_records::Column::Id,
                        transaction_records::Column::Title,
                        transaction_records::Column::Description,
                        transaction_records::Column::Amount,
                        transaction_records::Column::IsIncome,
                        transaction_records::Column::CreatedAt,
                ])
                .into_model::<PartialTransactionRecords>()
                .all(db)
                .await;

        match records {
                Ok(data) => GetTransactionRecordsResult::Success(data),
                Err(err) => GetTransactionRecordsResult::Err(err.to_string()),
        }
}

pub enum CreateTransactionRecordResult {
        Success,
        Err(String),
}

pub async fn create_transaction_records(
        user_id: i32,
        title: String,
        description: String,
        amount: i64,
        db: &DatabaseConnection,
) -> CreateTransactionRecordResult {
        let transaction_record: transaction_records::ActiveModel =
                transaction_records::ActiveModel {
                        creator_id: ActiveValue::Set(user_id),
                        title: ActiveValue::Set(title),
                        description: ActiveValue::Set(description),
                        amount: ActiveValue::Set(amount),
                        created_at: ActiveValue::Set(
                                Utc::now().with_timezone(&FixedOffset::east_opt(0).unwrap()),
                        ),
                        is_income: ActiveValue::Set(amount > 0),
                        ..Default::default()
                };

        match transaction_record.save(db).await {
                Ok(_) => CreateTransactionRecordResult::Success,
                Err(err) => CreateTransactionRecordResult::Err(err.to_string()),
        }
}
