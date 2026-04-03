import "./StatsSection.css"

const stats = [
  { num: "11",   label: "Projets livrés",    sub: "depuis 2024" },
  { num: "100%", label: "Clients satisfaits", sub: "accompagnement complet" },
  { num: "2024", label: "Année de fondation", sub: "agence jeune & agile" },
]

export default function StatsSection() {
  return (
    <section className="stats">
      {stats.map((s, i) => (
        <div key={i} className="stats__item">
          <span className="stats__pulse" aria-hidden="true" />
          <span className="stats__num">{s.num}</span>
          <span className="stats__label">{s.label}</span>
          <span className="stats__sub">{s.sub}</span>
        </div>
      ))}
    </section>
  )
}
