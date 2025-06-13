import { nanoid } from "nanoid"
import { create } from "zustand"
import { aiConfigPersistence, userInputPersistence } from "./ai-persistence"

interface ChatState {
    threadId: string | undefined
    input: string
    files: File[]
    rerenderTrigger: string
    seedNextId: string | null
    lastProcessedDataIndex: number
    shouldUpdateQuery: boolean
    skipNextDataCheck: boolean
    attachedStreamIds: Record<string, string>
    pendingStreams: Record<string, boolean>
    enabledTools: string[]
}

interface ChatActions {
    setThreadId: (threadId: string | undefined) => void
    setInput: (input: string) => void
    setFiles: (files: File[]) => void
    setSeedNextId: (id: string | null) => void
    setLastProcessedDataIndex: (index: number) => void
    setShouldUpdateQuery: (should: boolean) => void
    setSkipNextDataCheck: (skip: boolean) => void
    generateIdSeeded: () => string
    resetChat: () => void
    triggerRerender: () => void
    setAttachedStreamId: (threadId: string, streamId: string) => void
    setPendingStream: (threadId: string, pending: boolean) => void
    setEnabledTools: (tools: string[]) => void
}

export const useChatStore = create<ChatState & ChatActions>((set, get) => {
    // Initialize values from localStorage
    const initialConfig = aiConfigPersistence.get()
    const initialInput = userInputPersistence.get()

    const initialState: ChatState = {
        threadId: undefined,
        input: initialInput,
        files: [],
        rerenderTrigger: nanoid(),
        seedNextId: null,
        lastProcessedDataIndex: -1,
        shouldUpdateQuery: false,
        skipNextDataCheck: true,
        attachedStreamIds: {},
        pendingStreams: {},
        enabledTools: initialConfig.enabledTools
    }

    return {
        ...initialState,

        setThreadId: (threadId) => set({ threadId }),
        setInput: (input) => {
            set({ input })
            // Persist input to localStorage
            userInputPersistence.set(input)
        },
        setFiles: (files) => set({ files }),
        setSeedNextId: (seedNextId) => set({ seedNextId }),
        setLastProcessedDataIndex: (lastProcessedDataIndex) => set({ lastProcessedDataIndex }),
        setShouldUpdateQuery: (shouldUpdateQuery) => set({ shouldUpdateQuery }),
        setSkipNextDataCheck: (skipNextDataCheck) => set({ skipNextDataCheck }),

        generateIdSeeded: () => {
            const { seedNextId } = get()
            if (seedNextId) {
                set({ seedNextId: null })
                return seedNextId
            }
            return nanoid()
        },

        resetChat: () => {
            // Clear input from localStorage when resetting chat
            userInputPersistence.clear()
            set({
                ...initialState,
                input: "", // Reset input to empty
                rerenderTrigger: nanoid(),
                attachedStreamIds: {},
                enabledTools: get().enabledTools // Preserve current enabled tools
            })
        },

        triggerRerender: () => {
            set({ rerenderTrigger: nanoid() })
        },

        setAttachedStreamId: (threadId, streamId) => {
            if (!threadId) return
            set((state) => ({
                attachedStreamIds: {
                    ...state.attachedStreamIds,
                    [threadId]: streamId
                }
            }))
        },

        setPendingStream: (threadId, pending) => {
            if (!threadId) return
            set((state) => ({
                pendingStreams: {
                    ...state.pendingStreams,
                    [threadId]: pending
                }
            }))
        },

        setEnabledTools: (tools) => {
            set({ enabledTools: tools })
            // Persist enabled tools to localStorage
            aiConfigPersistence.update(() => ({ enabledTools: tools }))
        }
    }
})
