"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const isDark = theme === "dark"

  const toggleTheme = async () => {
    const overlay = document.createElement("div")
    overlay.className = "theme-fade-overlay"
    document.body.appendChild(overlay)

    requestAnimationFrame(() => {
      overlay.classList.add("active")
    })

    setTimeout(() => {
      setTheme(isDark ? "light" : "dark")

      // Fade out
      overlay.classList.remove("active")

      setTimeout(() => {
        document.body.removeChild(overlay)
      }, 300)
    }, 300)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative h-8 w-8 overflow-hidden"
    >
      <Sun
        size={18}
        className={`absolute transition-all duration-500 ${
          isDark ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
        }`}
      />

      <Moon
        size={18}
        className={`absolute transition-all duration-500 ${
          isDark ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
        }`}
      />
    </Button>
  )
}
