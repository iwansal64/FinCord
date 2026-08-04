pub use sea_orm_migration::prelude::*;

mod m20220101_000001_create_table;
mod m20260803_231202_add_not_null_to_email_address_in_registration_entires;
mod m20260804_103051_add_session_token;
mod m20260804_103730_add_email_unique_constraint;
mod m20260804_104644_add_password;

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
        ]
        }
}
