'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginWithEmailPassword, signupWithEmailPassword, resendVerificationEmail } from '@/lib/auth';
import './login-signup.css';

export default function LoginSignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    const reason = searchParams.get('reason');
    const verified = searchParams.get('verified');
    const error = searchParams.get('error');

    if (reason === 'verify') {
      setError('Vérifie ta boîte mail avant de te connecter.');
      setShowVerificationMessage(true);
      setIsLoginMode(true);
    } else if (verified === '1') {
      setSuccessMessage('Email vérifié avec succès ! Tu peux maintenant te connecter.');
      setIsLoginMode(true);
    } else if (error === 'verify') {
      setError('La vérification a échoué. Le lien est peut-être expiré ou invalide.');
      setShowVerificationMessage(true);
      setIsLoginMode(true);
    }
  }, [searchParams]);

  const handleBackToHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    sessionStorage.setItem('fromLogin', 'true');
    router.push('/');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setShowVerificationMessage(false);
    setIsLoading(true);

    try {
      await loginWithEmailPassword(loginData.email, loginData.password);
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      await signupWithEmailPassword(
        signupData.email,
        signupData.password,
        signupData.name || undefined
      );

      setSuccessMessage('Compte créé ! Un email de vérification a été envoyé. Vérifie ta boîte mail avant de te connecter.');
      
      setTimeout(() => {
        setIsLoginMode(true);
        setSuccessMessage('Email de vérification envoyé. Connecte-toi après avoir vérifié ton email.');
      }, 2000);
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

  const handleResendVerification = async () => {
    if (!loginData.email || !loginData.password) {
      setError('Veuillez remplir l\'email et le mot de passe d\'abord.');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsResendingVerification(true);

    try {
      await resendVerificationEmail(loginData.email, loginData.password);
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
    <div className="login-signup-page">
      <div className="background">
        <div className="shape shape-blue"></div>
        <div className="shape shape-purple"></div>
      </div>

      {/* Login Form */}
      {isLoginMode && (
        <form onSubmit={handleLogin} className="auth-form">
          {/* Mode Toggle */}
          <div className="mode-toggle">
            <button
              type="button"
              className={`toggle-btn ${isLoginMode ? 'active' : ''}`}
              onClick={() => {
                setIsLoginMode(true);
                setError(null);
                setSuccessMessage(null);
              }}
            >
              Connexion
            </button>
            <button
              type="button"
              className={`toggle-btn ${!isLoginMode ? 'active' : ''}`}
              onClick={() => {
                setIsLoginMode(false);
                setError(null);
                setSuccessMessage(null);
              }}
            >
              Créer un compte
            </button>
          </div>
          <h3>Connexion</h3>

          {error && (
            <div className="form-error">{error}</div>
          )}
          {successMessage && (
            <div className="form-success">{successMessage}</div>
          )}

          <label htmlFor="login-email">Email</label>
          <input
            type="email"
            id="login-email"
            placeholder="Email"
            value={loginData.email}
            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
            required
          />

          <label htmlFor="login-password">Mot de passe</label>
          <input
            type="password"
            id="login-password"
            placeholder="Mot de passe"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            required
          />

          {showVerificationMessage && (
            <div className="form-verification">
              <p>Tu n'as pas reçu l'email de vérification ?</p>
              <button
                type="button"
                onClick={handleResendVerification}
                className="resend-btn"
                disabled={isResendingVerification || !loginData.email || !loginData.password}
              >
                {isResendingVerification ? 'Envoi...' : 'Renvoyer l\'email'}
              </button>
            </div>
          )}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
          
          <a 
            href="/" 
            className="login-back-link"
            onClick={handleBackToHome}
          >
            ← Retour à l'accueil
          </a>
        </form>
      )}

      {/* Signup Form */}
      {!isLoginMode && (
        <form onSubmit={handleSignup} className="auth-form">
          {/* Mode Toggle */}
          <div className="mode-toggle">
            <button
              type="button"
              className={`toggle-btn ${isLoginMode ? 'active' : ''}`}
              onClick={() => {
                setIsLoginMode(true);
                setError(null);
                setSuccessMessage(null);
              }}
            >
              Connexion
            </button>
            <button
              type="button"
              className={`toggle-btn ${!isLoginMode ? 'active' : ''}`}
              onClick={() => {
                setIsLoginMode(false);
                setError(null);
                setSuccessMessage(null);
              }}
            >
              Créer un compte
            </button>
          </div>
          <h3>Créer un compte</h3>

          {error && (
            <div className="form-error">{error}</div>
          )}
          {successMessage && (
            <div className="form-success">{successMessage}</div>
          )}

          <label htmlFor="signup-name">Nom</label>
          <input
            type="text"
            id="signup-name"
            placeholder="Nom"
            value={signupData.name}
            onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
          />

          <label htmlFor="signup-email">Email</label>
          <input
            type="email"
            id="signup-email"
            placeholder="Email"
            value={signupData.email}
            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
            required
          />

          <label htmlFor="signup-password">Mot de passe</label>
          <input
            type="password"
            id="signup-password"
            placeholder="Mot de passe"
            value={signupData.password}
            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
            required
            minLength={6}
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Création...' : 'S\'inscrire'}
          </button>
          
          <a 
            href="/" 
            className="login-back-link"
            onClick={handleBackToHome}
          >
            ← Retour à l'accueil
          </a>
        </form>
      )}
    </div>
  );
}
