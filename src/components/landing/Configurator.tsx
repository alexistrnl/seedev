'use client';

import React from 'react';

// Configurator — Live interactive demo
export default function Configurator() {
  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState({
    name: 'Maison Lila',
    type: 'Fleuriste',
    color: '#a855f7',
    font: 'Inter Tight',
    style: 'editorial',
    tagline: 'Compositions florales & événementiel',
  });

  const colors = [
    { c: '#2347ff', n: 'Bleu électrique' },
    { c: '#ff5c3c', n: 'Corail' },
    { c: '#1fb873', n: 'Émeraude' },
    { c: '#a855f7', n: 'Violet' },
    { c: '#f59e0b', n: 'Ambre' },
    { c: '#0a0a0a', n: 'Noir' },
  ];
  const fonts = ['Inter Tight', 'Instrument Serif', 'JetBrains Mono'];
  const styles = [
    { id: 'editorial', name: 'Éditorial', desc: 'Typo grande, beaucoup de blanc' },
    { id: 'bold', name: 'Audacieux', desc: 'Couleurs pleines, grands blocs' },
    { id: 'minimal', name: 'Minimal', desc: 'Épuré, centré, très peu d\'éléments' },
  ];

  const steps = ['Marque', 'Couleur', 'Typo', 'Style', 'Aperçu'];

  const update = (k: string, v: unknown) => setData(d => ({ ...d, [k]: v }));

  return (
    <section id="configurateur" style={{ padding: '96px 0', background: 'var(--bg)', position: 'relative', borderTop: '1px solid var(--line)' }}>
      <div className="wrap">
        <div style={{ marginBottom: 56, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'end' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 24 }}>04 · Configurateur</div>
            <h2 style={{
              fontSize: 'clamp(40px, 5vw, 64px)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 0.95,
            }}>
              Teste la direction <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>visuelle</span>
              <br />
              en 30 secondes.
            </h2>
          </div>
          <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.6, paddingBottom: 8 }}>
            Joue avec tes couleurs, ta typo, ton style. C'est une démo pour te faire une idée — ton vrai site sera conçu sur-mesure, avec un design unique adapté à ton métier.
          </p>
        </div>

        <div style={{
          background: 'white',
          border: '1px solid var(--line)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 40px 80px rgba(0,0,0,0.06)',
          display: 'grid',
          gridTemplateColumns: '360px 1fr',
          minHeight: 620,
        }}>
          {/* Left: controls */}
          <div style={{ padding: '32px 28px', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}>
            {/* step indicator */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
              {steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    background: i <= step ? 'var(--accent)' : 'var(--line)',
                    cursor: 'pointer',
                    transition: 'background 0.3s',
                  }}
                />
              ))}
            </div>

            <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 8 }}>
              ÉTAPE {step + 1} / {steps.length}
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 24 }}>
              {steps[step]}
            </div>

            <div style={{ flex: 1 }}>
              {step === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <label>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Nom de ta marque</div>
                    <input
                      value={data.name}
                      onChange={e => update('name', e.target.value)}
                      style={{
                        width: '100%', padding: '12px 14px',
                        border: '1px solid var(--line)', borderRadius: 8,
                        fontSize: 15, fontFamily: 'inherit', outline: 'none',
                      }}
                    />
                  </label>
                  <label>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Ton activité</div>
                    <input
                      value={data.type}
                      onChange={e => update('type', e.target.value)}
                      style={{
                        width: '100%', padding: '12px 14px',
                        border: '1px solid var(--line)', borderRadius: 8,
                        fontSize: 15, fontFamily: 'inherit', outline: 'none',
                      }}
                    />
                  </label>
                  <label>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Accroche principale</div>
                    <textarea
                      value={data.tagline}
                      onChange={e => update('tagline', e.target.value)}
                      rows={2}
                      style={{
                        width: '100%', padding: '12px 14px',
                        border: '1px solid var(--line)', borderRadius: 8,
                        fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'none',
                      }}
                    />
                  </label>
                </div>
              )}
              {step === 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {colors.map(c => (
                    <button
                      key={c.c}
                      onClick={() => update('color', c.c)}
                      style={{
                        padding: 12,
                        border: data.color === c.c ? '2px solid var(--fg)' : '1px solid var(--line)',
                        borderRadius: 10,
                        background: 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ width: '100%', height: 50, background: c.c, borderRadius: 6, marginBottom: 8 }} />
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{c.n}</div>
                    </button>
                  ))}
                </div>
              )}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {fonts.map(f => (
                    <button
                      key={f}
                      onClick={() => update('font', f)}
                      style={{
                        padding: '18px 16px',
                        border: data.font === f ? '2px solid var(--fg)' : '1px solid var(--line)',
                        borderRadius: 10,
                        background: 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: f === 'JetBrains Mono' ? "'JetBrains Mono', monospace" :
                                    f === 'Instrument Serif' ? "'Instrument Serif', serif" :
                                    "'Inter Tight', sans-serif",
                      }}
                    >
                      <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 2 }}>{f}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'inherit' }}>Aa Bb Cc · 0123</div>
                    </button>
                  ))}
                </div>
              )}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {styles.map(s => (
                    <button
                      key={s.id}
                      onClick={() => update('style', s.id)}
                      style={{
                        padding: 14,
                        border: data.style === s.id ? '2px solid var(--fg)' : '1px solid var(--line)',
                        borderRadius: 10,
                        background: 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.desc}</div>
                    </button>
                  ))}
                </div>
              )}
              {step === 4 && (
                <div style={{ background: 'var(--bg)', padding: 18, borderRadius: 10, border: '1px solid var(--line)' }}>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Ton brief
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.8 }}>
                    <div><span style={{ color: 'var(--muted)' }}>Marque :</span> <b>{data.name}</b></div>
                    <div><span style={{ color: 'var(--muted)' }}>Activité :</span> {data.type}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: 'var(--muted)' }}>Couleur :</span>
                      <div style={{ width: 12, height: 12, background: data.color, borderRadius: 3 }} />
                      {data.color}
                    </div>
                    <div><span style={{ color: 'var(--muted)' }}>Typo :</span> {data.font}</div>
                    <div><span style={{ color: 'var(--muted)' }}>Style :</span> {data.style}</div>
                  </div>
                  <button style={{
                    marginTop: 20,
                    width: '100%',
                    background: 'var(--accent)',
                    color: 'white',
                    padding: '12px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}>
                    Recevoir mon aperçu complet par email →
                  </button>
                </div>
              )}
            </div>

            {/* nav buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
              <button
                onClick={() => setStep(s => Math.max(0, s - 1))}
                disabled={step === 0}
                style={{
                  padding: '10px 18px',
                  border: '1px solid var(--line)',
                  borderRadius: 999,
                  fontSize: 13,
                  opacity: step === 0 ? 0.4 : 1,
                  cursor: step === 0 ? 'default' : 'pointer',
                }}
              >← Retour</button>
              <button
                onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
                disabled={step === steps.length - 1}
                style={{
                  flex: 1,
                  background: 'var(--fg)',
                  color: 'white',
                  padding: '10px 18px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 500,
                  opacity: step === steps.length - 1 ? 0.4 : 1,
                  cursor: 'pointer',
                }}
              >Suivant →</button>
            </div>
          </div>

          {/* Right: live preview */}
          <div style={{ background: 'var(--bg)', padding: 32, display: 'flex', flexDirection: 'column' }}>
            <div style={{
              background: 'white',
              borderRadius: 12,
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* mini browser bar */}
              <div style={{
                padding: '10px 14px',
                background: '#f4f4f0',
                borderBottom: '1px solid var(--line)',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', gap: 5 }}>
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
                  fontSize: 11,
                  color: 'var(--muted)',
                  marginLeft: 12,
                }}>
                  🔒 {data.name.toLowerCase().replace(/\s+/g, '')}.fr
                </div>
              </div>

              {/* Preview content — changes with style */}
              <PreviewSite data={data} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const PreviewSite = ({ data }: { data: any }) => {
  const fontFam = data.font === 'JetBrains Mono' ? "'JetBrains Mono', monospace" :
                  data.font === 'Instrument Serif' ? "'Instrument Serif', serif" :
                  "'Inter Tight', sans-serif";

  if (data.style === 'bold') {
    return (
      <div style={{ flex: 1, background: data.color, color: 'white', padding: 36, fontFamily: fontFam, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40, fontSize: 13 }}>
          <b>{data.name}</b>
          <div style={{ display: 'flex', gap: 16, opacity: 0.8 }}><span>Projets</span><span>Contact</span></div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <h1 style={{ fontSize: 54, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 0.95 }}>
            {data.tagline}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ background: 'white', color: data.color, padding: '12px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
            Réserver →
          </div>
          <div style={{ border: '1px solid white', padding: '12px 20px', borderRadius: 999, fontSize: 13 }}>
            Portfolio
          </div>
        </div>
      </div>
    );
  }

  if (data.style === 'minimal') {
    return (
      <div style={{ flex: 1, background: 'white', padding: 36, fontFamily: fontFam, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, background: data.color, borderRadius: 8, marginBottom: 24 }} />
        <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 8 }}>{data.type}</div>
        <h1 style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.03em', marginBottom: 16, maxWidth: 360, lineHeight: 1.1 }}>
          {data.tagline}
        </h1>
        <div style={{ marginTop: 12, padding: '10px 18px', border: '1px solid var(--fg)', borderRadius: 999, fontSize: 13 }}>
          Prendre contact
        </div>
      </div>
    );
  }

  // editorial default
  return (
    <div style={{ flex: 1, background: 'white', padding: 32, fontFamily: fontFam, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, background: data.color, borderRadius: 5 }} />
          <b style={{ fontSize: 14 }}>{data.name}</b>
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--muted)' }}><span>Projets</span><span>À propos</span><span>Contact</span></div>
      </div>
      <div style={{ fontSize: 10, color: data.color, fontFamily: 'JetBrains Mono, monospace', marginBottom: 8, letterSpacing: '0.05em' }}>
        ● {data.type.toUpperCase()}
      </div>
      <h1 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1, marginBottom: 20, maxWidth: 420 }}>
        {data.tagline}
      </h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <div style={{ background: data.color, color: 'white', padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500 }}>
          Prendre rendez-vous →
        </div>
        <div style={{ border: '1px solid var(--fg)', padding: '8px 14px', borderRadius: 999, fontSize: 12 }}>
          Voir les réalisations
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, flex: 1 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{
            background: `repeating-linear-gradient(45deg, ${data.color}15 0 6px, transparent 6px 14px)`,
            border: `1px solid ${data.color}30`,
            borderRadius: 6,
          }} />
        ))}
      </div>
    </div>
  );
};
