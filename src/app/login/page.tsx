'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pb';
import './login.css';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  const handleBackToHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Marquer qu'on vient de la page de login AVANT la navigation
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
      if (isLogin) {
        // Connexion avec PocketBase
        const authData = await pb.collection('users').authWithPassword(
          formData.email,
          formData.password
        );
        
        // Vérifier si l'email est vérifié
        if (!authData.record.verified) {
          pb.authStore.clear();
          setError('Email non vérifié. Vérifie ta boîte mail ou renvoie l\'email de vérification.');
          setShowVerificationMessage(true);
          setIsLoading(false);
          return;
        }
        
        // Rediriger vers le dashboard après connexion réussie
        router.push('/dashboard');
      } else {
        // Vérifier que les mots de passe correspondent
        if (formData.password !== formData.confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          setIsLoading(false);
          return;
        }

        // Créer un compte avec PocketBase
        const data = {
          email: formData.email,
          password: formData.password,
          passwordConfirm: formData.confirmPassword,
          name: formData.name,
        };

        await pb.collection('users').create(data);
        
        // Envoyer l'email de vérification
        try {
          await pb.collection('users').requestVerification(formData.email);
          setSuccessMessage('Compte créé ! Un email de vérification a été envoyé. Vérifie ta boîte mail avant de te connecter.');
          setShowVerificationMessage(true);
          setIsLoading(false);
          // Passer à l'onglet connexion après inscription réussie
          setTimeout(() => {
            setIsLogin(true);
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '', name: '' }));
          }, 2000);
        } catch (verificationErr: any) {
          // Le compte existe mais l'email n'a pas pu être envoyé
          setError('Compte créé mais l\'email de vérification n\'a pas pu être envoyé. Clique sur "Renvoyer l\'email" ci-dessous.');
          setShowVerificationMessage(true);
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      // Gérer les erreurs PocketBase
      if (err?.response?.data) {
        const errorData = err.response.data;
        if (errorData.email) {
          setError(errorData.email.message || 'Erreur avec l\'email');
          // Si c'est une erreur d'email non vérifié lors de la connexion
          if (errorData.email.message?.toLowerCase().includes('vérif') || 
              errorData.message?.toLowerCase().includes('vérif')) {
            setShowVerificationMessage(true);
          }
        } else if (errorData.password) {
          setError(errorData.password.message || 'Erreur avec le mot de passe');
        } else if (errorData.message) {
          const errorMsg = errorData.message.toLowerCase();
          if (errorMsg.includes('vérif') || errorMsg.includes('verified')) {
            setShowVerificationMessage(true);
          }
          setError(errorData.message);
        } else {
          setError('Une erreur est survenue. Veuillez réessayer.');
        }
      } else if (err?.message?.toLowerCase().includes('vérif') || 
                 err?.message?.toLowerCase().includes('verified')) {
        setError(err.message);
        setShowVerificationMessage(true);
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      setError('Veuillez saisir votre email d\'abord.');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsResendingVerification(true);

    try {
      await pb.collection('users').requestVerification(formData.email);
      setSuccessMessage('Email de vérification renvoyé ! Vérifie ta boîte mail.');
    } catch (err: any) {
      if (err?.response?.data?.message) {
        setError(`Impossible d'envoyer l'email. ${err.response.data.message}. Réessaie dans 1 min.`);
      } else {
        setError('Impossible d\'envoyer l\'email. Réessaie dans 1 min.');
      }
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

          <div className="login-tabs">
            <button
              className={`login-tab ${isLogin ? 'login-tab--active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Se connecter
            </button>
            <button
              className={`login-tab ${!isLogin ? 'login-tab--active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Créer un compte
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <div className="login-field">
                <label htmlFor="name" className="login-label">
                  Nom
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="login-input"
                  placeholder="Votre nom"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="login-field">
              <label htmlFor="email" className="login-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
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
                onChange={handleChange}
                className="login-input"
                placeholder="••••••••"
                required
              />
            </div>

            {!isLogin && (
              <div className="login-field">
                <label htmlFor="confirmPassword" className="login-label">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="login-input"
                  placeholder="••••••••"
                  required={!isLogin}
                />
              </div>
            )}

            {isLogin && (
              <div className="login-options">
                <label className="login-checkbox">
                  <input type="checkbox" />
                  <span>Se souvenir de moi</span>
                </label>
                <a href="#" className="login-forgot">
                  Mot de passe oublié ?
                </a>
              </div>
            )}

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
                  disabled={isResendingVerification || !formData.email}
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
              {isLoading 
                ? (isLogin ? 'Connexion...' : 'Création du compte...') 
                : (isLogin ? 'Se connecter' : 'Créer mon compte')
              }
            </button>
          </form>

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

