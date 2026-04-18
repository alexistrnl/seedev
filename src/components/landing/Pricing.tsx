'use client';

import React from 'react';

// Pricing — 3 tiers
export default function Pricing() {
  const tiers = [
    {
      name: 'Essentiel',
      price: '690',
      tagline: 'Pour démarrer proprement',
      desc: 'Un site vitrine simple, professionnel, qui remplit son rôle.',
      highlight: false,
      features: [
        'Site responsive (3 à 5 pages)',
        'Livraison en 5 à 7 jours',
        'Aperçu avant signature',
        'Hébergement Vercel inclus',
        'Formulaire de contact',
        'Google My Business optimisé',
        'Email pro configurée',
        'Formation 30 min + replay',
        '1 modif gratuite / mois à vie',
      ],
    },
    {
      name: 'Premium',
      price: '1 290',
      tagline: 'Le plus choisi',
      desc: 'Tout l\'écosystème Seedev. Pour convertir vraiment.',
      highlight: true,
      features: [
        'Tout l\'Essentiel +',
        'Espace client dédié à vie',
        'Chat direct avec ton dev',
        'Timeline temps réel',
        'Chatbot FAQ IA entraîné',
        'Formulaire IA qualifiant les leads',
        'Templates Insta & LinkedIn',
        'Monitoring & backups auto',
        'Appel de suivi à J+15',
      ],
    },
    {
      name: 'Sur-mesure',
      price: '1 890',
      tagline: 'Projets ambitieux',
      desc: 'Fonctionnalités spécifiques, intégrations, design avancé.',
      highlight: false,
      features: [
        'Tout le Premium +',
        'Design sur-mesure avancé (animations, micro-interactions)',
        'Intégrations tierces (Stripe, CRM...)',
        'Pages illimitées',
        'Animations & interactions avancées',
        'SEO technique renforcé',
        'A/B testing configurable',
        'Accompagnement stratégique',
        'Support prioritaire',
      ],
    },
  ];

  return (
    <section id="tarifs" style={{ padding: '96px 0', borderTop: '1px solid var(--line)' }}>
      <div className="wrap">
        <div style={{ textAlign: 'center', marginBottom: 56, maxWidth: 700, margin: '0 auto 56px' }}>
          <div className="eyebrow" style={{ marginBottom: 24, justifyContent: 'center' }}>05 · Tarifs</div>
          <h2 style={{
            fontSize: 'clamp(40px, 5vw, 64px)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 0.95,
            marginBottom: 20,
          }}>
            Trois formules.
            <br />
            <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>Zéro</span> frais caché.
          </h2>
          <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.5 }}>
            Paiement en 3 fois sans frais. Hébergement inclus la 1ère année puis 8€/mois. Pas d'abonnement obligatoire.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'stretch' }}>
          {tiers.map((t, i) => (
            <div key={i} style={{
              background: t.highlight ? 'var(--fg)' : 'white',
              color: t.highlight ? 'white' : 'var(--fg)',
              border: t.highlight ? '1px solid var(--fg)' : '1px solid var(--line)',
              borderRadius: 16,
              padding: '36px 32px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              transform: t.highlight ? 'translateY(-12px)' : 'none',
              boxShadow: t.highlight ? '0 30px 80px rgba(0,0,0,0.16)' : '0 0 0 rgba(0,0,0,0)',
            }}>
              {t.highlight && (
                <div style={{
                  position: 'absolute',
                  top: -12, left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--accent)',
                  color: 'white',
                  padding: '5px 14px',
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 600,
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.05em',
                }}>
                  ★ RECOMMANDÉ
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <div className="mono" style={{ fontSize: 10, color: t.highlight ? '#7d94ff' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                  {t.tagline}
                </div>
                <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 6 }}>
                  {t.name}
                </div>
                <div style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.4 }}>
                  {t.desc}
                </div>
              </div>

              <div style={{ marginBottom: 28, display: 'flex', alignItems: 'baseline', gap: 4, whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.04em', whiteSpace: 'nowrap' }}>{t.price}</span>
                <span style={{ fontSize: 22, fontWeight: 500, opacity: 0.7 }}>€</span>
                <span style={{ fontSize: 13, opacity: 0.5, marginLeft: 6 }}>HT</span>
              </div>

              <div style={{ flex: 1, marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {t.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'start', fontSize: 14, lineHeight: 1.4 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0, marginTop: 2 }}>
                      <circle cx="8" cy="8" r="8" fill={t.highlight ? 'var(--accent)' : 'var(--fg)'} />
                      <path d="M4.5 8l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontWeight: j === 0 && t.highlight ? 500 : 400 }}>{f}</span>
                  </div>
                ))}
              </div>

              <a href="#cta" style={{
                display: 'block',
                textAlign: 'center',
                background: t.highlight ? 'var(--accent)' : 'var(--fg)',
                color: 'white',
                padding: '14px',
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 500,
              }}>
                Réserver un appel →
              </a>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <div className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>
            Besoin d'autre chose ? On fait aussi des refontes, des apps, du SaaS.
          </div>
        </div>
      </div>
    </section>
  );
};
