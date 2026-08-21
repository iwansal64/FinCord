use sea_orm_migration::prelude::*;

pub struct Migration;

impl MigrationName for Migration {
        fn name(&self) -> &str {
                "m20260820_024149_add_is_already_embedded_to_transaction_records"
        }
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
        async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
                let db = manager.get_connection();
                db.execute_unprepared(
                        r#"
ALTER TABLE IF EXISTS public.transaction_records
    ADD COLUMN is_already_embedded boolean DEFAULT false NOT NULL;"#,
                )
                .await?;

                Ok(())
        }

        async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
                let db = manager.get_connection();
                db.execute_unprepared(
                        r#"
ALTER TABLE IF EXISTS public.transaction_records DROP COLUMN IF EXISTS is_already_embedded;"#,
                )
                .await?;

                Ok(())
        }
}
