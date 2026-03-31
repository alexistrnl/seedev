import Link from "next/link"
import "./HeroSection.css"

export default function HeroSection() {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || "#"

  return (
    <section className="hero">
      <div className="hero__body">
        <p className="hero__tag stag">Agence de développement web</p>

        <h1 className="hero__title">
          Vos projets web,<br />
          <em>développés avec soin.</em>
        </h1>

        <p className="hero__sub">
          Seedev conçoit et développe des sites vitrines, landing pages
          et applications SaaS — livrés proprement, suivis de près,
          sans intermédiaire inutile.
        </p>

        <div className="hero__actions">
          <a
            href={calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--gold"
          >
            Prendre un RDV
          </a>
          <Link href="/login" className="btn btn--ghost">
            Espace client
          </Link>
        </div>
      </div>

      <div className="hero__mockup" aria-hidden="true">
        <div className="mockup__bar">
          <span className="mockup__dot" />
          <span className="mockup__dot" />
          <span className="mockup__dot" />
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
