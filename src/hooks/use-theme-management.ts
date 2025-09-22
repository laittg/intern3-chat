import { api } from "@/convex/_generated/api"
import { useSession } from "@/hooks/auth-hooks"
import { BUILT_IN_THEME_PREFIX, useThemeStore } from "@/lib/theme-store"
import {
    type FetchedTheme,
    type ThemePreset,
    convertToThemePreset,
    getThemeName
} from "@/lib/theme-utils"
import { tweakcnThemes } from "@/lib/themes"
import { toggleThemeMode } from "@/lib/toggle-theme-mode"
import { useMutation } from "convex/react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

export function useThemeManagement() {
    const session = useSession()
    const { themeState, setThemeState, selectedThemeUrl, setSelectedThemeUrl } = useThemeStore()
    const [searchQuery, setSearchQuery] = useState("")

    const addTheme = useMutation(api.settings.addUserTheme)
    const deleteTheme = useMutation(api.settings.deleteUserTheme)

    const fetchedThemes = useMemo<FetchedTheme[]>(
        () =>
            tweakcnThemes.map((theme) => ({
                name: getThemeName(theme, theme.name),
                preset: convertToThemePreset(theme),
                url: `${BUILT_IN_THEME_PREFIX}${theme.name}`,
                type: "built-in"
            })),
        []
    )

    const isLoadingThemes = false

    const applyThemePreset = (preset: ThemePreset) => {
        setThemeState({
            currentMode: themeState.currentMode,
            cssVars: preset.cssVars
        })
    }

    const handleThemeImported = (preset: ThemePreset, url: string) => {
        applyThemePreset(preset)
        setSelectedThemeUrl(url)

        if (!url.startsWith(BUILT_IN_THEME_PREFIX)) {
            try {
                addTheme({ url })
                toast.success("Theme imported successfully")
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to add theme")
            }
        }
    }

    const handleThemeSelect = (theme: FetchedTheme) => {
        if ("error" in theme && theme.error) {
            return
        }

        if ("preset" in theme) {
            applyThemePreset(theme.preset)
            setSelectedThemeUrl(theme.url)
        }
    }

    const handleThemeDelete = (url: string) => {
        if (url.startsWith(BUILT_IN_THEME_PREFIX)) return
        deleteTheme({ url })
        toast.success("Theme deleted successfully")
    }

    const toggleMode = () => {
        toggleThemeMode()
    }

    const randomizeTheme = () => {
        const availableThemes = fetchedThemes.filter((theme) => !("error" in theme && theme.error))
        if (availableThemes.length > 0) {
            const randomTheme = availableThemes[Math.floor(Math.random() * availableThemes.length)]
            handleThemeSelect(randomTheme)
        }
    }

    const filteredThemes = useMemo(
        () =>
            fetchedThemes.filter((theme) =>
                theme.name.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        [fetchedThemes, searchQuery]
    )

    const customThemes = filteredThemes.filter((theme) => theme.type === "custom")
    const builtInThemes = filteredThemes.filter((theme) => theme.type === "built-in")

    return {
        // State
        themeState,
        searchQuery,
        setSearchQuery,
        selectedThemeUrl,
        setSelectedThemeUrl,
        isLoadingThemes,
        fetchedThemes,
        filteredThemes,
        customThemes,
        builtInThemes,

        // Actions
        handleThemeImported,
        handleThemeSelect,
        handleThemeDelete,
        toggleMode,
        randomizeTheme,
        applyThemePreset,

        // User session
        session
    }
}
