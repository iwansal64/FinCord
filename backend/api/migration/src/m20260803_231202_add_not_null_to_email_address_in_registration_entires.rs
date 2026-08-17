use sea_orm_migration::prelude::*;

pub struct Migration;

impl MigrationName for Migration {
        fn name(&self) -> &str {
                "m20260803_231202_add_not_null_to_email_address_in_registration_entires"
        }
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
        async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
                let db = manager.get_connection();
                db.execute_unprepared(
                        "
ALTER TABLE IF EXISTS public.registration_entries
    ALTER COLUMN email SET NOT NULL;

ALTER TABLE IF EXISTS public.registration_entries
    ALTER COLUMN email SET COMPRESSION lz4;",
                )
                .await?;

                Ok(())
        }

        async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
                let db = manager.get_connection();
                db.execute_unprepared(
                        "
ALTER TABLE IF EXISTS public.registration_entries
    ALTER COLUMN email DROP NOT NULL;

ALTER TABLE IF EXISTS public.registration_entries
    ALTER COLUMN email SET COMPRESSION lz4;
    ",
                )
                .await?;
                Ok(())
        }
}
