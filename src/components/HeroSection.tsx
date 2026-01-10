'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import './hero-section.css';

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Toujours écouter l'événement de fermeture de l'IntroGate
    const handleGateClose = () => {
      // Attendre la fin de l'animation de fermeture (300ms) + un petit délai
      setTimeout(() => {
        setIsVisible(true);
      }, 400);
    };
    
    window.addEventListener('introGateClosed', handleGateClose);
    return () => window.removeEventListener('introGateClosed', handleGateClose);
  }, []);

  return (
    <div className={`hero-section ${isVisible ? 'hero-section--animate' : ''}`}>
      <div className={`hero-section__bg ${isVisible ? 'hero-section__bg--visible' : ''}`}>
        <picture className={isVisible ? 'hero-section__picture--animate' : ''}>
          <Image
            src="https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt=""
            fill
            className="hero-section__bg-img"
            priority
            sizes="100vw"
          />
        </picture>
      </div>
      <div className="hero-section__cnt">
        <div className="hero-section__center">
          <h1>SEEDEV</h1>
          <p className="hero-section__subtitle">De l'idée au MVP.</p>
        </div>
      </div>
    </div>
  );
}

