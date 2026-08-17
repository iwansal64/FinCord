use actix_web::{HttpResponse, post, web};
use entity::registration_entries;
use sea_orm::{ColumnTrait, DatabaseConnection, DbErr, EntityTrait, QueryFilter};
use serde::Deserialize;
use validator::Validate;

#[derive(Deserialize, Validate)]
struct VerifyAccountData {
        #[validate(email)]
        email: String,
        token: String,
}

#[post("/user/register/verify")]
pub async fn user_verify(
        db: web::Data<DatabaseConnection>,
        data: web::Json<VerifyAccountData>,
) -> HttpResponse {
        // ? Validate data
        match data.validate() {
                Ok(_) => (),
                Err(err) => {
                        tracing::warn!(
                                "Failed to validate data using validator. Error: {}",
                                err.to_string()
                        );
                        return HttpResponse::BadRequest().finish();
                }
        }

        // ? Verify from the database
        let registration_entry_result: Result<Option<registration_entries::Model>, DbErr> =
                registration_entries::Entity::find()
                        .filter(registration_entries::Column::Email.eq(&data.email))
                        .one(db.get_ref())
                        .await;

        let registration_entry: registration_entries::Model = match registration_entry_result {
                Ok(data) => match data {
                        Some(model) => model,
                        None => {
                                return HttpResponse::Unauthorized().finish();
                        }
                },
                Err(err) => {
                        tracing::error!(
                                "There's an error when trying to get registration entry from database. Error: {}",
                                err.to_string()
                        );
                        return HttpResponse::InternalServerError().finish();
                }
        };

        if data.token != registration_entry.token {
                return HttpResponse::Unauthorized().finish();
        }

        // ? If verified, set user's access token
        return HttpResponse::Ok().finish();
}
