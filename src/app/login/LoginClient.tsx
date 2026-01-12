'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginWithEmailPassword, resendVerificationEmail } from '@/lib/auth';
import './login.css';

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    // Vérifier si on vient de la page signup avec un message
    const reason = searchParams.get('reason');
    const verified = searchParams.get('verified');
    const error = searchParams.get('error');

    if (reason === 'verify') {
      setError('Vérifie ta boîte mail avant de te connecter.');
      setShowVerificationMessage(true);
    } else if (verified === '1') {
      setSuccessMessage('Email vérifié avec succès ! Tu peux maintenant te connecter.');
    } else if (error === 'verify') {
      setError('La vérification a échoué. Le lien est peut-être expiré ou invalide.');
      setShowVerificationMessage(true);
    }
  }, [searchParams]);

  const handleBackToHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    sessionStorage.setItem('fromLogin', 'true');
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setShowVerificationMessage(false);
    setIsLoading(true);

    try {
      await loginWithEmailPassword(formData.email, formData.password);
      
      // Rediriger vers le dashboard ou la page d'accueil
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err?.message || '';
      const errorData = err?.response?.data || {};

      if (errorMessage === 'EMAIL_NOT_VERIFIED') {
        setError('Email non vérifié. Vérifie ta boîte mail ou renvoie l\'email de vérification.');
        setShowVerificationMessage(true);
      } else if (errorData.email) {
        setError(errorData.email.message || 'Erreur avec l\'email');
      } else if (errorData.password) {
        setError(errorData.password.message || 'Erreur avec le mot de passe');
      } else if (errorData.message) {
        setError(errorData.message);
      } else {
        setError(errorMessage || 'Identifiants incorrects ou erreur de connexion.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir l\'email et le mot de passe d\'abord.');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsResendingVerification(true);

    try {
      await resendVerificationEmail(formData.email, formData.password);
      setSuccessMessage('Email de vérification renvoyé ! Vérifie ta boîte mail.');
    } catch (err: any) {
      const errorMessage = err?.message || '';
      if (errorMessage === 'EMAIL_ALREADY_VERIFIED') {
        setSuccessMessage('Ton email est déjà vérifié !');
      } else {
        setError(errorMessage || 'Impossible d\'envoyer l\'email. Réessaie dans 1 min.');
      }
    } finally {
      setIsResendingVerification(false);
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
            <h1 className="login-title">Connexion</h1>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
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
                placeholder="Email ou téléphone"
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
                placeholder="Mot de passe"
                required
              />
            </div>

            <div className="login-options">
              <label className="login-checkbox">
                <input type="checkbox" />
                <span>Se souvenir de moi</span>
              </label>
              <a href="#" className="login-forgot">
                Mot de passe oublié ?
              </a>
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

            {showVerificationMessage && (
              <div className="login-verification-box">
                <p className="login-verification-text">
                  Tu n'as pas reçu l'email de vérification ?
                </p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="login-resend-btn"
                  disabled={isResendingVerification || !formData.email || !formData.password}
                >
                  {isResendingVerification ? 'Envoi...' : 'Renvoyer l\'email de vérification'}
                </button>
              </div>
            )}

            <button 
              type="submit" 
              className="login-submit"
              disabled={isLoading}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="login-signup-link">
            <p>
              Pas encore de compte ?{' '}
              <a href="/signup" className="login-signup-link-text">
                Créer un compte
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
