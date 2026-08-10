use std::{env, time::Duration};

use sea_orm::{ConnectOptions, Database, DatabaseConnection, DbErr};

use crate::utils::mail_util;

pub async fn initialize_db() -> Result<DatabaseConnection, DbErr> {
        let mut opt = ConnectOptions::new(
                env::var("DATABASE_URL").expect("DATABASE_URL must be set in the env"),
        );

        opt.max_connections(100)
                .min_connections(5)
                .connect_timeout(Duration::from_secs(8))
                .sqlx_logging(true);

        Database::connect(opt).await
}

pub fn initialize_mailer() -> lettre::AsyncSmtpTransport<lettre::Tokio1Executor> {
        mail_util::build_mailer()
}

pub fn initialize_logger() {
        tracing_subscriber::fmt()
                .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
                .json()
                .init();
}
