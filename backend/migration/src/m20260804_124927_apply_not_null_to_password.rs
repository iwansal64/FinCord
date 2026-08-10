use sea_orm_migration::prelude::*;

pub struct Migration;

impl MigrationName for Migration {
        fn name(&self) -> &str {
                "m20260804_124927_apply_not_null_to_password"
        }
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
        async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
                let db = manager.get_connection();
                db.execute_unprepared(
                        "
ALTER TABLE IF EXISTS public.users
    ALTER COLUMN password SET NOT NULL;

ALTER TABLE IF EXISTS public.users
    ALTER COLUMN password SET COMPRESSION lz4;",
                )
                .await?;
                Ok(())
        }

        async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
                let db = manager.get_connection();
                db.execute_unprepared(
                        "
ALTER TABLE IF EXISTS public.users
    ALTER COLUMN password DROP NOT NULL;

ALTER TABLE IF EXISTS public.users
    ALTER COLUMN password SET COMPRESSION lz4;",
                )
                .await?;
                Ok(())
        }
}
