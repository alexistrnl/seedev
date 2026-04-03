import TypeWriter from "./TypeWriter"
import "./ContactSection.css"

const PHONE = "33782865274"
const PHONE_DISPLAY = "+33 7 82 86 52 74"

const contactTypes = [
  "une question sur nos tarifs.",
  "une idée de projet.",
  "un devis gratuit.",
  "un rendez-vous rapide.",
]

export default function ContactSection() {
  return (
    <section className="ct" id="contact">
      {/* Left — text */}
      <div className="ct__left">
        <p className="stag">Contact</p>

        <h2 className="ct__title">
          Parlons de votre<br />
          <em>projet ensemble.</em>
        </h2>

        <p className="ct__sub">
          Vous avez <TypeWriter phrases={contactTypes} speed={65} pause={2000} />
        </p>

        <div className="ct__actions">
          <a
            href={`https://wa.me/${PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--gold"
          >
            Écrire sur WhatsApp
          </a>
          <a href={`tel:+${PHONE}`} className="btn btn--ghost">
            {PHONE_DISPLAY}
          </a>
        </div>

        <div className="ct__meta">
          <span className="ct__meta-dot" />
          <span className="ct__meta-text">Réponse sous 2h en moyenne</span>
        </div>
      </div>

      {/* Right — decorative chat mockup */}
      <div className="ct__right" aria-hidden="true">
        <div className="ct__card">
          {/* Card header */}
          <div className="ct__card-header">
            <div className="ct__card-avatar">S</div>
            <div className="ct__card-info">
              <span className="ct__card-name">Seedev</span>
              <span className="ct__card-status">
                <span className="ct__status-dot" />
                En ligne
              </span>
            </div>
          </div>

          {/* Chat messages */}
          <div className="ct__chat">
            <div className="ct__msg ct__msg--out">
              <span>Bonjour ! Suite à notre RDV, on prend en charge votre projet dès aujourd'hui.</span>
            </div>
            <div className="ct__msg ct__msg--out">
              <span>Pour démarrer, pouvez-vous nous confirmer le nom de domaine souhaité ?</span>
            </div>
            <div className="ct__msg ct__msg--in">
              <span>monprojet.fr, oui.</span>
            </div>
            <div className="ct__msg ct__msg--out">
              <span>Parfait, il est libre. Vous avez un logo ou une charte graphique à nous transmettre ?</span>
            </div>
            <div className="ct__msg ct__msg--in">
              <span>Oui je vous envoie ça.</span>
            </div>
            <div className="ct__msg ct__msg--out">
              <span>Reçu. La maquette sera prête d'ici jeudi.</span>
            </div>
            <div className="ct__typing">
              <span />
              <span />
              <span />
            </div>
          </div>

          {/* Input bar */}
          <div className="ct__card-input">
            <span className="ct__card-placeholder">Votre message…</span>
            <button className="ct__card-send">↑</button>
          </div>
        </div>

        {/* Decorative number */}
        <span className="ct__watermark">07</span>
      </div>
    </section>
  )
}
