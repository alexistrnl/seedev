'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { applyActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getAuthErrorMessage } from '@/lib/auth-errors';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const mode = searchParams.get('mode');
      const oobCode = searchParams.get('oobCode');

      // Vérifier que oobCode est présent
      if (!oobCode) {
        setStatus('error');
        setErrorMessage('Lien invalide. Aucun code de vérification trouvé.');
        return;
      }

      // Vérifier que mode est correct
      if (mode !== 'verifyEmail') {
        setStatus('error');
        setErrorMessage('Lien invalide. Mode de vérification incorrect.');
        return;
      }

      try {
        // Appliquer le code de vérification
        await applyActionCode(auth, oobCode);
        
        // Succès
        setStatus('success');
        
        // Rediriger vers login après un court délai
        setTimeout(() => {
          router.replace('/login?verified=1');
        }, 2000);
      } catch (error: any) {
        // Gérer l'erreur
        const errorCode = error?.code || '';
        setStatus('error');
        setErrorMessage(getAuthErrorMessage(errorCode, 'Lien invalide ou expiré.'));
        
        // Rediriger vers login après un court délai
        setTimeout(() => {
          router.replace('/login?error=verify');
        }, 3000);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0a0a0a',
        color: '#fff'
      }}>
        <div style={{
          background: 'rgba(38, 38, 38, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '3rem',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            marginBottom: '1rem',
            color: '#fff'
          }}>
            Vérification en cours…
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Veuillez patienter pendant que nous vérifions votre email.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0a0a0a',
        color: '#fff'
      }}>
        <div style={{
          background: 'rgba(38, 38, 38, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '24px',
          padding: '3rem',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2rem'
          }}>
            ✓
          </div>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            marginBottom: '1rem',
            color: '#fff'
          }}>
            Email vérifié !
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '1.5rem' }}>
            Redirection vers la page de connexion…
          </p>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#0a0a0a',
      color: '#fff',
      padding: '2rem'
    }}>
      <div style={{
        background: 'rgba(38, 38, 38, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '24px',
        padding: '3rem',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: '2rem'
        }}>
          ✗
        </div>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 600, 
          marginBottom: '1rem',
          color: '#fff'
        }}>
          Erreur de vérification
        </h1>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.8)', 
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          {errorMessage || 'Lien invalide ou expiré'}
        </p>
        <button
          onClick={() => router.replace('/login')}
          style={{
            padding: '0.875rem 2rem',
            background: 'rgba(34, 197, 94, 0.2)',
            border: '2px solid rgba(34, 197, 94, 0.5)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            width: '100%'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(34, 197, 94, 0.3)';
            e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.7)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.5)';
          }}
        >
          Retour à la connexion
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0a0a0a',
        color: '#fff'
      }}>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          Chargement…
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
