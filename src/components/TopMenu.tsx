"use client"

import Link from "next/link"
import "./TopMenu.css"

export default function TopMenu() {
  return (
    <header className="nav">
      <Link href="/" className="nav__logo">SEEDEV</Link>
      <nav className="nav__right">
        <button
          className="nav__link"
          onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
        >
          Prendre un RDV
        </button>
        <Link href="/login" className="nav__link">Espace client</Link>
      </nav>
    </header>
  )
}
