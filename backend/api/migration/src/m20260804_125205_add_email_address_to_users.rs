use sea_orm_migration::prelude::*;

pub struct Migration;

impl MigrationName for Migration {
        fn name(&self) -> &str {
                "m20260804_125205_add_email_address_to_users"
        }
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
        async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
                let db = manager.get_connection();
                db.execute_unprepared(
                        r#"
ALTER TABLE IF EXISTS public.users
    ADD COLUMN email character varying(50) COLLATE pg_catalog."default" NOT NULL;

ALTER TABLE IF EXISTS public.users
    ALTER COLUMN email SET STORAGE PLAIN;

ALTER TABLE IF EXISTS public.users
    ALTER COLUMN email SET COMPRESSION lz4;
ALTER TABLE IF EXISTS public.users
    ADD CONSTRAINT unique_key_user_email UNIQUE (email);"#,
                )
                .await?;

                Ok(())
        }

        async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
                let db = manager.get_connection();
                db.execute_unprepared(
                        "ALTER TABLE IF EXISTS public.users DROP COLUMN IF EXISTS email;",
                )
                .await?;

                Ok(())
        }
}
