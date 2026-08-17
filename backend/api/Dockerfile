FROM rust:1.97.1
WORKDIR /app

RUN cargo install bacon

COPY . .

EXPOSE 8080
CMD ["bacon", "--headless"]