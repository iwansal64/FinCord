use sea_orm_migration::prelude::*;

pub struct Migration;

impl MigrationName for Migration {
        fn name(&self) -> &str {
                "m20260804_104644_add_password"
        }
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
        async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
                let db = manager.get_connection();
                db.execute_unprepared(
                        r#"
ALTER TABLE IF EXISTS public.users
    ADD COLUMN password character varying(100) COLLATE pg_catalog."default" NOT NULL;

ALTER TABLE IF EXISTS public.users
    ALTER COLUMN password SET STORAGE PLAIN;

ALTER TABLE IF EXISTS public.users
    ALTER COLUMN password SET COMPRESSION lz4;"#,
                )
                .await?;

                Ok(())
        }

        async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
                let db = manager.get_connection();
                db.execute_unprepared(
                        "ALTER TABLE IF EXISTS public.users DROP COLUMN IF EXISTS password;",
                )
                .await?;

                Ok(())
        }
}
