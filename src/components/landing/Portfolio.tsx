'use client';

import React from 'react';

// Portfolio — live previews in browser cards
export default function Portfolio() {
  const items = [
    {
      name: 'QG Padel',
      domain: 'qg-padel.fr',
      url: 'https://qg-padel.fr',
      cat: 'Club de padel',
      tagline: 'La maison du padel.',
      color: '#1fb873',
      days: '7j',
    },
    {
      name: 'Bitebox',
      domain: 'bitebox.fr',
      url: 'https://bitebox.fr',
      cat: 'Food & lifestyle',
      tagline: 'Le Letterboxd des fast-food.',
      color: '#ff5c3c',
      days: '6j',
    },
    {
      name: 'Byoom',
      domain: 'byoom.fr',
      url: 'https://byoom.fr',
      cat: 'Jardinage & IA',
      tagline: 'Ton jardin, guidé par l\'IA.',
      color: '#2347ff',
      days: '8j',
    },
  ];

  const [hover, setHover] = React.useState(null);

  return (
    <section id="portfolio" style={{ padding: '96px 0', borderTop: '1px solid var(--line)' }}>
      <div className="wrap">
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', marginBottom: 56, gap: 32, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 600 }}>
            <div className="eyebrow" style={{ marginBottom: 24 }}>03 · Réalisations</div>
            <h2 style={{
              fontSize: 'clamp(40px, 5vw, 64px)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 0.95,
            }}>
              Des sites qui <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>travaillent</span>
              <br />
              pour leurs clients.
            </h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {items.map((it, i) => (
            <a
              key={i}
              href={it.url}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{
                display: 'block',
                borderRadius: 14,
                overflow: 'hidden',
                border: '1px solid var(--line)',
                background: 'white',
                transition: 'transform 0.3s, box-shadow 0.3s',
                transform: hover === i ? 'translateY(-6px)' : 'translateY(0)',
                boxShadow: hover === i ? '0 30px 60px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              {/* Browser chrome + preview */}
              <div style={{ position: 'relative' }}>
                {/* Browser bar */}
                <div style={{
                  background: '#f4f4f0',
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }} />
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
                  </div>
                  <div className="mono" style={{
                    flex: 1,
                    background: 'white',
                    border: '1px solid var(--line)',
                    borderRadius: 5,
                    padding: '3px 10px',
                    fontSize: 10,
                    color: 'var(--muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    🔒 {it.domain}
                  </div>
                </div>

                {/* Iframe preview — scaled down */}
                <div style={{
                  aspectRatio: '4 / 3',
                  background: it.color,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <iframe
                    src={it.url}
                    loading="lazy"
                    scrolling="no"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '250%',
                      height: '250%',
                      border: 0,
                      transform: 'scale(0.4)',
                      transformOrigin: '0 0',
                      pointerEvents: 'none',
                    }}
                    sandbox="allow-scripts allow-same-origin"
                    title={it.name}
                  />
                  {/* overlay to neutralize interactions */}
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
                  {/* days tag */}
                  <div style={{
                    position: 'absolute',
                    top: 14, right: 14,
                    background: 'rgba(255,255,255,0.95)',
                    color: 'var(--fg)',
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 600,
                    fontFamily: 'JetBrains Mono, monospace',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}>
                    livré en {it.days}
                  </div>
                </div>
              </div>

              {/* meta */}
              <div style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 4 }}>
                    {it.name}
                    <span className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 8, fontWeight: 400 }}>
                      {it.cat}
                    </span>
                  </div>
                  <div className="serif" style={{ fontSize: 15, color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.3 }}>
                    {it.tagline}
                  </div>
                </div>
                <div style={{
                  width: 32, height: 32,
                  flexShrink: 0,
                  borderRadius: '50%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  transform: hover === i ? 'translate(2px, -2px) rotate(-45deg)' : 'rotate(-45deg)',
                  transition: 'transform 0.3s',
                }}>→</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
