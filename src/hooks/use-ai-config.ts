import { useEffect, useState } from "react"
import { aiConfigPersistence, type AIConfig } from "@/lib/ai-persistence"

/**
 * Hook to access persisted AI configuration outside of Zustand stores
 * Useful for components that need to read the config without subscribing to store updates
 */
export function useAIConfig() {
  const [config, setConfig] = useState<AIConfig>(() => aiConfigPersistence.get())

  useEffect(() => {
    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "ai-config") {
        setConfig(aiConfigPersistence.get())
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const updateConfig = (updater: (current: AIConfig) => Partial<AIConfig>) => {
    aiConfigPersistence.update(updater)
    setConfig(aiConfigPersistence.get())
  }

  return {
    config,
    updateConfig,
    selectedModel: config.selectedModel,
    enabledTools: config.enabledTools
  }
}