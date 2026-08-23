use chrono::{FixedOffset, Utc};
use entity::{pending_sync_transactions, transaction_records, users};
use sea_orm::{
        ActiveModelTrait, ActiveValue, ColumnTrait, DatabaseConnection, DbErr, DeleteResult,
        EntityTrait, FromQueryResult, QueryFilter, QuerySelect, prelude::DateTimeWithTimeZone,
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

#[derive(Serialize, Default)]
pub struct UpdatedTransaction {
        pub title: String,
        pub description: String,
        pub created_at: DateTimeWithTimeZone,
        pub amount: i64,
        pub id: i32,
        pub is_deleted: bool,
}

#[derive(Serialize)]
pub struct DeletedTransaction {
        pub id: i32,
        pub is_deleted: bool,
}

impl Default for DeletedTransaction {
        fn default() -> Self {
                DeletedTransaction {
                        id: 0,
                        is_deleted: true,
                }
        }
}

#[derive(Serialize)]
#[serde(untagged)]
pub enum PendingSyncTransaction {
        Updated(UpdatedTransaction),
        Deleted(DeletedTransaction),
}

pub struct SucceedGetPendingTransactionResult {
        pub pending_sync_transactions: Vec<PendingSyncTransaction>,
        pub pending_sync_transactions_ids: Vec<i32>,
}

pub enum GetPendingTransactionResult {
        Success(SucceedGetPendingTransactionResult),
        Err(String),
}

pub async fn get_pending_transaction_records_by_user_id(
        user_id: &i32,
        db: &DatabaseConnection,
) -> GetPendingTransactionResult {
        // ? Get all of pending, out of sync transaction records first to update vector store in the AI side
        let pending_transactions_result: Result<Vec<pending_sync_transactions::Model>, DbErr> =
                pending_sync_transactions::Entity::find()
                        .has_related(users::Entity, users::Column::Id.eq(user_id))
                        .all(db)
                        .await;

        let pending_transactions_data: Vec<pending_sync_transactions::Model> =
                match pending_transactions_result {
                        Ok(data) => data,
                        Err(err) => {
                                return GetPendingTransactionResult::Err(err.to_string());
                        }
                };

        let mut pending_transactions_ids: Vec<i32> = pending_transactions_data
                .iter()
                .map(|model| model.transaction_id)
                .collect::<Vec<i32>>();

        // ? Get the transaction data for each pending sync transactions
        let pending_sync_transaction_records_result: Result<Vec<PartialTransactionRecords>, DbErr> =
                transaction_records::Entity::find()
                        .has_related(users::Entity, users::Column::Id.eq(user_id))
                        .filter(transaction_records::Column::Id.eq_any(&pending_transactions_ids))
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

        let updated_transaction_records: Vec<PendingSyncTransaction> =
                match pending_sync_transaction_records_result {
                        Ok(out_of_sync_transaction_record) => out_of_sync_transaction_record
                                .iter()
                                .map(|record| {
                                        if let Some(id) = pending_transactions_ids
                                                .iter()
                                                .position(|id| id == &record.id)
                                        {
                                                pending_transactions_ids.remove(id);
                                        }

                                        PendingSyncTransaction::Updated(UpdatedTransaction {
                                                id: record.id,
                                                title: record.title.clone(),
                                                description: record.description.clone(),
                                                created_at: record.created_at,
                                                amount: record.amount,
                                                ..Default::default()
                                        })
                                })
                                .collect(),
                        Err(err) => {
                                return GetPendingTransactionResult::Err(err.to_string());
                        }
                };

        let deleted_transaction_records: Vec<PendingSyncTransaction> = pending_transactions_ids
                .iter()
                .map(|id| {
                        PendingSyncTransaction::Deleted(DeletedTransaction {
                                id: *id,
                                ..Default::default()
                        })
                })
                .collect();

        let mut resulted_pending_sync_transaction_records: Vec<PendingSyncTransaction> = vec![];
        resulted_pending_sync_transaction_records.extend(updated_transaction_records);
        resulted_pending_sync_transaction_records.extend(deleted_transaction_records);

        GetPendingTransactionResult::Success(SucceedGetPendingTransactionResult {
                pending_sync_transactions: resulted_pending_sync_transaction_records,
                pending_sync_transactions_ids: pending_transactions_ids,
        })
}

pub enum ClearPendingTransactionRecordsResult {
        Success,
        Err(String),
}

pub async fn clear_pending_transaction_records_by_transaction_ids(
        pending_transactions_ids: Vec<i32>,
        db: &DatabaseConnection,
) -> ClearPendingTransactionRecordsResult {
        let delete_pending_transaction_result: Result<DeleteResult, DbErr> =
                pending_sync_transactions::Entity::delete_many()
                        .filter_by_ids(pending_transactions_ids)
                        .exec(db)
                        .await;

        match delete_pending_transaction_result {
                Ok(_) => ClearPendingTransactionRecordsResult::Success,
                Err(err) => ClearPendingTransactionRecordsResult::Err(err.to_string()),
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
        // Create transaction records
        let insert_transaction_record_result = transaction_records::ActiveModel {
                creator_id: ActiveValue::Set(user_id),
                title: ActiveValue::Set(title),
                description: ActiveValue::Set(description),
                amount: ActiveValue::Set(amount),
                created_at: ActiveValue::Set(
                        Utc::now().with_timezone(&FixedOffset::east_opt(0).unwrap()),
                ),
                is_income: ActiveValue::Set(amount > 0),
                ..Default::default()
        }
        .save(db)
        .await;

        let transaction_record = match insert_transaction_record_result {
                Ok(data) => data,
                Err(err) => {
                        return CreateTransactionRecordResult::Err(err.to_string());
                }
        };

        // Create pending sync transaction records to a new transaction records
        let insert_pending_transaction_record_result = pending_sync_transactions::ActiveModel {
                user_id: ActiveValue::Set(user_id),
                transaction_id: transaction_record.id,
                ..Default::default()
        }
        .save(db)
        .await;

        match insert_pending_transaction_record_result {
                Ok(_) => CreateTransactionRecordResult::Success,
                Err(err) => CreateTransactionRecordResult::Err(err.to_string()),
        }
}
