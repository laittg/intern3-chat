import type { Thread } from "@/components/threads/types"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { api } from "@/convex/_generated/api"
import { useMutation } from "convex/react"
import { Edit3, FolderInput, MoreHorizontal, Pin, Trash2 } from "lucide-react"
import { type ReactNode, useCallback } from "react"
import { toast } from "sonner"

interface ThreadActionsMenuProps {
    thread: Thread
    onOpenRenameDialog?: (thread: Thread) => void
    onOpenMoveDialog?: (thread: Thread) => void
    onOpenDeleteDialog?: (thread: Thread) => void
    onMenuOpenChange?: (open: boolean) => void
    children?: ReactNode
    align?: React.ComponentProps<typeof DropdownMenuContent>["align"]
    sideOffset?: number
}

export function ThreadActionsMenu({
    thread,
    onOpenRenameDialog,
    onOpenMoveDialog,
    onOpenDeleteDialog,
    onMenuOpenChange,
    children,
    align = "end",
    sideOffset = 4
}: ThreadActionsMenuProps) {
    const togglePinMutation = useMutation(api.threads.togglePinThread)

    const handleOpenChange = useCallback(
        (open: boolean) => {
            onMenuOpenChange?.(open)
        },
        [onMenuOpenChange]
    )

    const handleRename = useCallback(() => {
        onOpenRenameDialog?.(thread)
    }, [onOpenRenameDialog, thread])

    const handleTogglePin = useCallback(async () => {
        const pinned = Boolean(thread.pinned)
        try {
            await togglePinMutation({ threadId: thread._id })
        } catch (error) {
            console.error("Failed to toggle pin:", error)
            toast.error(`Failed to ${pinned ? "unpin" : "pin"} thread`)
        }
    }, [thread, togglePinMutation])

    const handleMove = useCallback(() => {
        onOpenMoveDialog?.(thread)
    }, [onOpenMoveDialog, thread])

    const handleDelete = useCallback(() => {
        onOpenDeleteDialog?.(thread)
    }, [onOpenDeleteDialog, thread])

    return (
        <DropdownMenu onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                {children ?? (
                    <button
                        type="button"
                        className="rounded p-1 transition-colors hover:bg-accent/40 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        aria-label="Thread actions"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align} sideOffset={sideOffset}>
                <DropdownMenuItem onClick={handleRename}>
                    <Edit3 className="h-4 w-4" />
                    Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleTogglePin}>
                    <Pin className="h-4 w-4" />
                    {thread.pinned ? "Unpin" : "Pin"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleMove}>
                    <FolderInput className="h-4 w-4" />
                    Move to folder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} variant="destructive">
                    <Trash2 className="h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
