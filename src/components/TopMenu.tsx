"use client"

import Link from "next/link"
import ThemeToggle from "./ThemeToggle"
import "./TopMenu.css"

export default function TopMenu() {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || "#"

  return (
    <header className="nav">
      <Link href="/" className="nav__logo">SEEDEV</Link>
      <nav className="nav__right">
        <a href={calendlyUrl} target="_blank" rel="noopener noreferrer" className="nav__link">
          Prendre un RDV
        </a>
        <Link href="/login" className="nav__link">Espace client</Link>
        <ThemeToggle />
      </nav>
    </header>
  )
}
