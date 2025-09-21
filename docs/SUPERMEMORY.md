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
  - Scoping: Requests include `containerTags` that always contain `userId` and may add `category:`/`tag:` entries to further narrow scope.
  - API calls: Writes go through `client.memories.add(...)`; reads go through `client.search.execute(...)`.
  - Response mapping: Results are mapped to compact objects and streamed back to the model as tool outputs, which the model then incorporates into its reply.

## What It Does
- Adds two tools the model can call when enabled:
  - `add_memory`: Persist content with optional metadata for future recall.
  - `search_memories`: Semantic retrieval of previously stored content, optionally filtered.
- Scopes all memory operations to the current user via container tags.

## Where It’s Implemented
- Tools and client usage: `convex/lib/tools/supermemory.ts`
  - Creates a Supermemory client with the user’s decrypted API key.
  - `add_memory`: builds `containerTags` including `userId`, plus optional `category:` and `tag:` entries; writes via `client.memories.add`.
  - `search_memories`: queries via `client.search.execute` with the same tag scheme; maps results to a compact structure.
- Toolkit registration: `convex/lib/toolkit.ts`
  - Registers the Supermemory adapter; tools are exposed only if the chat enables the `"supermemory"` ability.
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
- All operations include a `containerTags` array to scope to the current user: `[userId, ...]`.
- Optional filters enrich scoping and search:
  - Category: `category:{value}`
  - Tags: `tag:{value}` (one entry per tag)
- `add_memory` also writes metadata (e.g., `title`, `category`, joined `tags`, `addedAt`).

## Scope of Memory
- User-wide: Memories are scoped to the user and available across all chats where Supermemory is enabled (not limited to a single thread).
- No recency window: Retrieval is semantic; there is no built‑in “recent only” filter unless you add one via metadata/tags.
- Default search scope: If you don’t pass `category`/`tags`, the search runs over all of the user’s memories.
- Narrowing scope: Use categories/tags (e.g., `category:project-x`, `tag:thread:{threadId}`) when writing, and pass the same filters on search to restrict recall.

## Folder Integration (Projects)
- Current behavior: Folder/project organization of chats does not automatically scope Supermemory operations. The adapter does not inject folder or thread tags.
  - Threads carry `projectId` (folder) in the schema: `convex/schema/thread.ts`.
  - The Supermemory adapter only includes `[userId, ...optional category/tags]` in `containerTags`: `convex/lib/tools/supermemory.ts`.
- Result: Unless you provide filters, `search_memories` runs over the user’s entire memory space (user-wide), not the current folder.
- How to achieve folder-scoped memory (optional pattern):
  - On write (`add_memory`): include tags like `tag:project:{projectId}` and `tag:thread:{threadId}`; optionally set `category:project-{projectId}`.
  - On read (`search_memories`): pass the same tags (or category) to restrict recall to the current folder and/or thread.
  - Where to implement: Extend the toolkit/context so the Supermemory adapter receives `threadId` (and can look up `projectId`) and appends these tags by default.
    - Adapter code to update: `convex/lib/tools/supermemory.ts` (build `containerTags` for both add/search).
    - Thread/folder context sources: `convex/chat_http/post.route.ts` (chat request includes thread info), `convex/threads.ts` (threads store `projectId`).
  - Prompt note: Consider documenting in the system prompt that searches are folder-scoped by default and how to broaden scope if needed.

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
- Client creation and calls: `convex/lib/tools/supermemory.ts:47`, `convex/lib/tools/supermemory.ts:117`, `convex/lib/tools/supermemory.ts:59`, `convex/lib/tools/supermemory.ts:129`.
- Key decryption for tools: `convex/settings.ts:366`.
- Ability registration: `convex/lib/toolkit.ts:11`.
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
   - Folder/project scoping is not automatic. Ensure you’re writing memories with `tag:project:{projectId}` (and/or `tag:thread:{threadId}`) and passing the same tags on `search_memories`, or update the adapter to inject these by default.
