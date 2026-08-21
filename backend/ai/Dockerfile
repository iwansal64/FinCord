# ----------------- Stage 1: Build Stage -----------------
FROM python:3.12-slim AS builder

# Install uv by copying it directly from the official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set critical environment variables for optimal container behavior
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ROOT=/app

WORKDIR /app

# 1. Install dependencies first to maximize Docker layer caching
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    uv sync --frozen --no-install-project --no-dev

# 2. Add the rest of the application files and sync the project
ADD . /app
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev


# ----------------- Stage 2: Runtime Stage -----------------
FROM python:3.12-slim

WORKDIR /app

# Copy the virtual environment containing installed packages from the builder stage
COPY --from=builder /app/.venv /app/.venv

# Prepend the virtual environment binaries to the PATH so python defaults to it
ENV PATH="/app/.venv/bin:$PATH"

# (Optional) Expose your application port (e.g., for FastAPI/Flask/Django)
EXPOSE 8000

# Run your application directly using the venv's executable
CMD ["uv", "run", "fincord_chatbot_ai"]