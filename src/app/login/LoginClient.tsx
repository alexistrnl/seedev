'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginWithEmailPassword, resendVerificationEmail } from '@/lib/auth';
import { getAuthErrorMessage } from '@/lib/auth-errors';
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
      const errorCode = err?.code || '';
      const errorMessage = err?.message || '';

      if (errorMessage === 'EMAIL_NOT_VERIFIED') {
        setError('Email non vérifié. Vérifie ta boîte mail ou renvoie l\'email de vérification.');
        setShowVerificationMessage(true);
      } else {
        setError(getAuthErrorMessage(errorCode, errorMessage));
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
      const errorCode = err?.code || '';
      setError(getAuthErrorMessage(errorCode, err?.message));
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
            <h1 className="login-title">SEEDEV</h1>
            <p className="login-subtitle">De l'idée au MVP</p>
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

          <div className="login-divider">
            <span>ou</span>
          </div>

          <div className="login-social">
            <button className="login-social-btn">
              <svg className="login-social-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuer avec Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
