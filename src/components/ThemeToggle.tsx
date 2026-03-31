"use client"

import { useEffect, useState } from "react"
import "./ThemeToggle.css"

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light" | null>(null)

  useEffect(() => {
    const t = (document.documentElement.className as "dark" | "light") || "dark"
    setTheme(t)
  }, [])

  function toggle() {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    document.documentElement.className = next
    localStorage.setItem("seedev-theme", next)
  }

  if (theme === null) return null

  return (
    <button className="toggle" onClick={toggle} aria-label="Changer le thème">
      <span className="toggle__icon">{theme === "dark" ? "○" : "●"}</span>
    </button>
  )
}
