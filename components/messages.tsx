import { cn } from "@/lib/utils"
import type { UIMessage } from "ai"

export function Messages({ messages }: { messages: UIMessage[] }) {
    return (
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={cn(
                        "flex flex-col gap-2",
                        message.role === "user" &&
                            "ml-auto w-fit max-w-md rounded-xl bg-primary px-2.5 py-1.5 text-primary-foreground"
                    )}
                >
                    {message.content}
                </div>
            ))}
        </div>
    )
}
