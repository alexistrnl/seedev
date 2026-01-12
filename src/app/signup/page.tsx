'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signupWithEmailPassword } from '@/lib/auth';
import '../login/login.css';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  const handleBackToHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    sessionStorage.setItem('fromLogin', 'true');
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    // Vérifier que les mots de passe correspondent
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    try {
      await signupWithEmailPassword(
        formData.email,
        formData.password,
        formData.name || undefined
      );

      setSuccessMessage('Compte créé ! Un email de vérification a été envoyé. Vérifie ta boîte mail avant de te connecter.');
      
      // Rediriger vers la page de login après 3 secondes
      setTimeout(() => {
        router.push('/login?reason=verify');
      }, 3000);
    } catch (err: any) {
      const errorData = err?.response?.data || {};
      
      if (errorData.email) {
        setError(errorData.email.message || 'Erreur avec l\'email');
      } else if (errorData.password) {
        setError(errorData.password.message || 'Erreur avec le mot de passe');
      } else if (errorData.message) {
        setError(errorData.message);
      } else {
        setError(err?.message || 'Une erreur est survenue lors de la création du compte.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <a 
          href="/" 
          className="login-back-link"
          onClick={handleBackToHome}
        >
          ← Retour à l'accueil
        </a>
        
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">SEEDEV</h1>
            <p className="login-subtitle">De l'idée au MVP</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="name" className="login-label">
                Nom (optionnel)
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="login-input"
                placeholder="Votre nom"
              />
            </div>

            <div className="login-field">
              <label htmlFor="email" className="login-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="login-input"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password" className="login-label">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="login-input"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div className="login-field">
              <label htmlFor="confirmPassword" className="login-label">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="login-input"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="login-success">
                {successMessage}
              </div>
            )}

            <button 
              type="submit" 
              className="login-submit"
              disabled={isLoading}
            >
              {isLoading ? 'Création du compte...' : 'Créer mon compte'}
            </button>
          </form>

          <div className="login-signup-link">
            <p>
              Déjà un compte ?{' '}
              <a href="/login" className="login-signup-link-text">
                Se connecter
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
