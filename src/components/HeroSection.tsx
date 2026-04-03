import Link from "next/link"
import ScrollToContact from "./ScrollToContact"
import TypeWriter from "./TypeWriter"
import "./HeroSection.css"

const heroTypes = [
  "un site vitrine élégant.",
  "une landing page qui convertit.",
  "une application SaaS complète.",
  "un projet livré proprement.",
]

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="hero__body">
        <p className="hero__tag stag">Agence de développement web</p>

        <h1 className="hero__title">
          Vos idées méritent<br />
          <em>un site à leur hauteur.</em>
        </h1>

        <p className="hero__sub">
          Nous construisons <TypeWriter phrases={heroTypes} speed={60} pause={2500} />
        </p>

        <div className="hero__actions">
          <ScrollToContact className="btn btn--gold" />
          <Link href="/login" className="btn btn--ghost">
            Espace client
          </Link>
        </div>
      </div>

      <div className="hero__mockup" aria-hidden="true">
        <div className="mockup__bar">
          <span className="mockup__dot mockup__dot--red" />
          <span className="mockup__dot mockup__dot--yellow" />
          <span className="mockup__dot mockup__dot--green" />
          <span className="mockup__url-bar" />
        </div>

        <div className="mockup__screen">
          <div className="mockup__nav">
            <span className="mockup__nav-logo" />
            <div className="mockup__nav-links">
              <span className="mockup__nav-link" />
              <span className="mockup__nav-link" />
              <span className="mockup__nav-link" />
              <span className="mockup__nav-cta" />
            </div>
          </div>

          <div className="mockup__hero-area">
            <div className="mockup__line mockup__line--tag" />
            <div className="mockup__line mockup__line--h1-a" />
            <div className="mockup__line mockup__line--h1-b" />
            <div className="mockup__line mockup__line--sub" />
            <div className="mockup__line mockup__line--sub mockup__line--sub-short" />
            <div className="mockup__btns">
              <span className="mockup__btn mockup__btn--primary" />
              <span className="mockup__btn mockup__btn--ghost" />
            </div>
          </div>

          <div className="mockup__section-sep" />

          <div className="mockup__cards">
            {[0, 1, 2].map(i => (
              <div key={i} className="mockup__card" style={{ animationDelay: `${0.9 + i * 0.15}s` }}>
                <span className="mockup__card-accent" />
                <span className="mockup__card-line" />
                <span className="mockup__card-line mockup__card-line--short" />
              </div>
            ))}
          </div>
        </div>

        <span className="mockup__cursor" />
      </div>

    </section>
  )
}
