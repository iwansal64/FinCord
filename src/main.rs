mod initializer;
mod routes;
mod utils;

use actix_web::{App, HttpServer, web};
use routes::usergate::register::user_signup;
use sea_orm::DatabaseConnection;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
        dotenvy::dotenv().expect("Something wrong when setting up environment variable");

        // ? Prepare Postgres
        let db: DatabaseConnection = initializer::initialize_db()
                .await
                .expect("There's something wrong when initializing DB");

        // ? Prepare Mailer
        let mailer = initializer::initialize_mailer();

        // ? Initialize Logger
        initializer::initialize_logger();

        // ? Run Server
        tracing::info!("Server starting");
        HttpServer::new(move || {
                App::new()
                        .app_data(web::Data::new(db.clone()))
                        .app_data(web::Data::new(mailer.clone()))
                        .service(user_signup)
        })
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
