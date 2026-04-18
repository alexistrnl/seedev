'use client';

import React from 'react';

// Comparatif — Editorial versus with strong typography
export default function Comparatif() {
  const rows = [
    { feat: 'Site responsive mobile & tablette', competitor: true, seedev: true, seedevNote: '' },
    { feat: 'Délai de livraison', competitor: '1 à 2 mois', seedev: '5 à 10 jours', seedevNote: '' },
    { feat: 'Aperçu personnalisé avant signature', competitor: false, seedev: true, seedevNote: 'Configurateur gratuit avec tes couleurs' },
    { feat: 'Chat direct avec ton développeur', competitor: false, seedev: true, seedevNote: 'Intégré à l\'espace client' },
    { feat: 'Espace client dédié', competitor: false, seedev: true, seedevNote: 'Dashboard perso, accessible 24/7, à vie' },
    { feat: 'Fichiers centralisés', competitor: 'Par email', seedev: true, seedevNote: 'Logo, accès, factures, contrat — au même endroit' },
    { feat: 'Suivi du projet en temps réel', competitor: false, seedev: true, seedevNote: 'Timeline visuelle jour par jour' },
    { feat: 'Formulaire de contact intelligent', competitor: false, seedev: true, seedevNote: 'L\'IA qualifie tes leads' },
    { feat: 'Chatbot FAQ entraîné sur ton activité', competitor: false, seedev: true, seedevNote: 'Inclus' },
    { feat: 'Email professionnel', competitor: false, seedev: true, seedevNote: 'hello@tonentreprise.fr configurée' },
    { feat: 'Google My Business optimisé', competitor: false, seedev: true, seedevNote: 'Configuré pour être trouvé localement' },
    { feat: 'Templates Instagram & LinkedIn', competitor: false, seedev: true, seedevNote: 'Aux couleurs de ta marque' },
    { feat: 'Statistiques de fréquentation', competitor: 'À configurer toi-même', seedev: true, seedevNote: 'Simplifiées dans ton dashboard' },
    { feat: 'Modifications après livraison', competitor: '50–100€ par modif', seedev: '1 gratuite / mois, à vie', seedevNote: '' },
    { feat: 'Monitoring & backups automatiques', competitor: false, seedev: true, seedevNote: 'Inclus' },
    { feat: 'Hébergement professionnel', competitor: 'À ta charge', seedev: true, seedevNote: 'Inclus — Vercel, la référence' },
    { feat: 'Code 100% exportable', competitor: 'Souvent bloqué', seedev: true, seedevNote: 'Aucune dépendance, le site est à toi' },
    { feat: 'Appel de suivi à J+15', competitor: false, seedev: true, seedevNote: 'On fait le point ensemble' },
    { feat: 'Formation pour gérer ton site', competitor: false, seedev: true, seedevNote: '30 min en visio, replay inclus' },
  ];

  const renderCell = (v, isSeedev) => {
    if (v === true) {
      return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill={isSeedev ? 'var(--accent)' : '#bbb'} />
            <path d="M7 12l3.5 3.5L17 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {isSeedev && <span style={{ fontSize: 14, fontWeight: 500 }}>Inclus</span>}
        </div>
      );
    }
    if (v === false) {
      return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="#e6e6e1" />
            <path d="M8 8l8 8M16 8l-8 8" stroke="#999" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>Non</span>
        </div>
      );
    }
    return <span style={{ fontSize: 14, fontWeight: isSeedev ? 500 : 400, color: isSeedev ? 'var(--fg)' : 'var(--muted)' }}>{v}</span>;
  };

  return (
    <section id="comparatif" style={{ padding: '96px 0', background: 'var(--fg)', color: 'white', position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
      {/* background grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        pointerEvents: 'none',
      }} />

      <div className="wrap" style={{ position: 'relative' }}>
        {/* Header */}
        <div style={{ marginBottom: 64, maxWidth: 880 }}>
          <div className="eyebrow" style={{ marginBottom: 24, color: '#aaa' }}>
            02 · Comparatif
          </div>
          <h2 style={{
            fontSize: 'clamp(44px, 6vw, 84px)',
            fontWeight: 700,
            letterSpacing: '-0.045em',
            lineHeight: 0.92,
          }}>
            Les autres <span style={{ color: '#555' }}>font un site</span>.
            <br />
            On te livre un <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>écosystème</span>.
          </h2>
        </div>

        {/* Table */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr 1.4fr',
          background: '#0a0a0a',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
        }}>
          {/* Column headers */}
          <div style={{ padding: '28px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="mono" style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Feature
            </div>
          </div>
          <div style={{ padding: '28px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="mono" style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              Agence classique
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#999', letterSpacing: '-0.02em' }}>
              Les autres
            </div>
          </div>
          <div style={{
            padding: '28px 28px',
            borderBottom: '1px solid rgba(35,71,255,0.3)',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(35,71,255,0.08)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: 12, right: 16,
              background: 'var(--accent)',
              color: 'white',
              padding: '3px 8px',
              borderRadius: 999,
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.05em',
              fontFamily: 'JetBrains Mono, monospace',
            }}>NOUS</div>
            <div className="mono" style={{ fontSize: 10, color: '#7d94ff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              Studio premium
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>
              Seedev
            </div>
          </div>

          {/* Rows */}
          {rows.map((r, i) => (
            <React.Fragment key={i}>
              <div style={{
                padding: '22px 28px',
                borderBottom: i === rows.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.06)',
                fontSize: 15,
                fontWeight: 500,
                letterSpacing: '-0.01em',
              }}>
                {r.feat}
              </div>
              <div style={{
                padding: '22px 28px',
                borderBottom: i === rows.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.06)',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
              }}>
                {renderCell(r.competitor, false)}
              </div>
              <div style={{
                padding: '22px 28px',
                borderBottom: i === rows.length - 1 ? 'none' : '1px solid rgba(35,71,255,0.15)',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(35,71,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}>
                {renderCell(r.seedev, true)}
                {r.seedevNote && (
                  <div className="mono" style={{ fontSize: 11, color: '#7d94ff', marginTop: 2 }}>
                    → {r.seedevNote}
                  </div>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Footer CTA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, flexWrap: 'wrap', gap: 24 }}>
          <div className="mono" style={{ fontSize: 12, color: '#888' }}>
            19 différences. 1 seul choix évident.
          </div>
          <a href="#tarifs" style={{
            background: 'white',
            color: 'var(--fg)',
            padding: '14px 24px',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
          }}>
            Voir les formules
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
};
