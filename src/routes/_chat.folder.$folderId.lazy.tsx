import { FolderHero } from "@/components/folder-hero"
import { Messages } from "@/components/messages"
import { MultimodalInput } from "@/components/multimodal-input"
import { SignupMessagePrompt } from "@/components/signup-message-prompt"
import { StickToBottomButton } from "@/components/stick-to-bottom-button"
import { ThreadActionsMenu } from "@/components/threads/thread-actions-menu"
import { ThreadItemDialogs } from "@/components/threads/thread-item-dialogs"
import type { Thread } from "@/components/threads/types"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { MODELS_SHARED } from "@/convex/lib/models"
import { useSession } from "@/hooks/auth-hooks"
import { useChatActions } from "@/hooks/use-chat-actions"
import { useChatDataProcessor } from "@/hooks/use-chat-data-processor"
import { useChatIntegration } from "@/hooks/use-chat-integration"
import { useDynamicTitle } from "@/hooks/use-dynamic-title"
import { useFunction } from "@/hooks/use-function"
import { useThreadSync } from "@/hooks/use-thread-sync"
import type { UploadedFile } from "@/lib/chat-store"
import { getChatWidthClass, useChatWidthStore } from "@/lib/chat-width-store"
import { useDiskCachedPaginatedQuery, useDiskCachedQuery } from "@/lib/convex-cached-query"
import { useModelStore } from "@/lib/model-store"
import { useThemeStore } from "@/lib/theme-store"
import { cn } from "@/lib/utils"
import { Link } from "@tanstack/react-router"
import { useLocation } from "@tanstack/react-router"
import { createLazyFileRoute } from "@tanstack/react-router"
import { format } from "date-fns"
import { Pin } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useStickToBottom } from "use-stick-to-bottom"

interface FolderChatProps {
    folderId: Id<"projects">
}

const FolderChat = ({ folderId }: FolderChatProps) => {
    const { selectedModel, setSelectedModel } = useModelStore()
    const { threadId } = useThreadSync({ routeThreadId: undefined })
    const { scrollToBottom, isAtBottom, contentRef, scrollRef } = useStickToBottom({
        initial: "instant",
        resize: "instant"
    })
    const { themeState } = useThemeStore()
    const mode = themeState.currentMode
    const { data: session, isPending } = useSession()
    const location = useLocation()

    useDynamicTitle({ threadId })

    useMemo(() => {
        if (!selectedModel && MODELS_SHARED.length > 0) {
            setSelectedModel(MODELS_SHARED[0].id)
        }
    }, [selectedModel, setSelectedModel])

    const projects = useDiskCachedQuery(
        api.folders.getUserProjects,
        {
            key: "projects",
            default: []
        },
        session?.user?.id ? {} : "skip"
    )
    const project =
        "error" in projects ? null : projects?.find((project) => project._id === folderId)

    const { status, data, messages } = useChatIntegration({
        threadId,
        folderId
    })

    const { handleInputSubmit, handleRetry, handleEditAndRetry } = useChatActions({
        threadId,
        folderId
    })

    useChatDataProcessor({ data, messages })

    const handleInputSubmitWithScroll = (inputValue?: string, fileValues?: UploadedFile[]) => {
        handleInputSubmit(inputValue, fileValues)
        scrollToBottom({ animation: "smooth" })
    }

    const isEmpty = !threadId && messages.length === 0

    if (!session?.user && !isPending) {
        return (
            <div className="relative flex h-[calc(100dvh-64px)] items-center justify-center">
                <SignupMessagePrompt />
            </div>
        )
    }

    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showRenameDialog, setShowRenameDialog] = useState(false)
    const [showMoveDialog, setShowMoveDialog] = useState(false)
    const [currentThread, setCurrentThread] = useState<Thread | null>(null)

    const handleOpenRenameDialog = useFunction((thread: Thread) => {
        setCurrentThread(thread)
        setShowRenameDialog(true)
    })

    const handleOpenMoveDialog = useFunction((thread: Thread) => {
        setCurrentThread(thread)
        setShowMoveDialog(true)
    })

    const handleOpenDeleteDialog = useFunction((thread: Thread) => {
        setCurrentThread(thread)
        setShowDeleteDialog(true)
    })

    const handleCloseRenameDialog = useFunction(() => {
        setShowRenameDialog(false)
    })

    const handleCloseMoveDialog = useFunction(() => {
        setShowMoveDialog(false)
    })

    const handleCloseDeleteDialog = useFunction(() => {
        setShowDeleteDialog(false)
    })

    useEffect(() => {
        if (!showRenameDialog && !showMoveDialog && !showDeleteDialog) {
            const timeout = setTimeout(() => setCurrentThread(null), 150)
            return () => clearTimeout(timeout)
        }
    }, [showDeleteDialog, showMoveDialog, showRenameDialog])

    const projectsList = "error" in projects ? [] : projects

    // Recent threads component for FolderHero
    const RecentThreads = () => {
        const isRootPath = location.pathname === "/"

        // Fetch recent threads in this folder
        const recentThreads = useDiskCachedPaginatedQuery(
            api.threads.getThreadsByProject,
            {
                key: `threads-folder-${folderId}`,
                maxItems: 25
            },
            { projectId: folderId },
            {
                initialNumItems: 25
            }
        )
        const scrollRef = useRef<HTMLDivElement>(null)

        useEffect(() => {
            const target = scrollRef.current
            if (!target) return

            const observer = new IntersectionObserver(
                (entries) => {
                    const [entry] = entries
                    if (entry.isIntersecting && recentThreads.status === "CanLoadMore") {
                        recentThreads.loadMore(25)
                    }
                },
                {
                    threshold: 0.1,
                    rootMargin: "100px"
                }
            )

            observer.observe(target)

            return () => {
                observer.disconnect()
            }
        }, [recentThreads.status])

        const threads = (recentThreads?.results || []) as Thread[]

        const containerAnimProps = isRootPath
            ? {
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.3, delay: 0.1 }
              }
            : {}

        if (threads.length === 0) return null

        return (
            <motion.div {...containerAnimProps} className="mt-8 w-full px-1">
                <div className="mb-4 flex items-center gap-2 font-medium text-muted-foreground text-sm">
                    Threads in this folder
                </div>
                <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
                    {threads.map((thread, index) => {
                        const threadAnimProps = isRootPath
                            ? {
                                  initial: { opacity: 0, x: -10 },
                                  animate: { opacity: 1, x: 0 },
                                  transition: { duration: 0.2, delay: 0.05 * index }
                              }
                            : {}

                        return (
                            <motion.div key={thread._id} {...threadAnimProps}>
                                <div className="flex items-center justify-between gap-3 rounded-lg border bg-background/50 px-4 py-3 transition-colors hover:bg-accent/50">
                                    <Link
                                        to="/thread/$threadId"
                                        params={{ threadId: thread._id }}
                                        className="min-w-0 flex-1 text-left"
                                    >
                                        <div className="truncate font-medium text-sm">
                                            {thread.title}
                                        </div>
                                        <div className="text-muted-foreground text-xs">
                                            {format(thread.createdAt, "MMM d, yyyy")}
                                        </div>
                                    </Link>
                                    <div className="ml-2 flex items-center gap-1 text-muted-foreground">
                                        {thread.pinned && <Pin className="h-4 w-4" />}
                                        <ThreadActionsMenu
                                            thread={thread}
                                            onOpenRenameDialog={handleOpenRenameDialog}
                                            onOpenMoveDialog={handleOpenMoveDialog}
                                            onOpenDeleteDialog={handleOpenDeleteDialog}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                    <div ref={scrollRef} className="col-span-full" />
                </div>
            </motion.div>
        )
    }

    const chatWidth = useChatWidthStore((state) => state.chatWidthState.chatWidth)

    return (
        <div
            className={cn(
                "relative flex flex-col",
                isEmpty ? "h-[calc(100dvh-8px)]" : "h-[calc(100dvh-64px)]"
            )}
        >
            <Messages
                messages={messages}
                onRetry={handleRetry}
                onEditAndRetry={handleEditAndRetry}
                status={status}
                contentRef={contentRef}
                scrollRef={scrollRef}
            />

            <AnimatePresence mode="sync">
                {isEmpty ? (
                    <motion.div
                        key="centered-content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className={cn(
                            "absolute inset-0 flex flex-col items-center overflow-y-auto [scrollbar-gutter:stable]",
                            !isEmpty && "justify-center"
                        )}
                    >
                        <div
                            className={cn(
                                "w-full",
                                getChatWidthClass(chatWidth),
                                "px-4",
                                "flex min-h-[40vh] flex-col justify-end"
                            )}
                        >
                            <FolderHero project={project} />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className="mt-8 w-full"
                            >
                                <MultimodalInput
                                    onSubmit={handleInputSubmitWithScroll}
                                    status={status}
                                />
                            </motion.div>
                        </div>
                        <div className={cn("w-full", getChatWidthClass(chatWidth), "px-4")}>
                            <RecentThreads />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="bottom-input"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="-bottom-[3.875rem] md:-bottom-10 absolute inset-x-0 z-[10] flex flex-col items-center justify-center gap-2"
                    >
                        <StickToBottomButton
                            isAtBottom={isAtBottom}
                            scrollToBottom={scrollToBottom}
                        />
                        <MultimodalInput onSubmit={handleInputSubmitWithScroll} status={status} />
                    </motion.div>
                )}
            </AnimatePresence>
            <ThreadItemDialogs
                showDeleteDialog={showDeleteDialog}
                showRenameDialog={showRenameDialog}
                showMoveDialog={showMoveDialog}
                onCloseDeleteDialog={handleCloseDeleteDialog}
                onCloseRenameDialog={handleCloseRenameDialog}
                onCloseMoveDialog={handleCloseMoveDialog}
                currentThread={currentThread}
                projects={projectsList}
            />
        </div>
    )
}

export const Route = createLazyFileRoute("/_chat/folder/$folderId")({
    component: () => {
        const { folderId } = Route.useParams()
        return <FolderChat folderId={folderId as Id<"projects">} />
    }
})
