'use client';

import React from 'react';

// Process — Timeline with animated progress indicator
export default function Process() {
  const steps = [
    { day: 'J0',    title: 'Appel découverte', desc: 'On discute de ton projet, ton métier, tes objectifs. 30 min en visio, sans engagement.', icon: '1', hint: '📞 Visio 30 min' },
    { day: 'J1',    title: 'Aperçu personnalisé', desc: 'Tu reçois un premier mockup à tes couleurs, avec ton logo. Avant même de signer.', icon: '2', hint: '🎨 Mockup envoyé' },
    { day: 'J2–J7', title: 'Design & développement', desc: 'Timeline visuelle dans ton espace client. Chat direct avec ton dev. Zéro surprise.', icon: '3', hint: '💻 Dev en cours' },
    { day: 'J8',    title: 'Livraison & formation', desc: 'Mise en ligne sur Vercel, adresse email pro, GMB, formation 30 min en visio (replay inclus).', icon: '4', hint: '🚀 Déployé' },
    { day: 'J+15',  title: 'Appel de suivi', desc: 'On fait le point. Ajustements. 1ère modif gratuite activée.', icon: '5', hint: '✨ Follow-up' },
    { day: '∞',     title: 'Maintenance à vie', desc: '1 modif gratuite par mois. Backups auto. Monitoring 24/7. Hébergement inclus.', icon: '∞', hint: '🛡️ Actif à vie' },
  ];

  const ref = React.useRef(null);
  const [inView, setInView] = React.useState(false);
  const [active, setActive] = React.useState(0);

  // Observe when in view
  React.useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setInView(true);
    }, { threshold: 0.2 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // Cycle active step when in view
  React.useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => {
      setActive(a => (a + 1) % steps.length);
    }, 1800);
    return () => clearInterval(id);
  }, [inView, steps.length]);

  const progressPct = ((active + 0.5) / steps.length) * 100;

  return (
    <section id="process" style={{ padding: '80px 0', position: 'relative', borderTop: '1px solid var(--line)' }}>
      <div className="wrap">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start', marginBottom: 40 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>01 · Process</div>
            <h2 style={{ fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 0.98 }}>
              De l'idée à la <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400, whiteSpace: 'nowrap' }}>mise en ligne</span>
              <br />
              en moins de 10 jours.
            </h2>
          </div>
          <div style={{ paddingTop: 24 }}>
            <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.55, marginBottom: 12 }}>
              Chaque étape est visible en temps réel dans ton dashboard. Tu sais toujours où on en est, ce qu'on fait, et ce qu'il te reste à valider.
            </p>
            <div className="mono" style={{ fontSize: 12, color: 'var(--accent)' }}>
              → Aucun devis aveugle. Aucun acompte sans preview.
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div ref={ref} style={{ position: 'relative', paddingTop: 40 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, position: 'relative', alignItems: 'stretch' }}>
            {/* Base horizontal line */}
            <div style={{
              position: 'absolute',
              top: 58,
              left: '8.33%',
              right: '8.33%',
              height: 1,
              background: 'var(--line)',
              zIndex: 0,
            }} />
            {/* Animated progress fill */}
            <div style={{
              position: 'absolute',
              top: 57,
              left: '8.33%',
              height: 3,
              background: 'linear-gradient(90deg, var(--accent), #7d94ff)',
              width: inView ? `calc(${progressPct}% - ${progressPct * 0.0833}%)` : 0,
              transition: 'width 1.5s cubic-bezier(.5,0,.2,1)',
              zIndex: 0,
              borderRadius: 2,
              boxShadow: '0 0 12px rgba(35,71,255,0.4)',
            }} />


            {steps.map((s, i) => {
              const isPast = i < active;
              const isActive = i === active;
              return (
                <div key={i} style={{ position: 'relative', padding: '0 6px', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Hint card that pops on active */}
                  <div style={{
                    position: 'absolute',
                    top: -4,
                    left: '50%',
                    transform: `translateX(-50%) translateY(${isActive ? '0' : '8px'})`,
                    background: 'var(--fg)',
                    color: 'white',
                    fontSize: 10,
                    fontFamily: 'JetBrains Mono, monospace',
                    padding: '3px 8px',
                    borderRadius: 5,
                    whiteSpace: 'nowrap',
                    opacity: isActive ? 1 : 0,
                    transition: 'all 0.3s',
                    pointerEvents: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 4,
                  }}>
                    {s.hint}
                    <div style={{
                      position: 'absolute',
                      bottom: -4,
                      left: '50%',
                      transform: 'translateX(-50%) rotate(45deg)',
                      width: 8,
                      height: 8,
                      background: 'var(--fg)',
                    }} />
                  </div>

                  <div style={{
                    width: 32, height: 32,
                    background: isPast || isActive ? 'var(--accent)' : 'var(--fg)',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 600,
                    marginTop: 40,
                    marginBottom: 14,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    border: '4px solid var(--bg)',
                    transform: isActive ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: isActive ? '0 0 0 4px rgba(35,71,255,0.18)' : 'none',
                    transition: 'all 0.4s cubic-bezier(.5,0,.2,1)',
                  }}>{isPast ? '✓' : s.icon}</div>

                  {/* Card around text */}
                  <div style={{
                    background: 'white',
                    border: isActive ? '1px solid var(--accent)' : '1px solid var(--line)',
                    borderRadius: 10,
                    padding: '12px 12px 14px',
                    transition: 'all 0.4s',
                    boxShadow: isActive
                      ? '0 8px 24px rgba(35,71,255,0.12), 0 0 0 3px rgba(35,71,255,0.06)'
                      : '0 1px 2px rgba(0,0,0,0.03)',
                    transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    <div className="mono" style={{
                      display: 'inline-block',
                      alignSelf: 'flex-start',
                      fontSize: 9,
                      color: isActive ? 'white' : 'var(--accent)',
                      background: isActive ? 'var(--accent)' : 'var(--accent-soft)',
                      padding: '2px 7px',
                      borderRadius: 4,
                      marginBottom: 8,
                      letterSpacing: '0.05em',
                      fontWeight: 600,
                      transition: 'all 0.3s',
                    }}>
                      {s.day}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 4, lineHeight: 1.25 }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.45 }}>
                      {s.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
