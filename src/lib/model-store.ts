import { create } from "zustand"
import { aiConfigPersistence } from "./ai-persistence"

export type ModelStore = {
    selectedModel: string | null
    setSelectedModel: (model: string | null) => void
}

export const useModelStore = create<ModelStore>((set, get) => {
    // Initialize from localStorage
    const initialConfig = aiConfigPersistence.get()
    
    return {
        selectedModel: initialConfig.selectedModel,
        setSelectedModel: (model) => {
            set({ selectedModel: model })
            // Persist to localStorage
            aiConfigPersistence.update(() => ({ selectedModel: model }))
        }
    }
})
