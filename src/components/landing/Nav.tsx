'use client';

import React from 'react';

// Nav
export default function Nav() {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 50,
    padding: scrolled ? '10px 0' : '16px 0',
    background: 'rgba(250,250,247,0.78)',
    backdropFilter: 'blur(20px) saturate(1.6)',
    WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
    borderBottom: scrolled ? '1px solid var(--line)' : '1px solid rgba(230,230,225,0.6)',
    boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.04)' : 'none',
    transition: 'all 0.25s ease',
  };

  return (
    <nav style={navStyle}>
      <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>seedev.fr
</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 4 }}>v2026.04</span>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32, fontSize: 14 }}>
          <a href="#process" style={{ color: 'var(--muted)' }}>Process</a>
          <a href="#comparatif" style={{ color: 'var(--muted)' }}>Comparatif</a>
          <a href="#configurateur" style={{ color: 'var(--muted)' }}>Configurateur</a>
          <a href="#tarifs" style={{ color: 'var(--muted)' }}>Tarifs</a>
        </div>

        <a href="#cta" style={{
          background: 'var(--fg)',
          color: 'white',
          padding: '10px 18px',
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          Démarrer un projet
          <span style={{ fontSize: 12 }}>→</span>
        </a>
      </div>
    </nav>
  );
};
