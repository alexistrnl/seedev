'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/auth';
import './top-menu.css';

export default function TopMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const menuItems = isAuthenticated
    ? [
        { 
          label: 'Dashboard', 
          href: '/dashboard', 
          action: () => {
            setIsOpen(false);
            router.push('/dashboard');
          }
        },
        { 
          label: 'Tarifs', 
          href: '#pricing', 
          action: () => {
            setIsOpen(false);
            const element = document.getElementById('pricing');
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }
        },
        { 
          label: 'Contact', 
          href: '#', 
          action: () => {
            setIsOpen(false);
            console.log('Contact');
          }
        },
        { 
          label: user?.displayName || user?.email || 'Utilisateur', 
          href: '#', 
          action: () => {
            setIsOpen(false);
          }
        },
        { 
          label: 'Déconnexion', 
          href: '#', 
          action: async () => {
            setIsOpen(false);
            await logout();
            router.push('/');
          }
        },
      ]
    : [
        { 
          label: 'Se connecter', 
          href: '/login', 
          action: () => {
            setIsOpen(false);
            router.push('/login');
          }
        },
        { 
          label: 'Tarifs', 
          href: '#pricing', 
          action: () => {
            setIsOpen(false);
            const element = document.getElementById('pricing');
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }
        },
        { 
          label: 'Contact', 
          href: '#', 
          action: () => {
            setIsOpen(false);
            console.log('Contact');
          }
        },
      ];

  return (
    <div className="top-menu" ref={menuRef}>
      <button
        className="top-menu__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        <span className="top-menu__icon">
          <span className={`top-menu__line ${isOpen ? 'top-menu__line--open' : ''}`}></span>
          <span className={`top-menu__line ${isOpen ? 'top-menu__line--open' : ''}`}></span>
          <span className={`top-menu__line ${isOpen ? 'top-menu__line--open' : ''}`}></span>
        </span>
      </button>
      
      {isOpen && (
        <div className="top-menu__dropdown">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="top-menu__item"
              onClick={(e) => {
                e.preventDefault();
                item.action();
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

