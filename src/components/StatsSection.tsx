import "./StatsSection.css"

const stats = [
  { num: "03", label: "Projets livrés" },
  { num: "100%", label: "Clients accompagnés" },
  { num: "2024", label: "Année de fondation" },
]

export default function StatsSection() {
  return (
    <section className="stats">
      {stats.map((s, i) => (
        <div key={i} className="stats__item">
          <span className="stats__num">{s.num}</span>
          <span className="stats__label">{s.label}</span>
        </div>
      ))}
    </section>
  )
}
