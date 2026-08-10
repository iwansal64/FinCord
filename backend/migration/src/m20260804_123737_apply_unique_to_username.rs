use sea_orm_migration::prelude::*;

pub struct Migration;

impl MigrationName for Migration {
        fn name(&self) -> &str {
                "m20260804_123737_apply_unique_to_username"
        }
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
        async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
                let db = manager.get_connection();
                db.execute_unprepared(
                        r#"
ALTER TABLE IF EXISTS public.users DROP COLUMN IF EXISTS name;

ALTER TABLE IF EXISTS public.users
    ALTER COLUMN password DROP NOT NULL;

ALTER TABLE IF EXISTS public.users
    ALTER COLUMN password SET COMPRESSION lz4;

ALTER TABLE IF EXISTS public.users
    ADD COLUMN username character varying COLLATE pg_catalog."default" NOT NULL;
ALTER TABLE IF EXISTS public.users
    ADD CONSTRAINT unique_key_username UNIQUE (username);"#,
                )
                .await?;

                Ok(())
        }

        async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
                let db = manager.get_connection();
                db.execute_unprepared(
                        r#"
ALTER TABLE IF EXISTS public.users DROP COLUMN IF EXISTS username;

ALTER TABLE IF EXISTS public.users
    ALTER COLUMN password SET NOT NULL;

ALTER TABLE IF EXISTS public.users
    ALTER COLUMN password SET COMPRESSION lz4;

ALTER TABLE IF EXISTS public.users
    ADD COLUMN name character varying COLLATE pg_catalog."default" NOT NULL;"#,
                )
                .await?;

                Ok(())
        }
}
