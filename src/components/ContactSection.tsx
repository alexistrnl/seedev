import "./ContactSection.css"

const PHONE = "33782865274"
const PHONE_DISPLAY = "+33 7 82 86 52 74"

export default function ContactSection() {
  return (
    <section className="contact" id="contact">
      <div className="contact__inner">
        <p className="contact__tag stag">Contact</p>

        <h2 className="contact__title">
          Parlons de votre<br />
          <em>projet ensemble.</em>
        </h2>

        <p className="contact__sub">
          Une question, une idée, un devis — notre équipe vous répond directement.
        </p>

        <div className="contact__actions">
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
      </div>
    </section>
  )
}
