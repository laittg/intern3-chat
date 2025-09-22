# Supermemory Integration

This project integrates Supermemory to provide persistent, user-scoped memory that models can read and write via function-calling tools.

## How It Works (LLM ↔ Memory)
- Trigger (when the LLM decides to use memory)
  - Per‑chat toggle: The “Supermemory” tool is enabled per conversation in the tool selector.
  - Capability check: Tools are only exposed if the selected model supports function calling.
  - Prompt priming: When enabled, the system prompt instructs the model about `add_memory` and `search_memories`, including suggested use cases. The model then chooses if/when to call them.
- Request (how the LLM asks for memory)
  - The model emits function calls with validated parameters:
    - `add_memory(content, metadata?)` to persist information.
    - `search_memories(query, limit?, category?, tags?)` to retrieve information.
  - Calls are handled server‑side by the Supermemory tool adapter.
- Serve (how results are fulfilled)
  - Key resolution: The server decrypts the user’s Supermemory API key just‑in‑time.
  - Scoping: Requests include `containerTags` that always contain `userId` plus a project scope tag (e.g. `tag:project:{projectId}` or `tag:project:none` for unfoldered chats). Optional `category:`/`tag:` entries from metadata further narrow scope.
  - API calls: Writes go through `client.memories.add(...)`; reads go through `client.search.execute(...)`.
  - Response mapping: Results are mapped to compact objects and streamed back to the model as tool outputs, which the model then incorporates into its reply.

## What It Does
- Adds two tools the model can call when enabled:
  - `add_memory`: Persist content with optional metadata for future recall.
  - `search_memories`: Semantic retrieval of previously stored content, optionally filtered.
- Scopes all memory operations to the current user and active folder via container tags.

## Where It’s Implemented
- Tools and client usage: `convex/lib/tools/supermemory.ts`
  - Creates a Supermemory client with the user’s decrypted API key.
  - `add_memory`: builds `containerTags` including `userId`, an automatic project tag derived from the thread (or `tag:project:none`), plus optional `category:`/`tag:` entries; writes via `client.memories.add`.
  - `search_memories`: queries via `client.search.execute` with the same scoped tag scheme; maps results to a compact structure.
- Toolkit registration: `convex/lib/toolkit.ts`
  - Registers the Supermemory adapter; tools are exposed only if the chat enables the `"supermemory"` ability and now receive `threadContext` so adapters can infer project scope.
- Toolkit wiring to chats: `convex/chat_http/post.route.ts`
  - Looks up the current thread, builds `threadContext` `{ threadId, projectId }`, and passes it to `getToolkit` so Supermemory can scope by folder automatically.
- Prompt wiring: `convex/chat_http/prompt.ts`
  - When `supermemory` is enabled, the system prompt explains the available memory tools and when to use them.
- Settings, storage, and key handling: `convex/settings.ts`, `convex/schema/settings.ts`
  - BYOK stored per-user at `generalProviders.supermemory` (encrypted).
  - Internal query `getSupermemoryKey` decrypts the key for server-side tool calls.
  - Full/partial settings updates support enabling/disabling and rotating the key.
- UI controls:
  - Settings card to enable/enter key: `src/components/settings/supermemory-card.tsx`.
  - Per-chat toggle in the tool selector: `src/components/tool-selector-popover.tsx`.
  - Settings route wires save flow: `src/routes/settings/ai-options.tsx`.

## Enabling Supermemory (BYOK)
1. Open Settings → AI Options → AI Memory.
2. Toggle “Enable Supermemory”, paste your Supermemory API key, and Save.
3. In a chat, open the tool selector and enable “Supermemory” for that conversation.

Notes:
- Keys are encrypted at rest in Convex and only decrypted server-side for API calls.
- If a tool is invoked without a configured/enabled key, the tool returns a friendly error.

## Data Scoping and Metadata
- All operations include a `containerTags` array of at least `[userId, tag:project:{projectId|none}]` to scope to the user and the active folder (with `tag:project:none` for unfoldered chats).
- Optional filters/metadata enrich scoping and search:
  - Category: `category:{value}`
  - Tags: `tag:{value}` (one entry per tag or metadata tag)
- `add_memory` also writes metadata (e.g., `title`, `category`, joined `tags`, `addedAt`).

## Scope of Memory
- Folder-aware by default: Memories are scoped to the user *and* the active folder. Threads in the same project automatically share memories; threads without a project share the `tag:project:none` pool.
- No recency window: Retrieval is semantic; there is no built‑in “recent only” filter unless you add one via metadata/tags.
- Default search scope: If you don’t pass additional filters, the search runs over the current folder’s pool (or the unfoldered pool).
- Narrowing scope: Add categories/tags (e.g., `category:incident`, `tag:followup`) to further partition within the folder-scoped pool.

## Folder Integration (Projects)
- Default behavior: Folder/project organization now scopes Supermemory automatically. Every request includes `tag:project:{projectId}` for folder chats or `tag:project:none` for unfoldered chats.
  - Threads carry `projectId` (folder) in the schema: `convex/schema/thread.ts`.
  - `convex/lib/tools/supermemory.ts` builds scoped tags via `buildScopedContainerTags`.
  - `convex/chat_http/post.route.ts` fetches the thread and passes `{ threadId, projectId }` into the toolkit.
- Result: Folder chats only see their own memories, and unfoldered chats share a separate pool.
- Moving threads between folders does not rewrite historical memories; consider re-saving important memories under the new scope if you need them in the new folder.

## Tool Contracts
- `add_memory` parameters:
  - `content` (string, required)
  - `metadata` (optional): `{ title?: string | null, category?: string | null, tags?: string[] | null }`
- `search_memories` parameters:
  - `query` (string, required)
  - `limit` (number, default 5, min 1, max 10)
  - `category` (string | null, optional)
  - `tags` (string[] | null, optional)

Returned shapes:
- `add_memory` → `{ success: boolean, memoryId?: string, message?: string, error?: string }`
- `search_memories` → `{ success: boolean, results?: Array<{ content, score, metadata, memoryId, createdAt }>, message?: string, error?: string }`

## Error Handling
- Missing/disabled key: returns `success: false` with a guidance message.
- API failures: caught and surfaced as `success: false` with an error message.

## Advanced
- The underlying Supermemory client supports environment-based configuration (e.g., `SUPERMEMORY_BASE_URL`), but this app passes the API key directly from per-user settings and uses the default base URL.

## Typical Call Sequence
1. User enables “Supermemory” in Settings (BYOK) and toggles it on for a chat.
2. The system prompt includes memory tool guidance; the model decides to call a tool.
3. The toolkit exposes `add_memory`/`search_memories` to the model (function calling).
4. The tool adapter fetches and decrypts the user’s key, builds `containerTags`.
5. The adapter calls Supermemory and maps the response.
6. The tool result is streamed back and used by the model to form the final answer.

## Quick Code Pointers
- Client creation and scoped tag builder: `convex/lib/tools/supermemory.ts:37`, `convex/lib/tools/supermemory.ts:83`, `convex/lib/tools/supermemory.ts:155`.
- Key decryption for tools: `convex/settings.ts:366`.
- Ability registration and thread context plumbing: `convex/lib/toolkit.ts:10`, `convex/lib/toolkit.ts:27`.
- Toolkit invocation from chat route: `convex/chat_http/post.route.ts:365`.
- Prompt layer for memory tools: `convex/chat_http/prompt.ts:97`.
- Settings UI card: `src/components/settings/supermemory-card.tsx:64`.
- Per-chat tool toggle: `src/components/tool-selector-popover.tsx:196`.
- Settings save path: `src/routes/settings/ai-options.tsx:102`.

## Troubleshooting
- The “Supermemory” toggle doesn’t appear in chat:
  - Ensure you’ve enabled Supermemory and saved a key in Settings.
- Calls return “Supermemory is not configured…”:
  - Make sure the provider is enabled and the key is set; re-save if you rotated it.
- No results from search:
  - Verify you saved memories under the same user and using the same category/tags you’re filtering by.
- Expecting folder-scoped results:
  - Folder/project scoping is automatic. If you’re not seeing expected memories, confirm the chat is in the intended folder and that the memories were added after the thread was in that folder (older memories keep their original project tag).
