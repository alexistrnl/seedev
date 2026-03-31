import Link from "next/link"
import "./Footer.css"

export default function Footer() {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || "#"

  return (
    <footer className="ft">
      <div className="ft__top">
        <span className="ft__logo">SEEDEV</span>
        <nav className="ft__nav">
          <a href={calendlyUrl} target="_blank" rel="noopener noreferrer" className="ft__link">
            Prendre un RDV
          </a>
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
