"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { MemoizedMarkdown } from "./memoized-markdown"

type ReasoningContextType = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

const ReasoningContext = createContext<ReasoningContextType | undefined>(undefined)

function useReasoningContext() {
    const context = useContext(ReasoningContext)
    if (!context) {
        throw new Error("useReasoningContext must be used within a Reasoning provider")
    }
    return context
}

export type ReasoningProps = {
    children: React.ReactNode
    className?: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
    isStreaming?: boolean
}
function Reasoning({ children, className, open, onOpenChange, isStreaming }: ReasoningProps) {
    const [internalOpen, setInternalOpen] = useState(false)

    const isControlled = open !== undefined
    const isOpen = isControlled ? open : internalOpen

    const handleOpenChange = (newOpen: boolean) => {
        if (!isControlled) {
            setInternalOpen(newOpen)
        }
        onOpenChange?.(newOpen)
    }

    useEffect(() => {
        if (isStreaming && !isControlled) {
            setInternalOpen(false)
        }
    }, [isStreaming, isControlled])

    return (
        <ReasoningContext.Provider
            value={{
                isOpen,
                onOpenChange: handleOpenChange
            }}
        >
            <div className={className}>{children}</div>
        </ReasoningContext.Provider>
    )
}

export type ReasoningTriggerProps = {
    children: React.ReactNode
    className?: string
    disabled?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>

function ReasoningTrigger({
    children,
    className,
    disabled = false,
    ...props
}: ReasoningTriggerProps) {
    const { isOpen, onOpenChange } = useReasoningContext()

    return (
        <button
            type="button"
            className={cn(
                "inline-flex items-center gap-1 text-muted-foreground text-sm transition-colors",
                disabled ? "cursor-default text-muted-foreground/70" : "hover:text-foreground",
                className
            )}
            aria-expanded={isOpen}
            aria-disabled={disabled}
            onClick={(event) => {
                if (disabled) {
                    event.preventDefault()
                    return
                }
                onOpenChange(!isOpen)
            }}
            {...props}
        >
            {children}
        </button>
    )
}

export type ReasoningContentProps = {
    children: React.ReactNode
    className?: string
    markdown?: boolean
    contentClassName?: string
} & React.HTMLAttributes<HTMLDivElement>

function ReasoningContent({
    children,
    className,
    contentClassName,
    markdown = false,
    ...props
}: ReasoningContentProps) {
    const contentRef = useRef<HTMLDivElement>(null)
    const innerRef = useRef<HTMLDivElement>(null)
    const { isOpen } = useReasoningContext()

    useEffect(() => {
        if (!contentRef.current || !innerRef.current) return

        const observer = new ResizeObserver(() => {
            if (contentRef.current && innerRef.current && isOpen) {
                contentRef.current.style.maxHeight = `${innerRef.current.scrollHeight}px`
            }
        })

        observer.observe(innerRef.current)

        if (isOpen) {
            contentRef.current.style.maxHeight = `${innerRef.current.scrollHeight}px`
        }

        return () => observer.disconnect()
    }, [isOpen])

    const content = markdown ? (
        <MemoizedMarkdown content={children as string} id={"reasoning-content"} />
    ) : (
        children
    )

    return (
        <div
            ref={contentRef}
            className={cn(
                "overflow-hidden transition-[max-height] duration-150 ease-out",
                className
            )}
            style={{
                maxHeight: isOpen ? contentRef.current?.scrollHeight : "0px"
            }}
            {...props}
        >
            <div
                ref={innerRef}
                className={cn(
                    "prose prose-sm dark:prose-invert text-muted-foreground",
                    contentClassName
                )}
            >
                {content}
            </div>
        </div>
    )
}

export { Reasoning, ReasoningTrigger, ReasoningContent }
