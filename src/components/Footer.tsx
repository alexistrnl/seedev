"use client"

import Link from "next/link"
import "./Footer.css"

export default function Footer() {
  return (
    <footer className="ft">
      <div className="ft__top">
        <span className="ft__logo">SEEDEV</span>
        <nav className="ft__nav">
          <button
            className="ft__link"
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
          >
            Prendre un RDV
          </button>
          <Link href="/login" className="ft__link">Espace client</Link>
          <Link href="#" className="ft__link">Mentions légales</Link>
          <Link href="#" className="ft__link">CGV</Link>
        </nav>
      </div>
      <div className="ft__bottom">
        <p className="ft__copy">© {new Date().getFullYear()} Seedev. Tous droits réservés.</p>
      </div>
    </footer>
  )
}
