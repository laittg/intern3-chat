import { z } from "zod"

// Schema for AI configuration
const aiConfigSchema = z.object({
  selectedModel: z.string().nullable(),
  enabledTools: z.array(z.string()).default(["web_search"])
})

// Schema for user input
const userInputSchema = z.string()

export type AIConfig = z.infer<typeof aiConfigSchema>

// Keys for localStorage
const AI_CONFIG_KEY = "ai-config"
const USER_INPUT_KEY = "user-input"

// Default values
const DEFAULT_AI_CONFIG: AIConfig = {
  selectedModel: null,
  enabledTools: ["web_search"]
}

const DEFAULT_USER_INPUT = ""

// Safely parse JSON with Zod validation
function safeParseJSON<T>(value: string | null, schema: z.ZodSchema<T>, defaultValue: T): T {
  if (!value) return defaultValue
  
  try {
    const parsed = JSON.parse(value)
    const result = schema.safeParse(parsed)
    return result.success ? result.data : defaultValue
  } catch {
    return defaultValue
  }
}

// AI Config persistence
export const aiConfigPersistence = {
  get: (): AIConfig => {
    if (typeof window === "undefined") return DEFAULT_AI_CONFIG
    
    const stored = localStorage.getItem(AI_CONFIG_KEY)
    return safeParseJSON(stored, aiConfigSchema, DEFAULT_AI_CONFIG)
  },

  set: (config: AIConfig): void => {
    if (typeof window === "undefined") return
    
    try {
      // Validate before storing
      const validated = aiConfigSchema.parse(config)
      localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(validated))
    } catch {
      // If validation fails, store default
      localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(DEFAULT_AI_CONFIG))
    }
  },

  update: (updater: (current: AIConfig) => Partial<AIConfig>): void => {
    const current = aiConfigPersistence.get()
    const updates = updater(current)
    const newConfig: AIConfig = { 
      ...current, 
      ...updates,
      enabledTools: updates.enabledTools ?? current.enabledTools
    }
    aiConfigPersistence.set(newConfig)
  }
}

// User input persistence
export const userInputPersistence = {
  get: (): string => {
    if (typeof window === "undefined") return DEFAULT_USER_INPUT
    
    const stored = localStorage.getItem(USER_INPUT_KEY)
    return safeParseJSON(stored, userInputSchema, DEFAULT_USER_INPUT)
  },

  set: (input: string): void => {
    if (typeof window === "undefined") return
    
    try {
      const validated = userInputSchema.parse(input)
      localStorage.setItem(USER_INPUT_KEY, JSON.stringify(validated))
    } catch {
      localStorage.setItem(USER_INPUT_KEY, JSON.stringify(DEFAULT_USER_INPUT))
    }
  },

  clear: (): void => {
    if (typeof window === "undefined") return
    localStorage.removeItem(USER_INPUT_KEY)
  }
}