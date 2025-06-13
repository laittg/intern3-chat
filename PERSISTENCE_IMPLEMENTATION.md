# AI Configuration Persistence Implementation

This implementation provides proper localStorage persistence for AI configuration and user input with Zod validation to ensure data integrity.

## Features

### 1. AI Configuration Persistence
- **Selected Model**: Persists the currently selected AI model
- **Enabled Tools**: Persists which tools are enabled (e.g., web_search)
- **Zod Validation**: Ensures stored data matches expected schema
- **Graceful Fallbacks**: Returns default values when invalid data is encountered

### 2. User Input Persistence  
- **Input Text**: Persists user's draft input text
- **Auto-clear**: Clears input when chat is reset or message is sent
- **Zod Validation**: Validates input is a string

## Implementation Details

### Files Created/Modified

#### New Files:
- `src/lib/ai-persistence.ts` - Core persistence utilities with Zod validation
- `src/hooks/use-ai-config.ts` - Hook for accessing AI config outside stores

#### Modified Files:
- `src/lib/model-store.ts` - Updated to use new persistence system
- `src/lib/chat-store.ts` - Updated to persist enabledTools and input
- `src/components/multimodal-input.tsx` - Updated to initialize and sync input

### Data Structure

#### AI Configuration (`ai-config` localStorage key):
```typescript
{
  selectedModel: string | null,
  enabledTools: string[]
}
```

#### User Input (`user-input` localStorage key):
```typescript
string
```

### Key Features

1. **Type Safety**: Full TypeScript support with Zod validation
2. **Performance**: Minimal overhead with efficient persistence
3. **Reliability**: Graceful error handling and fallbacks
4. **SSR Compatible**: Proper handling of server-side rendering

### Usage Examples

#### Direct API Usage:
```typescript
import { aiConfigPersistence, userInputPersistence } from '@/lib/ai-persistence'

// AI Config
const config = aiConfigPersistence.get()
aiConfigPersistence.set({ selectedModel: 'gpt-4o', enabledTools: ['web_search'] })
aiConfigPersistence.update(current => ({ selectedModel: 'claude-3-5-sonnet' }))

// User Input
const input = userInputPersistence.get()
userInputPersistence.set('Hello world')
userInputPersistence.clear()
```

#### Hook Usage:
```typescript
import { useAIConfig } from '@/hooks/use-ai-config'

function MyComponent() {
  const { config, updateConfig, selectedModel, enabledTools } = useAIConfig()
  
  // Update configuration
  updateConfig(current => ({ selectedModel: 'new-model' }))
}
```

#### Store Integration:
The persistence is automatically integrated with the existing Zustand stores:
- `useModelStore` - Persists selectedModel
- `useChatStore` - Persists enabledTools and input

## Behavior

### Model Selection
- Model selection persists across browser sessions
- First model is auto-selected if none is persisted
- Changes are immediately saved to localStorage

### Tool Configuration  
- Enabled tools persist across sessions
- Default: `["web_search"]`
- Changes are immediately saved when tools are toggled

### User Input
- Input text is persisted as user types
- Cleared when message is sent or chat is reset
- Restored when returning to the chat

### Error Handling
- Invalid JSON → Falls back to defaults
- Schema validation failures → Falls back to defaults  
- Missing localStorage → Falls back to defaults
- SSR compatibility → Returns defaults on server

## Storage Schema Validation

All data is validated using Zod schemas before storage and retrieval:

```typescript
const aiConfigSchema = z.object({
  selectedModel: z.string().nullable(),
  enabledTools: z.array(z.string()).default(["web_search"])
})

const userInputSchema = z.string()
```

This ensures no corrupted or unexpected data can break the application.