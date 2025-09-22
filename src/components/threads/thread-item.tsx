import { ThreadActionsMenu } from "@/components/threads/thread-actions-menu"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Link } from "@tanstack/react-router"
import { useParams } from "@tanstack/react-router"
import equal from "fast-deep-equal/es6"
import { MoreHorizontal } from "lucide-react"
import { memo, useState } from "react"
import type { Thread } from "./types"

interface ThreadItemProps {
    thread: Thread
    isInFolder?: boolean
    onOpenRenameDialog?: (thread: Thread) => void
    onOpenMoveDialog?: (thread: Thread) => void
    onOpenDeleteDialog?: (thread: Thread) => void
}

export const ThreadItem = memo(
    ({
        thread,
        isInFolder = false,
        onOpenRenameDialog,
        onOpenMoveDialog,
        onOpenDeleteDialog
    }: ThreadItemProps) => {
        const [isMenuOpen, setIsMenuOpen] = useState(false)

        const params = useParams({ strict: false }) as { threadId?: string }
        const isActive = params.threadId === thread._id

        return (
            <SidebarMenuItem className={isInFolder ? "pl-6" : ""}>
                <div
                    className={cn(
                        "group/item flex w-full items-center rounded-sm hover:bg-accent/50",
                        isMenuOpen && "bg-accent/50",
                        isActive && "bg-accent/60"
                    )}
                >
                    <SidebarMenuButton
                        asChild
                        className={cn("flex-1 hover:bg-transparent", isActive && "text-foreground")}
                    >
                        <Link
                            to="/thread/$threadId"
                            params={{ threadId: thread._id }}
                            className="flex items-center justify-between"
                        >
                            <span className="truncate">{thread.title}</span>

                            <ThreadActionsMenu
                                thread={thread}
                                onOpenRenameDialog={onOpenRenameDialog}
                                onOpenMoveDialog={onOpenMoveDialog}
                                onOpenDeleteDialog={onOpenDeleteDialog}
                                onMenuOpenChange={setIsMenuOpen}
                            >
                                <button
                                    type="button"
                                    className={cn(
                                        "rounded p-1 transition-opacity",
                                        isMenuOpen || "opacity-0 group-hover/item:opacity-100"
                                    )}
                                    aria-label="Thread actions"
                                >
                                    <MoreHorizontal className="mr-1 h-4 w-4" />
                                </button>
                            </ThreadActionsMenu>
                        </Link>
                    </SidebarMenuButton>
                </div>
            </SidebarMenuItem>
        )
    },
    (prevProps, nextProps) => {
        return (
            equal(prevProps.thread, nextProps.thread) &&
            prevProps.isInFolder === nextProps.isInFolder
        )
    }
)

ThreadItem.displayName = "ThreadItem"
