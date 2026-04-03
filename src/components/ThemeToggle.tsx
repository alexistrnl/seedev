"use client"

import { useEffect, useState } from "react"
import "./ThemeToggle.css"

export default function ThemeToggle() {
  const [warm, setWarm] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("seedev-theme")
    if (stored === "warm") {
      document.documentElement.classList.add("warm")
      setWarm(true)
    }
  }, [])

  function toggle() {
    const next = !warm
    setWarm(next)
    if (next) {
      document.documentElement.classList.add("warm")
      localStorage.setItem("seedev-theme", "warm")
    } else {
      document.documentElement.classList.remove("warm")
      localStorage.setItem("seedev-theme", "dark")
    }
  }

  return (
    <button className="tgl" onClick={toggle} aria-label="Changer le thème">
      <span className="tgl__dot" />
      <span className="tgl__label">{warm ? "Dark" : "Warm"}</span>
    </button>
  )
}
