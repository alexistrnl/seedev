import { projects } from "@/data/portfolio"
import "./PortfolioSection.css"

export default function PortfolioSection() {
  return (
    <section id="portfolio" className="pf">
      <div className="pf__header">
        <p className="stag">Réalisations</p>
        <h2 className="pf__title">
          Ce que nous avons <em>construit.</em>
        </h2>
      </div>

      <div className="pf__grid">
        {projects.map((project, i) => (
          <a
            key={project.name}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="pf__card"
          >
            {/* Mini browser bar */}
            <div className="pf__preview" aria-hidden="true">
              <div className="pf__preview-bar">
                <span className="pf__preview-dot pf__preview-dot--r" />
                <span className="pf__preview-dot pf__preview-dot--y" />
                <span className="pf__preview-dot pf__preview-dot--g" />
                <span className="pf__preview-url" />
              </div>
            </div>

            <span className="pf__arrow">↗</span>
            <span className="pf__num">0{i + 1}</span>
            <h3 className="pf__name">{project.name}</h3>
            <p className="pf__desc">{project.description}</p>
            <div className="pf__tags">
              {project.tags.map((t) => (
                <span key={t} className="pf__tag">{t}</span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
