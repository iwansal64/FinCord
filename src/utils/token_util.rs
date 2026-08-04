use rand::{RngExt, distr::Alphanumeric};

pub fn generate_token() -> String {
        let mut rng = rand::rng();
        let generated_token: String = (0..5).map(|_| rng.sample(Alphanumeric) as char).collect();
        return generated_token;
}
