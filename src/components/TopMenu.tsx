"use client"

import Link from "next/link"
import "./TopMenu.css"

export default function TopMenu() {
  return (
    <header className="nav">
      <div className="nav__pill">
        <Link href="/" className="nav__logo">SEEDEV</Link>

        <nav className="nav__links">
          <button className="nav__link" onClick={() => document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" })}>
            Réalisations
          </button>
          <button className="nav__link" onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}>
            Services
          </button>
          <button className="nav__link" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>
            Contact
          </button>
        </nav>

        <Link href="/login" className="nav__cta">
          Espace client
        </Link>
      </div>
    </header>
  )
}
