"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-3xl bg-secondary hover:bg-secondary/80"
    >
      {theme === "dark" ? <SunIcon/> : <MoonIcon/>}
    </button>
  )
}