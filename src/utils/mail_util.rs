use chrono::{Datelike, Local};
use lettre::{
        AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor,
        message::{SinglePart, header::ContentType},
        transport::smtp::authentication::Credentials,
};
use std::env;
use trust_dns_resolver::{
        TokioAsyncResolver,
        config::{ResolverConfig, ResolverOpts},
};
use validator::ValidateEmail;

pub type Mailer = AsyncSmtpTransport<Tokio1Executor>;

pub fn build_mailer() -> Mailer {
        let smtp_host: String = env::var("SMTP_HOST").expect("SMTP_HOST must be set");
        let smtp_user: String = env::var("SMTP_USER").expect("SMTP_USER must be set");
        let smtp_pass: String = env::var("SMTP_PASS").expect("SMTP_PASS must be set");

        let creds = Credentials::new(smtp_user, smtp_pass);

        AsyncSmtpTransport::<Tokio1Executor>::relay(&smtp_host)
                .expect("Failed to create SMTP transport")
                .credentials(creds)
                .build()
}

pub async fn send_verification_email(
        mailer: &Mailer,
        to_email: &str,
        token: &str,
) -> Result<(), either::Either<lettre::transport::smtp::Error, String>> {
        let base_url: String = match env::var("BASE_URL") {
                Ok(url) => url,
                Err(_) => {
                        return Err(either::Either::Right(String::from(
                                "BASE_URL is not set! Please set it in .env!",
                        )));
                }
        };

        let verify_link: String = format!("{base_url}/verify?token={token}");
        let current_year: i32 = Local::now().year();

        let email_message: String = format!(
                r#"<div style="font-family: Arial, sans-serif; color: #333; padding-top: 48px; padding-bottom: 48px; background-color: #ccc">
        <div style="background-color: #111; max-width: 480px; padding: 24px; margin: auto; border-radius: 8px; color: #f4f4f4">
          <h2>Verify your email</h2>
          <p>We, FinCord team, welcome you to use our system!</p>
          <p>Thanks for signing up for <strong>FinCord</strong>! Please, confirm your email address by using the token below or use this link instead: {verify_link}</p>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 5px; background: #fff2; padding: 16px; text-align: center; border-radius: 8px; margin: 20px 0;">
            {token}
          </div>
          <p>If you didn't request this, you can safely ignore this message.</p>
          <hr style="margin-top: 24px;">
          <p style="font-size: 12px; color: #888;">© {current_year} FinCord. All rights reserved.</p>
        </div>
      </div>"#
        );

        let mail_box_from: lettre::message::Mailbox = match "FinCord Team <iwantest64@gmail.com>"
                .parse()
        {
                Ok(mail_box) => mail_box,
                Err(err) => {
                        return Err(either::Either::Right(format!(
                                "Error when parsing email address (from) for sending email. Error: {}",
                                err.to_string()
                        )));
                }
        };

        let mail_box_to: lettre::message::Mailbox = match to_email.parse() {
                Ok(mail_box) => mail_box,
                Err(err) => {
                        return Err(either::Either::Right(format!(
                                "Error when parsing email address (to) for sending email. Error: {}",
                                err.to_string()
                        )));
                }
        };

        let email_unsafe: Result<Message, lettre::error::Error> = Message::builder()
                .from(mail_box_from)
                .to(mail_box_to)
                .subject("Action Required: FinCord Account Registration Confirmation")
                .header(ContentType::TEXT_HTML)
                .singlepart(SinglePart::html(email_message));

        let email = match email_unsafe {
                Ok(message) => message,
                Err(err) => {
                        return Err(either::Either::Right(format!(
                                "Error when building message for sending email. Error: {}",
                                err.to_string()
                        )));
                }
        };

        mailer.send(email)
                .await
                .map_err(|err| either::Either::Left(err))?;

        Ok(())
}

pub async fn verify_email(email: &str) -> Result<bool, String> {
        // ? Verify email syntax
        if !email.validate_email() {
                return Ok(false);
        }

        // ? Dismantle email address
        let email_domain = match email.split('@').last() {
                Some(res) => res,
                None => {
                        return Err(format!("Can't get the domain name from string: {email}"));
                }
        };

        // ? Resolve if the mail domain active
        let resolver = TokioAsyncResolver::tokio(ResolverConfig::google(), ResolverOpts::default());
        match resolver.mx_lookup(email_domain).await {
                Ok(_) => (),
                Err(_) => match resolver.lookup_ip(email_domain).await {
                        Ok(ip_lookup) => {
                                let ips: Vec<_> = ip_lookup.iter().collect();
                                if !ips.is_empty() {
                                        ()
                                } else {
                                        return Ok(false);
                                }
                        }
                        Err(_) => {
                                return Ok(false);
                        }
                },
        };

        // ? Return true if the email checks all steps
        return Ok(true);
}
