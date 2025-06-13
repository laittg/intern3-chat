import { nanoid } from "nanoid";
import { create } from "zustand";

interface ChatState {
  threadId: string | undefined;
  input: string;
  files: File[];
  rerenderTrigger: string;
  seedNextId: string | null;
  lastProcessedDataIndex: number;
  shouldUpdateQuery: boolean;
  skipNextDataCheck: boolean;
  attachedStreamIds: Record<string, string>;
  pendingStreams: Record<string, boolean>;
  enabledTools: string[];
  editMode: boolean;
  editFromMessageId: string | null;
}

interface ChatActions {
  setThreadId: (threadId: string | undefined) => void;
  setInput: (input: string) => void;
  setFiles: (files: File[]) => void;
  setSeedNextId: (id: string | null) => void;
  setLastProcessedDataIndex: (index: number) => void;
  setShouldUpdateQuery: (should: boolean) => void;
  setSkipNextDataCheck: (skip: boolean) => void;
  generateIdSeeded: () => string;
  resetChat: () => void;
  triggerRerender: () => void;
  setAttachedStreamId: (threadId: string, streamId: string) => void;
  setPendingStream: (threadId: string, pending: boolean) => void;
  setEnabledTools: (tools: string[]) => void;
  setEditMode: (editMode: boolean) => void;
  setEditFromMessageId: (messageId: string | null) => void;
}

const initialState: ChatState = {
  threadId: undefined,
  input: "",
  files: [],
  rerenderTrigger: nanoid(),
  seedNextId: null,
  lastProcessedDataIndex: -1,
  shouldUpdateQuery: false,
  skipNextDataCheck: true,
  attachedStreamIds: {},
  pendingStreams: {},
  enabledTools: ["web_search"],
  editMode: false,
  editFromMessageId: null,
};

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  ...initialState,

  setThreadId: (threadId) => set({ threadId }),
  setInput: (input) => set({ input }),
  setFiles: (files) => set({ files }),
  setSeedNextId: (seedNextId) => set({ seedNextId }),
  setLastProcessedDataIndex: (lastProcessedDataIndex) =>
    set({ lastProcessedDataIndex }),
  setShouldUpdateQuery: (shouldUpdateQuery) => set({ shouldUpdateQuery }),
  setSkipNextDataCheck: (skipNextDataCheck) => set({ skipNextDataCheck }),

  generateIdSeeded: () => {
    const { seedNextId } = get();
    if (seedNextId) {
      set({ seedNextId: null });
      return seedNextId;
    }
    return nanoid();
  },

  resetChat: () => {
    set({
      ...initialState,
      rerenderTrigger: nanoid(),
      attachedStreamIds: {},
      editMode: false,
      editFromMessageId: null,
    });
  },

  triggerRerender: () => {
    set({ rerenderTrigger: nanoid() });
  },

  setAttachedStreamId: (threadId, streamId) => {
    if (!threadId) return;
    set((state) => ({
      attachedStreamIds: {
        ...state.attachedStreamIds,
        [threadId]: streamId,
      },
    }));
  },

  setPendingStream: (threadId, pending) => {
    if (!threadId) return;
    set((state) => ({
      pendingStreams: {
        ...state.pendingStreams,
        [threadId]: pending,
      },
    }));
  },

  setEnabledTools: (tools) => {
    set({ enabledTools: tools });
  },

  setEditMode: (editMode) => {
    set({ editMode });
  },

  setEditFromMessageId: (editFromMessageId) => {
    set({ editFromMessageId });
  },
}));
