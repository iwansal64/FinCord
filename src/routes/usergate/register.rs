use actix_web::{HttpResponse, post, web};

#[derive(serde::Deserialize)]
struct SignUpData {
    email: Option<String>,
    username: Option<String>,
    password: Option<String>,
}

#[post("/user/register")]
pub async fn user_signup(_: web::Json<SignUpData>) -> HttpResponse {
    return HttpResponse::Ok().finish();
}
