import { ChatInput } from "@/components/chat-input";
import { Messages } from "@/components/messages";
import { api } from "@/convex/_generated/api";
import { useChatActions } from "@/hooks/use-chat-actions";
import { useChatDataProcessor } from "@/hooks/use-chat-data-processor";
import { useChatIntegration } from "@/hooks/use-chat-integration";
import { useThreadSync } from "@/hooks/use-thread-sync";
import { useModelStore } from "@/lib/model-store";
import { useChatStore } from "@/lib/chat-store";
import { useQuery as useConvexQuery } from "convex/react";
import type { UIMessage } from "ai";

interface ChatProps {
  threadId: string | undefined;
}

export function Chat({ threadId: routeThreadId }: ChatProps) {
  const { selectedModel, setSelectedModel } = useModelStore();
  const { threadId } = useThreadSync({ routeThreadId });
  const { setEditMode, setEditFromMessageId } = useChatStore();

  const models = useConvexQuery(api.models.getModels, {}) ?? [];
  if (!selectedModel && models.length > 0) {
    setSelectedModel(models[0]?.id ?? "");
  }

  const { status, append, stop, data, messages, setMessages } =
    useChatIntegration({
      threadId,
    });

  const { handleInputSubmit } = useChatActions({
    append,
    stop,
    status,
  });

  useChatDataProcessor({ data, messages });

  const handleRetry = (message: UIMessage) => {
    const textContent = message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n");

    const messageIndex = messages.findIndex((m) => m.id === message.id);
    if (messageIndex === -1) return;

    const messagesUpToRetry = messages.slice(0, messageIndex);
    setMessages(messagesUpToRetry);

    handleInputSubmit(textContent);
  };

  const handleUpdateMessage = (messageId: string, newContent: string) => {
    const updatedMessages = messages.map((message) => {
      if (message.id === messageId) {
        return {
          ...message,
          content: newContent,
          parts: [{ type: "text" as const, text: newContent }],
        };
      }
      return message;
    });
    setMessages(updatedMessages);
  };

  const handleEditAndRetry = (messageId: string, newContent: string) => {
    // Find the message index and truncate everything after it
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    // Truncate messages and update the edited message
    const messagesUpToEdit = messages.slice(0, messageIndex);
    const updatedEditedMessage = {
      ...messages[messageIndex],
      content: newContent,
      parts: [{ type: "text" as const, text: newContent }],
    };

    setMessages([...messagesUpToEdit, updatedEditedMessage]);
    setEditMode(true);
    setEditFromMessageId(messageId);

    // Use append directly with the same message ID to avoid creating duplicates
    append({
      id: messageId, // Reuse the original message ID
      role: "user",
      content: newContent,
      parts: [{ type: "text", text: newContent }],
      createdAt: new Date(),
    });
  };

  return (
    <div className="relative mb-80 flex h-[calc(100vh-64px)] flex-col">
      <Messages
        messages={messages}
        onRetry={handleRetry}
        onUpdateMessage={handleUpdateMessage}
        onEditAndRetry={handleEditAndRetry}
      />
      <ChatInput onSubmit={handleInputSubmit} status={status} />
    </div>
  );
}
