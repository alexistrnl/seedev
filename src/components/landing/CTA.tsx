'use client';

import React from 'react';

// CTA final — bold with callback form
export default function CTA() {
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  return (
    <section id="cta" style={{ padding: '96px 0', borderTop: '1px solid var(--line)' }}>
      <div className="wrap">
        <div style={{
          background: 'var(--accent)',
          color: 'white',
          borderRadius: 24,
          padding: '80px 64px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* big background typography */}
          <div className="serif" style={{
            position: 'absolute',
            bottom: -120,
            right: -40,
            fontSize: 400,
            fontStyle: 'italic',
            opacity: 0.08,
            lineHeight: 0.8,
            fontWeight: 400,
            pointerEvents: 'none',
          }}>
            s.
          </div>

          {/* grid overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', maxWidth: 720 }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.1em', opacity: 0.7, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 12px #00ff88' }}></span>
              DISPO AVRIL · 2 SLOTS RESTANTS
            </div>

            <h2 style={{
              fontSize: 'clamp(48px, 6vw, 88px)',
              fontWeight: 700,
              letterSpacing: '-0.045em',
              lineHeight: 0.92,
              marginBottom: 28,
            }}>
              Parlons de ton
              <br />
              <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>projet.</span>
            </h2>

            <p style={{ fontSize: 18, lineHeight: 1.5, maxWidth: 480, marginBottom: 40, opacity: 0.9 }}>
              30 minutes de call, sans engagement. Tu repars avec un aperçu de ton site et un devis clair.
            </p>

            {!submitted ? (
              <form
                onSubmit={e => { e.preventDefault(); if (email) setSubmitted(true); }}
                style={{
                  display: 'flex',
                  gap: 0,
                  background: 'white',
                  borderRadius: 999,
                  padding: 6,
                  maxWidth: 520,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                }}
              >
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  required
                  placeholder="ton@email.fr"
                  style={{
                    flex: 1,
                    border: 'none',
                    padding: '14px 20px',
                    fontSize: 15,
                    fontFamily: 'inherit',
                    outline: 'none',
                    background: 'transparent',
                    color: 'var(--fg)',
                  }}
                />
                <button type="submit" style={{
                  background: 'var(--fg)',
                  color: 'white',
                  padding: '14px 26px',
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  Réserver mon appel →
                </button>
              </form>
            ) : (
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 16,
                padding: 24,
                maxWidth: 520,
                backdropFilter: 'blur(10px)',
              }}>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
                  ✓ Merci !
                </div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>
                  On revient vers toi dans les 2h avec un créneau. Check tes spams au cas où.
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 28, marginTop: 40, flexWrap: 'wrap' }}>
              {[
                ['⚡', 'Réponse en 2h max'],
                ['💬', 'Sans engagement'],
                ['🎁', 'Aperçu offert'],
              ].map(([e, t], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, opacity: 0.9 }}>
                  <span>{e}</span>{t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
