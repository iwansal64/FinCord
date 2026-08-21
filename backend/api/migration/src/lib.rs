pub use sea_orm_migration::prelude::*;

mod m20220101_000001_create_table;
mod m20260803_231202_add_not_null_to_email_address_in_registration_entires;
mod m20260804_103051_add_session_token;
mod m20260804_103730_add_email_unique_constraint;
mod m20260804_104644_add_password;
mod m20260804_123737_apply_unique_to_username;
mod m20260804_124927_apply_not_null_to_password;
mod m20260804_125205_add_email_address_to_users;
mod m20260820_024149_add_is_already_embedded_to_transaction_records;
mod m20260820_065041_add_pending_sync_transactions_table;
mod m20260820_065541_add_primary_key_to_pending_sync_transactions;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
        fn migrations() -> Vec<Box<dyn MigrationTrait>> {
                vec![
            Box::new(m20220101_000001_create_table::Migration),
            Box::new(m20260803_231202_add_not_null_to_email_address_in_registration_entires::Migration),
            Box::new(m20260804_103051_add_session_token::Migration),
            Box::new(m20260804_103730_add_email_unique_constraint::Migration),
            Box::new(m20260804_104644_add_password::Migration),
            Box::new(m20260804_123737_apply_unique_to_username::Migration),
            Box::new(m20260804_124927_apply_not_null_to_password::Migration),
            Box::new(m20260804_125205_add_email_address_to_users::Migration),
            Box::new(m20260820_024149_add_is_already_embedded_to_transaction_records::Migration),
            Box::new(m20260820_065041_add_pending_sync_transactions_table::Migration),
            Box::new(m20260820_065541_add_primary_key_to_pending_sync_transactions::Migration),
        ]
        }
}
