"use client";

import { useEffect } from "react";
import type { UIMessage } from "ai";
import type { UseChatHelpers } from "@ai-sdk/react";

export type DataPart = { type: "append-message"; message: string };

export interface Props {
  autoResume: boolean;
  initialMessages: UIMessage[];
  loadingMessages: "loading" | "error" | "ready";
  experimental_resume: UseChatHelpers["experimental_resume"];
  data: UseChatHelpers["data"];
  setMessages: UseChatHelpers["setMessages"];
}

export function useAutoResume({
  autoResume,
  initialMessages,
  loadingMessages,
  experimental_resume,
  data,
  setMessages,
}: Props) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run this once
  useEffect(() => {
    if (!autoResume) return;
    if (loadingMessages !== "ready") return;

    console.log("useAutoResume", initialMessages, loadingMessages);
    const mostRecentMessage = initialMessages.at(-1);

    if (
      mostRecentMessage?.role === "user" ||
      (mostRecentMessage?.role === "assistant" &&
        mostRecentMessage.parts?.length === 0)
    ) {
      experimental_resume();
    }

    // we intentionally run this once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMessages, initialMessages]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const dataPart = data[0] as DataPart;

    if (dataPart.type === "append-message") {
      const message = JSON.parse(dataPart.message) as UIMessage;
      setMessages([...initialMessages, message]);
    }
  }, [data, initialMessages, setMessages]);
}
