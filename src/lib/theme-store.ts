import { siteConfig } from "@/config/site"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { type TweakcnConfig, tweakcnThemes } from "./themes"

export const THEME_STORE_KEY = "theme-store"
export const BUILT_IN_THEME_PREFIX = "local:"

type ThemeMode = "dark" | "light"

type ThemeState = {
    currentMode: ThemeMode
    cssVars: {
        theme: Record<string, string>
        light: Record<string, string>
        dark: Record<string, string>
    }
}

type ThemeStore = {
    themeState: ThemeState
    selectedThemeUrl: string | null
    setThemeState: (themeState: ThemeState) => void
    setSelectedThemeUrl: (selectedThemeUrl: string | null) => void
}

const DEFAULT_THEME: TweakcnConfig =
    tweakcnThemes.find((theme) => theme.name === siteConfig.defaultTheme) || tweakcnThemes[0]
const DEFAULT_THEME_URL = `${BUILT_IN_THEME_PREFIX}${DEFAULT_THEME.name}`

const DEFAULT_THEME_STATE: ThemeState = {
    currentMode: "light",
    cssVars: DEFAULT_THEME.cssVars
}

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set) => ({
            themeState: DEFAULT_THEME_STATE,
            selectedThemeUrl: DEFAULT_THEME_URL,
            setThemeState: (themeState) => set({ themeState }),
            setSelectedThemeUrl: (selectedThemeUrl) => set({ selectedThemeUrl })
        }),
        {
            name: THEME_STORE_KEY,
            partialize: (state) => ({
                themeState: state.themeState,
                selectedThemeUrl: state.selectedThemeUrl
            })
        }
    )
)
