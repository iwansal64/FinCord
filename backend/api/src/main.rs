mod ai_interface;
mod db_interfaces;
mod initializer;
mod routes;
mod utils;

use actix_cors::Cors;
use actix_web::{App, HttpServer, http, web};
use lettre::{AsyncSmtpTransport, Tokio1Executor};
use sea_orm::DatabaseConnection;

use crate::{
        initializer::initialize_requester,
        routes::{
                loggeduser::{
                        chat::chat_with_ai,
                        records::{
                                create_transaction_records_endpoint,
                                get_transaction_records_endpoint,
                        },
                        verify::verify_logged_user,
                },
                usergate::{
                        creation::user_create, login::user_login, register::user_signup,
                        verification::user_verify,
                },
        },
};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
        dotenvy::dotenv().expect("Something wrong when setting up environment variable");

        // ? Prepare Postgres
        let db: DatabaseConnection = initializer::initialize_db()
                .await
                .expect("There's something wrong when initializing DB");

        // ? Prepare Mailer
        let mailer: AsyncSmtpTransport<Tokio1Executor> = initializer::initialize_mailer();

        // ? Prepare reqwest for request
        let requester: reqwest::Client = initialize_requester();

        // ? Initialize Logger
        initializer::initialize_logger();

        // ? Run Server
        tracing::info!("Server starting");
        HttpServer::new(move || {
                let cors = Cors::default()
                        .allowed_origin(std::env::var("ALLOWED_ORIGIN").unwrap().as_str()) // Secure domain
                        .allowed_methods(vec!["GET", "POST"])
                        .allowed_headers(vec![
                                http::header::AUTHORIZATION,
                                http::header::ACCEPT,
                                http::header::CONTENT_TYPE,
                        ])
                        .supports_credentials()
                        .max_age(3600);

                App::new()
                        .wrap(cors)
                        .app_data(web::Data::new(db.clone()))
                        .app_data(web::Data::new(mailer.clone()))
                        .app_data(web::Data::new(requester.clone()))
                        .service(user_signup)
                        .service(user_verify)
                        .service(user_create)
                        .service(user_login)
                        .service(verify_logged_user)
                        .service(get_transaction_records_endpoint)
                        .service(create_transaction_records_endpoint)
                        .service(chat_with_ai)
        })
        .bind(("0.0.0.0", 8080))?
        .run()
        .await
}
