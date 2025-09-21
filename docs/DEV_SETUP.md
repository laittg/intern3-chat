# Local Development Setup

Configure a full local environment with Docker services and Convex.

## Prerequisites

* **Docker Desktop** (MinIO, Redis, etc.).
* **Bun** (primary package manager/runtime) → [bun.sh](https://bun.sh).
* **Upstash account** (for remote Redis).
* (Optional) **pnpm** (already bundled via `bunx`).

## 1. Environment variables

Copy `.env.example` → `.env` and fill `<missing values>`.

## 2. Install dependencies

```sh
bun install
```

## 3. Start infrastructure

```sh
docker compose up
```

Use `docker compose down -v` to reset local state.

## 4. Run auth migrations

```sh
pnpm auth:migrate
```

## 5. Start Convex (local)

```sh
# Install Convex CLI
bun install -g convex

# Login to Convex
bunx convex login

# Start dev server
bunx convex dev --local
```

Do **not** edit the generated `env.local`. Use the CLI to set variables.

## 6. Seed Convex environment

Run while Convex is running (first run or after secrets change):

```sh
bunx convex env set VITE_BETTER_AUTH_URL "http://localhost:3000"
bunx convex env set UPSTASH_REDIS_REST_URL "<url>"
bunx convex env set UPSTASH_REDIS_REST_TOKEN "<token>"
bunx convex env set ENCRYPTION_KEY "<.env value>"

bunx convex env set OPENAI_API_KEY "sk-..."
bunx convex env set GOOGLE_GENERATIVE_AI_API_KEY "AI..."
bunx convex env set R2_FORCE_PATH_STYLE true
bunx convex env set R2_BUCKET intern3-user-files
bunx convex env set R2_ENDPOINT "http://localhost:9000"
bunx convex env set R2_ACCESS_KEY_ID "minioadmin"
bunx convex env set R2_SECRET_ACCESS_KEY "minioadmin"
```

Ensure these values are consistent with your `.env` file.

To switch to remote Convex: delete `env.local` and rerun without `--local`.

## 7. Run the app

```sh
bun dev
```

Available at `http://localhost:3000`.

## Reset environment

```sh
docker compose down -v
```

Then restart from step 2.

## Troubleshooting

* **Convex missing vars** → ensure CLI is running while setting env vars.
* **Docker/MinIO issues** → confirm Docker Desktop is running; restart if needed.
* **Auth migration fails** → restart Docker, retry `pnpm auth:migrate`, check `.env`.
