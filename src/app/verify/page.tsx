'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { resendVerificationEmail } from '@/lib/auth';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import '../login/login.css';

export default function VerifyPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Si l'utilisateur est connecté et que son email est déjà vérifié, rediriger
    if (!authLoading && user && user.emailVerified) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleResendEmail = async () => {
    if (!user) {
      setError('Tu dois être connecté pour renvoyer l\'email de vérification.');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsResending(true);

    try {
      await resendVerificationEmail();
      setSuccessMessage('Email de vérification renvoyé ! Vérifie ta boîte mail.');
    } catch (err: any) {
      const errorCode = err?.code || '';
      const errorMessage = err?.message || '';

      if (errorMessage === 'EMAIL_ALREADY_VERIFIED') {
        setSuccessMessage('Ton email est déjà vérifié ! Redirection...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(getAuthErrorMessage(errorCode, errorMessage));
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  if (authLoading) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Chargement...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">SEEDEV</h1>
            <p className="login-subtitle">Vérification d'email</p>
          </div>

          <div style={{ padding: '1rem 0' }}>
            {user ? (
              <>
                <div style={{ 
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '2px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '0.5rem',
                    fontWeight: 500
                  }}>
                    Email connecté :
                  </p>
                  <p style={{ 
                    color: '#86efac',
                    fontSize: '1.1rem',
                    fontWeight: 600
                  }}>
                    {user.email}
                  </p>
                </div>

                {user.emailVerified ? (
                  <div style={{ 
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '2px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem',
                    textAlign: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <p style={{ color: '#86efac', fontWeight: 500 }}>
                      ✓ Ton email est déjà vérifié !
                    </p>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="login-submit"
                      style={{ marginTop: '1rem', width: '100%' }}
                    >
                      Aller au dashboard
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ 
                      background: 'rgba(255, 193, 7, 0.1)',
                      border: '2px solid rgba(255, 193, 7, 0.3)',
                      borderRadius: '12px',
                      padding: '1rem',
                      marginBottom: '1.5rem',
                      textAlign: 'center'
                    }}>
                      <p style={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        marginBottom: '0.5rem'
                      }}>
                        Un email de vérification a été envoyé à <strong>{user.email}</strong>
                      </p>
                      <p style={{ 
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.9rem'
                      }}>
                        Clique sur le lien dans l'email pour vérifier ton compte.
                      </p>
                    </div>

                    {error && (
                      <div className="login-error" style={{ marginBottom: '1rem' }}>
                        {error}
                      </div>
                    )}

                    {successMessage && (
                      <div className="login-success" style={{ marginBottom: '1rem' }}>
                        {successMessage}
                      </div>
                    )}

                    <button
                      onClick={handleResendEmail}
                      className="login-submit"
                      disabled={isResending}
                      style={{ width: '100%', marginBottom: '1rem' }}
                    >
                      {isResending ? 'Envoi...' : 'Renvoyer l\'email de vérification'}
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <div style={{ 
                  background: 'rgba(255, 193, 7, 0.1)',
                  border: '2px solid rgba(255, 193, 7, 0.3)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '1rem'
                  }}>
                    Un email de vérification a été envoyé.
                  </p>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.9rem',
                    marginBottom: '1rem'
                  }}>
                    Clique sur le lien dans l'email pour vérifier ton compte.
                  </p>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.85rem'
                  }}>
                    Si tu n'as pas reçu l'email, connecte-toi pour le renvoyer.
                  </p>
                </div>

                <button
                  onClick={handleGoToLogin}
                  className="login-submit"
                  style={{ width: '100%' }}
                >
                  Se connecter
                </button>
              </>
            )}
          </div>

          <div className="login-signup-link">
            <a href="/" className="login-signup-link-text">
              ← Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
