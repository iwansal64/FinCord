use actix_web::{HttpResponse, post, web};
use entity::registration_entries;
use sea_orm::{
        ActiveModelTrait,
        ActiveValue::{NotSet, Set},
        DatabaseConnection,
};
use serde::Deserialize;
use validator::Validate;

use crate::utils::{
        mail_util::{Mailer, send_verification_email, verify_email},
        token_util::generate_token,
};

#[derive(Deserialize, Validate)]
struct SignUpData {
        #[validate(email)]
        email: String,
}

#[post("/user/register")]
pub async fn user_signup(
        db: web::Data<DatabaseConnection>,
        mailer: web::Data<Mailer>,
        data: web::Json<SignUpData>,
) -> HttpResponse {
        // ? Validate data
        match data.validate() {
                Ok(_) => (),
                Err(err) => {
                        tracing::error!(
                                "Failed to validate data using validator. Error: {}",
                                err.to_string()
                        );
                        return HttpResponse::BadRequest().finish();
                }
        }

        // ? Verify email address
        match verify_email(&data.email).await {
                Ok(res) => {
                        if !res {
                                return HttpResponse::BadRequest().finish();
                        }
                }
                Err(err_str) => {
                        tracing::error!("Failed to verify email address. Error: {err_str}");
                        return HttpResponse::InternalServerError().finish();
                }
        }

        // ? Generate token
        let token: String = generate_token();

        // ? Save it to the database
        let new_registration_entry = registration_entries::ActiveModel {
                id: NotSet,
                email: Set(data.email.clone()),
                token: Set(token.clone()),
                ..Default::default()
        };
        let new_registration_entry = match new_registration_entry.save(db.get_ref()).await {
                Ok(data) => data,
                Err(err) => {
                        tracing::error!(
                                "Failed to create registration entry. Error: {}",
                                err.to_string()
                        );
                        return HttpResponse::InternalServerError().finish();
                }
        };

        // ? Send email verification
        match send_verification_email(&mailer, &data.email, &token).await {
                Ok(_) => (),
                Err(err) => {
                        if let Err(err) = new_registration_entry.delete(db.get_ref()).await {
                                tracing::error!(
                                        "Failed to delete a newly created registration entry. Error: {}",
                                        err.to_string()
                                );
                        }

                        tracing::error!(
                                "Failed to send verification email. Error: {}",
                                err.to_string()
                        );
                        return HttpResponse::InternalServerError().finish();
                }
        }

        return HttpResponse::Ok().finish();
}
