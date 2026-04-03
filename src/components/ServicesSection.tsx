import "./ServicesSection.css"

const services = [
  {
    num: "01",
    icon: "↗",
    title: "Landing page",
    description: "Une page de conversion pour présenter votre offre et transformer vos visiteurs en clients.",
  },
  {
    num: "02",
    icon: "◻",
    title: "Site vitrine",
    description: "Un site multipage soigné pour asseoir votre crédibilité et votre image de marque.",
  },
  {
    num: "03",
    icon: "⬡",
    title: "SaaS",
    description: "Application web complète — authentification, paiement, dashboard, API.",
  },
  {
    num: "04",
    icon: "↺",
    title: "Maintenance",
    description: "Suivi continu, mises à jour et évolutions de votre projet au fil du temps.",
  },
]

export default function ServicesSection() {
  return (
    <section id="services" className="sv">
      <div className="sv__header">
        <p className="stag">Services</p>
        <h2 className="sv__title">
          Nos <em>expertises.</em>
        </h2>
      </div>

      <ul className="sv__list">
        {services.map((s) => (
          <li key={s.num} className="sv__item">
            <span className="sv__watermark" aria-hidden="true">{s.num}</span>
            <div className="sv__top">
              <span className="sv__icon">{s.icon}</span>
            </div>
            <div className="sv__content">
              <h3 className="sv__name">{s.title}</h3>
              <p className="sv__desc">{s.description}</p>
            </div>

          </li>
        ))}
      </ul>
    </section>
  )
}
