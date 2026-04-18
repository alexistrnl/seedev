'use client';

import React from 'react';

// Hero — Split with animated cursor building a site on the right
export default function Hero() {
  return (
    <section style={{ position: 'relative', paddingTop: 130, paddingBottom: 80, overflow: 'hidden', minHeight: '88vh', display: 'flex', alignItems: 'center' }}>
      {/* background dots with radial mask */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(10,10,10,0.07) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        maskImage: 'radial-gradient(ellipse 1100px 700px at 50% 40%, black 10%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse 1100px 700px at 50% 40%, black 10%, transparent 75%)',
      }} />

      <div style={{
        position: 'absolute',
        top: '15%', right: '10%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(35,71,255,0.07) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div className="wrap" style={{ position: 'relative', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 56, alignItems: 'center' }}>
          {/* LEFT — content */}
          <div>
            {/* Top pill */}
            <div style={{ marginBottom: 36 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: 'white',
                border: '1px solid var(--line)',
                borderRadius: 999,
                padding: '6px 14px 6px 8px',
                fontSize: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <div style={{
                  background: 'var(--accent)',
                  color: 'white',
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 600,
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.05em',
                }}>
                  NEW
                </div>
                <span style={{ color: 'var(--muted)' }}>Configurateur gratuit ·</span>
                <a href="#configurateur" style={{ color: 'var(--fg)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Essayer <span>→</span>
                </a>
              </div>
            </div>

            <h1 style={{
              fontSize: 'clamp(48px, 6.5vw, 96px)',
              fontWeight: 700,
              letterSpacing: '-0.05em',
              lineHeight: 0.9,
              marginBottom: 32,
            }}>
              Ton site <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>pro</span>,
              <br />
              livré en <span style={{ color: 'var(--accent)', position: 'relative', display: 'inline-block' }}>
                5 à 10 jours
                <svg viewBox="0 0 400 12" preserveAspectRatio="none" style={{ position: 'absolute', bottom: '-0.08em', left: 0, width: '100%', height: '0.15em' }}>
                  <path d="M2 6 Q100 1 200 6 T398 6" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5"/>
                </svg>
              </span>.
            </h1>

            <p style={{
              fontSize: 18,
              color: 'var(--muted)',
              lineHeight: 1.6,
              maxWidth: 460,
              marginBottom: 44,
            }}>
              Accompagnement humain, dashboard à vie, hébergement inclus. <b style={{ color: 'var(--fg)', fontWeight: 500 }}>Zéro lock-in.</b>
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="#cta" style={{
                background: 'var(--fg)',
                color: 'white',
                padding: '15px 26px',
                borderRadius: 999,
                fontSize: 15,
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
              }}>
                Réserver mon appel <span>→</span>
              </a>
              <a href="#configurateur" style={{
                padding: '15px 20px',
                fontSize: 15,
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: 'var(--muted)',
                textDecoration: 'underline',
                textUnderlineOffset: 4,
                textDecorationColor: 'var(--line)',
              }}>
                Tester le configurateur
              </a>
            </div>
          </div>

          {/* RIGHT — animated cursor building a site */}
          <div style={{ position: 'relative' }}>
            <CursorSiteBuilder />
          </div>
        </div>
      </div>
    </section>
  );
};

// Animated cursor that builds a site in stop-motion, loops
const CursorSiteBuilder = () => {
  const [step, setStep] = React.useState(0);
  // Steps: which blocks are drawn, + cursor position
  const TIMELINE = [
    { block: 'header',    cursor: { x: 40,  y: 32 }, label: 'header.tsx' },
    { block: 'title',     cursor: { x: 140, y: 120 }, label: 'hero.tsx' },
    { block: 'subtitle',  cursor: { x: 140, y: 170 }, label: 'hero.tsx' },
    { block: 'cta',       cursor: { x: 80,  y: 220 }, label: 'button.tsx' },
    { block: 'gallery',   cursor: { x: 200, y: 310 }, label: 'gallery.tsx' },
    { block: 'deploy',    cursor: { x: 320, y: 32 }, label: 'deploy ✓' },
  ];
  const TOTAL = TIMELINE.length;

  React.useEffect(() => {
    const id = setInterval(() => {
      setStep(s => (s + 1) % (TOTAL + 2)); // +2 for pause at end before reset
    }, 900);
    return () => clearInterval(id);
  }, []);

  const shown = (idx: number) => step > idx;
  const cursorPos = step < TOTAL ? TIMELINE[step].cursor : TIMELINE[TOTAL - 1].cursor;
  const label = step < TOTAL ? TIMELINE[step].label : 'deployed.';
  const isDone = step >= TOTAL;

  return (
    <div style={{ position: 'relative', aspectRatio: '1 / 1.05', width: '100%', maxWidth: 520, marginLeft: 'auto' }}>
      {/* decorative rotated bg card */}
      <div style={{
        position: 'absolute',
        inset: '8px -20px -20px 20px',
        background: 'white',
        border: '1px solid var(--line)',
        borderRadius: 18,
        transform: 'rotate(2deg)',
        zIndex: 0,
      }} />

      {/* Main browser */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        background: 'white',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Browser bar */}
        <div style={{
          background: '#f4f4f0',
          padding: '10px 14px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          </div>
          <div className="mono" style={{
            flex: 1,
            background: 'white',
            border: '1px solid var(--line)',
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 10,
            color: 'var(--muted)',
          }}>
            🔒 ton-site.seedev.fr
          </div>
          {/* Live indicator */}
          <div className="mono" style={{
            fontSize: 9,
            color: isDone ? '#1fb873' : 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'currentColor',
              boxShadow: isDone ? '0 0 8px #1fb873' : '0 0 8px var(--accent)',
              animation: isDone ? 'none' : 'pulse 1s infinite',
            }} />
            {isDone ? 'LIVE' : 'BUILD'}
          </div>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, padding: 24, position: 'relative', background: '#fefefe', overflow: 'hidden' }}>
          {/* blocks */}
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 28,
            opacity: shown(0) ? 1 : 0,
            transform: shown(0) ? 'translateY(0)' : 'translateY(-8px)',
            transition: 'all 0.3s cubic-bezier(.5,0,.2,1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 16, height: 16, background: 'var(--accent)', borderRadius: 4 }} />
              <div style={{ fontSize: 11, fontWeight: 600 }}>brand.</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[1,2,3].map(i => <div key={i} style={{ width: 22, height: 5, background: '#ddd', borderRadius: 3 }} />)}
            </div>
          </div>

          {/* Title */}
          <div style={{
            height: 14,
            width: '75%',
            background: 'var(--fg)',
            borderRadius: 4,
            marginBottom: 8,
            opacity: shown(1) ? 1 : 0,
            transform: shown(1) ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left',
            transition: 'all 0.35s cubic-bezier(.5,0,.2,1)',
          }} />
          <div style={{
            height: 14,
            width: '55%',
            background: 'var(--fg)',
            borderRadius: 4,
            marginBottom: 16,
            opacity: shown(1) ? 1 : 0,
            transform: shown(1) ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left',
            transition: 'all 0.4s cubic-bezier(.5,0,.2,1) 0.05s',
          }} />

          {/* Subtitle */}
          <div style={{
            opacity: shown(2) ? 1 : 0,
            transform: shown(2) ? 'translateY(0)' : 'translateY(6px)',
            transition: 'all 0.3s',
            marginBottom: 20,
          }}>
            <div style={{ height: 5, width: '90%', background: '#ccc', borderRadius: 2, marginBottom: 4 }} />
            <div style={{ height: 5, width: '80%', background: '#ccc', borderRadius: 2, marginBottom: 4 }} />
            <div style={{ height: 5, width: '60%', background: '#ccc', borderRadius: 2 }} />
          </div>

          {/* CTA */}
          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 24,
            opacity: shown(3) ? 1 : 0,
            transform: shown(3) ? 'translateY(0)' : 'translateY(6px)',
            transition: 'all 0.35s cubic-bezier(.5,0,.2,1)',
          }}>
            <div style={{ background: 'var(--accent)', color: 'white', padding: '7px 14px', borderRadius: 999, fontSize: 10, fontWeight: 500 }}>
              Prendre rdv →
            </div>
            <div style={{ border: '1px solid var(--line-2)', padding: '7px 14px', borderRadius: 999, fontSize: 10 }}>
              En savoir +
            </div>
          </div>

          {/* Gallery */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: 6,
            opacity: shown(4) ? 1 : 0,
            transform: shown(4) ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.4s cubic-bezier(.5,0,.2,1)',
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                aspectRatio: '1 / 1',
                background: `repeating-linear-gradient(45deg, rgba(35,71,255,${0.08 + i * 0.03}) 0 5px, transparent 5px 12px)`,
                border: '1px solid var(--line)',
                borderRadius: 5,
              }} />
            ))}
          </div>

          {/* Deploy banner */}
          <div style={{
            position: 'absolute',
            top: 16, right: 16,
            background: '#1fb873',
            color: 'white',
            padding: '5px 10px',
            borderRadius: 999,
            fontSize: 9,
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 600,
            opacity: shown(5) ? 1 : 0,
            transform: shown(5) ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.9)',
            transition: 'all 0.4s cubic-bezier(.5,0,.2,1)',
          }}>
            ✓ DEPLOYED
          </div>

          {/* Cursor */}
          <div style={{
            position: 'absolute',
            left: cursorPos.x,
            top: cursorPos.y,
            transition: 'all 0.7s cubic-bezier(.5,0,.2,1)',
            pointerEvents: 'none',
            zIndex: 10,
          }}>
            <svg width="22" height="26" viewBox="0 0 22 26" fill="none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
              <path d="M3 2 L3 20 L8 16 L11 24 L14 23 L11 15 L17 14 Z" fill="var(--fg)" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
            <div className="mono" style={{
              position: 'absolute',
              top: 24,
              left: 14,
              background: 'var(--fg)',
              color: 'white',
              fontSize: 9,
              padding: '3px 7px',
              borderRadius: 4,
              whiteSpace: 'nowrap',
              fontWeight: 500,
            }}>
              {label}
            </div>
          </div>
        </div>
      </div>

      {/* Floating terminal badge */}
      <div style={{
        position: 'absolute',
        bottom: -16,
        left: -24,
        background: 'var(--fg)',
        color: 'white',
        borderRadius: 10,
        padding: '10px 14px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ color: '#1fb873' }}>$</span>
        <span>build {isDone ? 'complete' : 'in progress'}...</span>
        <span style={{ color: '#1fb873' }}>{isDone ? '✓' : ''}</span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};
