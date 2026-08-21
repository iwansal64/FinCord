use sea_orm_migration::prelude::*;

pub struct Migration;

impl MigrationName for Migration {
        fn name(&self) -> &str {
                "m20260820_065041_add_pending_sync_transactions_table"
        }
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
        async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
                let db = manager.get_connection();
                db.execute_unprepared(
                        r#"
                        CREATE TABLE IF NOT EXISTS public.pending_sync_transactions
(
    user_id integer NOT NULL,
    transaction_id integer NOT NULL,
    CONSTRAINT "fk-pending_sync_transactions-transaction_id" FOREIGN KEY (transaction_id)
        REFERENCES public.transaction_records (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT "fk-pending_sync_transactions-user_id" FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.pending_sync_transactions
    OWNER to postgres;
CREATE INDEX IF NOT EXISTS "fki_fk-pending_sync_transactions-transaction_id"
    ON public.pending_sync_transactions USING btree
    (transaction_id ASC NULLS LAST)
    TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS "fki_fk-pending_sync_transactions-user_id"
    ON public.pending_sync_transactions USING btree
    (user_id ASC NULLS LAST)
    TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.transaction_records DROP COLUMN IF EXISTS is_already_embedded;"#,
                )
                .await?;

                Ok(())
        }

        async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
                let db = manager.get_connection();
                db.execute_unprepared(
                        r#"
DROP TABLE IF EXISTS public.pending_sync_transactions CASCADE;

ALTER TABLE IF EXISTS public.transaction_records
    ADD COLUMN is_already_embedded boolean NOT NULL DEFAULT false;"#,
                )
                .await?;

                Ok(())
        }
}
