use sea_orm_migration::prelude::*;

pub struct Migration;

impl MigrationName for Migration {
        fn name(&self) -> &str {
                "m20260825_000530_change_on_delete_action_for_pending_sync_transaction"
        }
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
        async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
                let db = manager.get_connection();
                db.execute_unprepared(
                        r#"
ALTER TABLE IF EXISTS public.pending_sync_transactions DROP CONSTRAINT IF EXISTS "fk-pending_sync_transactions-transaction_id";

ALTER TABLE IF EXISTS public.pending_sync_transactions DROP CONSTRAINT IF EXISTS "fk-pending_sync_transactions-user_id";

ALTER TABLE IF EXISTS public.pending_sync_transactions
    ADD CONSTRAINT "fk-pending_sync_transactions-transaction_id" FOREIGN KEY (transaction_id)
    REFERENCES public.transaction_records (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE
    DEFERRABLE INITIALLY DEFERRED
    NOT VALID;

ALTER TABLE IF EXISTS public.pending_sync_transactions
    ADD CONSTRAINT "fk-pending_sync_transactions-user_id" FOREIGN KEY (user_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE
    DEFERRABLE INITIALLY DEFERRED
    NOT VALID;"#,
                )
                .await?;
                Ok(())
        }

        async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
                let db = manager.get_connection();
                db.execute_unprepared(
                        r#"
ALTER TABLE IF EXISTS public.pending_sync_transactions DROP CONSTRAINT IF EXISTS "fk-pending_sync_transactions-transaction_id";

ALTER TABLE IF EXISTS public.pending_sync_transactions DROP CONSTRAINT IF EXISTS "fk-pending_sync_transactions-user_id";

ALTER TABLE IF EXISTS public.pending_sync_transactions
    ADD CONSTRAINT "fk-pending_sync_transactions-transaction_id" FOREIGN KEY (transaction_id)
    REFERENCES public.transaction_records (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.pending_sync_transactions
    ADD CONSTRAINT "fk-pending_sync_transactions-user_id" FOREIGN KEY (user_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;"#,
                )
                .await?;
                Ok(())
        }
}
