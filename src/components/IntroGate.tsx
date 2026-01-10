'use client';

import { useEffect, useState, useRef } from 'react';
import './intro-gate.css';

interface IntroGateProps {
  title?: string;
}

export default function IntroGate({ title = 'Donne vie à tes idées.' }: IntroGateProps) {
  // Vérifier immédiatement dans le state initial si on vient de la page de login
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      const fromLogin = sessionStorage.getItem('fromLogin') === 'true';
      if (fromLogin) {
        sessionStorage.removeItem('fromLogin');
        // Déclencher l'événement pour le HeroSection
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('introGateClosed'));
        }, 100);
        return false;
      }
    }
    return true;
  });
  const [isClosing, setIsClosing] = useState(false);
  const scrollPositionRef = useRef<number>(0);

  useEffect(() => {
    // Si on ne doit pas afficher l'écran de verrouillage, ne rien faire
    if (!isVisible) {
      return;
    }
    
    // Sauvegarder la position de scroll actuelle
    scrollPositionRef.current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    
    // Afficher l'écran de verrouillage
    setIsClosing(false);
    // Bloquer le scroll
    document.documentElement.style.overflow = 'hidden';

    // Écouter l'événement de réinitialisation (pour le bouton DEV)
    const handleReset = () => {
      // Sauvegarder la position de scroll avant de réafficher
      scrollPositionRef.current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(true);
      setIsClosing(false);
      document.documentElement.style.overflow = 'hidden';
    };

    window.addEventListener('resetIntroGate', handleReset);

    return () => {
      // Restaurer le scroll au démontage
      document.documentElement.style.overflow = '';
      window.removeEventListener('resetIntroGate', handleReset);
    };
  }, [isVisible]);

  const handleClick = () => {
    // Lancer l'animation de fermeture
    setIsClosing(true);
    
    // Déclencher l'événement immédiatement pour le HeroSection
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('introGateClosed'));
    }
    
    // Après l'animation, unmount et remettre en haut de la page
    setTimeout(() => {
      setIsVisible(false);
      // Restaurer le scroll
      document.documentElement.style.overflow = '';
      
      // Remettre en haut de la page
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    }, 300); // Durée de l'animation CSS
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`introGateOverlay ${isClosing ? 'closing' : ''}`}>
      <section className="wrapper">
        <div className="hero"></div>
        <div className="content">
          <h1 className="h1--scalingSize" data-text={title}>
            {title}
          </h1>
          <button className="gateButton" type="button" onClick={handleClick}>
            <span>
              Accéder au site
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}

