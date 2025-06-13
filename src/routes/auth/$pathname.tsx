import { cn } from "@/lib/utils"
import { AuthCard } from "@daveyplate/better-auth-ui"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/auth/$pathname")({
    beforeLoad: ({ params }) => {
        // Redirect settings to the new dedicated settings page
        if (params.pathname === "settings") {
            throw redirect({
                to: "/auth/settings"
            })
        }
    },
    component: RouteComponent
})

function RouteComponent() {
    const { pathname } = Route.useParams()

    return (
        <main className="flex grow flex-col items-center justify-center gap-4 p-4">
            <AuthCard pathname={pathname} />

            <p
                className={cn(
                    ["callback", "settings", "sign-out"].includes(pathname) && "hidden",
                    "text-muted-foreground text-xs"
                )}
            >
                Powered by{" "}
                <a
                    className="text-warning underline"
                    href="https://better-auth.com"
                    target="_blank"
                    rel="noreferrer"
                >
                    better-auth.
                </a>
            </p>
        </main>
    )
}
