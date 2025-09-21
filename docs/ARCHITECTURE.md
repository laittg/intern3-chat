# Architecture: Convex Usage in This Project

This document explains how the app uses Convex for data, APIs, streaming, files, settings, and analytics, plus how the frontend integrates with it.

## Overview

- Convex is the primary backend/sync layer powering chat, persistence, streaming, and auth‑backed APIs.
- Chat messages and threads are stored in Convex. Attachments are stored in Cloudflare R2 via a Convex integration.
- The frontend talks to Convex using `@convex-dev/react-query` and Convex HTTP actions.

## Data Model

- Schema and tables: `convex/schema.ts:1`
  - `threads`: per-user chats, indexes for author and project (folder), search index on title.
  - `messages`: chat content; indexes by thread and by message ID.
  - `projects`: foldering of threads; search and per-user indexes.
  - `streams`: resiliency for resumable streams.
  - `settings`: per-user settings including models/providers.
  - `usageEvents`: per-user per-day token usage.

## Chat Flow & Streaming

- Ingress (HTTP):
  - `POST /chat` — `convex/chat_http/post.route.ts:1`
    - Validates user, creates thread if needed, inserts the user message and a placeholder assistant message, streams model output, and patches the assistant message with content and token metadata.
  - `GET /chat` — `convex/chat_http/get.route.ts:1`
    - Resumes the most recent stream for a thread (SSR/lossless resume) or replays the last assistant message if the stream just completed.
  - Routes registered in `convex/http.ts:1`.

- Message persistence:
  - Initial insert (user + empty assistant): `convex/threads.ts:1` (see `createThreadOrInsertMessages`).
  - Streaming patches to assistant message: `convex/chat_http/post.route.ts:265`, `convex/chat_http/post.route.ts:406` call `internal.messages.patchMessage`.
  - Patch handler (persists parts + metadata and records usage): `convex/messages.ts:1` (`patchMessage`).

- Ownership checks on reads:
  - Public queries validate the calling user owns the thread: `convex/threads.ts:1` (`getThreadMessages`, `getThread`).

## Files & Attachments (Cloudflare R2)

- Direct upload HTTP action with validation: `convex/attachments.ts:1` (`uploadFile`).
- Metadata/list/delete APIs with auth: `convex/attachments.ts:187`, `convex/attachments.ts:200`.
- Public redirect to signed URL for retrieval: `convex/attachments.ts:264` and route in `convex/http.ts:1` (`GET /r2`).
- R2 integration via `@convex-dev/r2` using generated Convex components.

## Settings, Models, Providers

- User settings (non‑sensitive + encrypted keys) and combined provider/model view:
  - Schema: `convex/schema/settings.ts:1`.
  - Mutations/queries: `convex/settings.ts:1`.
  - Shared model registry and provider adapters: `convex/lib/models.ts:1`.

## Usage Analytics

- Token/request aggregation stored in `usageEvents` on message patch: `convex/messages.ts:1`.
- Queries for dashboards (daily/hourly breakdowns): `convex/analytics.ts:1`.

## Aggregates & Migrations

- Per‑project thread counts via TableAggregate: `convex/aggregates.ts:1`.
- Migration/backfill runner provided (opt‑in): `convex/migrations.ts:1`.

## Auth & Security

- Convex auth uses Better Auth JWTs: `convex/auth.config.ts:1`.
- CORS is enforced for HTTP actions with allowed origins from site config: `convex/http.ts:1`.
- All user‑facing queries/mutations validate ownership via `getUserIdentity`: `convex/lib/identity.ts:1`.

## Frontend Integration

- Convex client is wrapped by `@convex-dev/react-query` and connected to TanStack Query for caching:
  - Provider setup: `src/providers.tsx:1`.
  - Env: `VITE_CONVEX_URL`, `VITE_CONVEX_API_URL` (set in `.env.ok:4`).

## Vercel Platform Role

Vercel hosts the web application and a few serverless endpoints that complement the Convex backend.

- Hosting & SSR
  - Serves the React/TanStack Start frontend (built with Vite) and any SSR output.
  - Static assets are cached aggressively per `vercel.json:1` (`/assets/**`).

- Serverless API routes (non‑Convex)
  - Auth endpoints: `src/routes/api/auth/$.ts:1` mounts Better Auth defined in `src/lib/auth.ts:1` (backed by Postgres via Drizzle).
  - Analytics proxy: `src/routes/api/phr/$.ts:1` proxies PostHog to avoid CORS and hide keys.

- Site origin & CORS
  - Acts as the public site origin used by browsers.
  - Convex HTTP actions enforce allowed origins that include this domain (`convex/http.ts:1`; see “Auth & Security”).

- Env/secrets management
  - Central place to configure client/server env vars (e.g., `VITE_BETTER_AUTH_URL`, OAuth keys, `DATABASE_URL`).
  - See deployment guide: `docs/VERCEL.md:1`.

- CDN, TLS, domains
  - Provides global CDN, HTTPS, and custom domains for the UI with zero‑config deploys.

What Vercel is not doing:
- Core chat/data logic, real‑time sync, and streaming APIs are implemented in Convex (see sections above).
- Binary files live in Cloudflare R2; Vercel is not on the hot path for file bytes.

## Data Retention Notes

- Yes — chat messages are persisted in Convex per user. Anonymous sessions (when enabled) are still associated with that session’s identity and stored the same way.
- Binary file contents are not stored in Convex; only metadata/keys are persisted there. Actual bytes live in Cloudflare R2.

## Key Environment Variables

- `VITE_CONVEX_URL`: Convex deployment WebSocket URL.
- `VITE_CONVEX_API_URL`: Convex HTTP actions base URL.
- Additional provider keys (BYOK) live in settings and/or Convex config per `docs/BYOK_SETUP.md`.

## Scalability & High-Volume Operations

This section summarizes how the architecture supports very large scale (millions of users; terabytes of content) and where the mechanisms are implemented.

- Convex-backed horizontal scale
  - Convex powers data, auth-backed APIs, and real-time sync. Workloads partition naturally by user/thread and use indexes to avoid global scans. See `convex/schema.ts:1`.
  - HTTP and streaming endpoints are stateless and can scale behind a CDN/load balancer. See `convex/http.ts:1`.

- Write-efficient streaming path
  - Chat requests insert a user message and a placeholder assistant message, stream tokens to clients, and then patch the assistant once with final parts + usage metadata (avoids per-token writes). See `convex/chat_http/post.route.ts:1`, `convex/chat_http/manual_stream_transform.ts:1`, `convex/messages.ts:1`.
  - Resumable streams enable reliable SSR/rehydration without re-invoking the model, improving robustness under load and reducing duplicate work. See `convex/chat_http/get.route.ts:1`, `convex/streams.ts:1`, `convex/schema/streams.ts:1`.

- Object storage for large bytes (R2)
  - Binary attachments and model-generated assets are stored in Cloudflare R2; Convex keeps only metadata/keys. This supports “terabytes” scale outside the transactional store. See `convex/attachments.ts:1`.
  - Uploads go directly via a validated HTTP action; downloads are redirects to signed URLs, keeping app/DB out of the data path. See `convex/attachments.ts:260`, `convex/http.ts:1`.

- Indexing, search, and pagination
  - Tables are indexed by access paths used most: `threads` by author/project with a title search index; `messages` by thread/messageId. See `convex/schema.ts:1`.
  - Listing/search APIs use pagination and search indexes, combining pinned + recent only on the first page to bound result size. See `convex/threads.ts:240` and related queries.

- Compact analytics
  - Token usage is recorded as small, append-only events indexed by `(userId, daysSinceEpoch)`, enabling efficient rollups for 1d/7d/30d charts. See `convex/messages.ts:1` (insert), `convex/analytics.ts:1`, `convex/schema.ts:1`.

- Operational guardrails
  - Table aggregates maintain precomputed counts (e.g., per-folder thread counts) to avoid expensive live aggregations. See `convex/aggregates.ts:1`.
  - A migration/backfill runner exists for evolving large datasets safely. See `convex/migrations.ts:1`.

- Frontend load reduction
  - `@convex-dev/react-query` + TanStack Query provide client-side caching and live updates, cutting redundant reads. See `src/providers.tsx:1`.

- Security and multi-tenant isolation
  - Every user-facing read/write validates ownership, keeping queries per-tenant and index-prunable; CORS restricts origins to reduce abusive traffic. See `convex/lib/identity.ts:1`, `convex/http.ts:1`.

## Hot Path & Data Flow

```
Chat Streaming (Hot Path)
----------------------------------------------
[Client]
  |  POST /chat
  v
[convex/chat_http/post.route.ts]
  |--> threads.createThreadOrInsertMessages
  |      -> messages: insert(user)
  |      -> messages: insert(assistant placeholder)
  |
  |--> streams.appendStreamId
  |
  |--> streamText() -> provider
  |      -> manual_stream_transform (emit DataStream parts)
  |      -> SSE/DataStream -------------------------------> [Client]
  |
  '--> messages.patchMessage (final parts + usage)
         -> usageEvents insert


Resume / SSR
----------------------------------------------
[Client]
  |  GET /chat
  v
[convex/chat_http/get.route.ts]
  |--> streams.getStreamsByThreadId
  '--> resumableStream open?
         |-- yes -> resume stream -----------------------> [Client]
         '-- no  -> fetch last assistant message (recent) -> [Client]


Files & Assets
----------------------------------------------
[Client]
  |  POST /upload
  v
[attachments.uploadFile]
  '--> R2.store(bytes); return key

[Client]
  |  GET /r2?key
  v
[attachments.getFile]
  '--> Redirect to signed R2 URL ------------------------> [Client downloads from R2]
```

Why this scales:
- Minimizes write amplification on the hot path (stream once, patch once).
- Keeps hot queries strictly per-user/thread with indexes; no global scans.
- Moves large binary data to object storage with signed URL access paths.
- Uses compact, append-only analytics with narrow indexes.
- Employs resumable streams to reduce duplicate compute and improve reliability under heavy load.
