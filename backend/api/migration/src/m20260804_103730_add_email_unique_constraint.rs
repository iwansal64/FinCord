use sea_orm_migration::prelude::*;

pub struct Migration;

impl MigrationName for Migration {
        fn name(&self) -> &str {
                "m20260804_103730_add_email_unique_constraint"
        }
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
        async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
                let db = manager.get_connection();
                db.execute_unprepared(
                        "
ALTER TABLE IF EXISTS public.registration_entries
    ADD CONSTRAINT unique_key_email UNIQUE (email);
    ",
                )
                .await?;
                Ok(())
        }

        async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
                let db = manager.get_connection();
                db.execute_unprepared("ALTER TABLE IF EXISTS public.registration_entries DROP CONSTRAINT IF EXISTS unique_key_email;").await?;
                Ok(())
        }
}
