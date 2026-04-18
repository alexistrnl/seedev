'use client';

import React from 'react';

// Footer
export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--line)', padding: '48px 0 32px' }}>
      <div className="wrap">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, background: 'var(--fg)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 10, height: 10, background: 'var(--accent)', borderRadius: '50%' }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>seedev</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5, maxWidth: 320 }}>
              Studio web premium. Sites livrés en 5 à 10 jours, maintenance à vie, zéro lock-in.
            </p>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Produit</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <a href="#process">Process</a>
              <a href="#tarifs">Tarifs</a>
              <a href="#configurateur">Configurateur</a>
              <a href="#portfolio">Réalisations</a>
            </div>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Contact</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <a href="mailto:contact@seedev.fr">contact@seedev.fr</a>
              <a href="tel:+33670667909">06 70 66 79 09</a>
              <a href="#">Prendre rendez-vous</a>
            </div>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Légal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <a href="#">Mentions légales</a>
              <a href="#">CGV</a>
              <a href="#">Confidentialité</a>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, borderTop: '1px solid var(--line)' }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>
            © 2026 Seedev · Site pensé & codé à la main
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1fb873' }}></span>
            Tous les services opérationnels
          </div>
        </div>
      </div>
    </footer>
  );
};
