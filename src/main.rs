mod routes;

use actix_web::{App, HttpServer};
use routes::usergate::register::user_signup;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().service(user_signup))
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
