'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ProjectWizard from '@/components/ProjectWizard';

function NewProjectPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (!user.emailVerified) {
      router.push('/login?reason=verify');
      return;
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="wizard-page">
        <div className="wizard-container">
          <div className="wizard-loading">
            <div className="loading-spinner"></div>
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Écran de succès après soumission
  const success = searchParams.get('success');
  if (success === 'true') {
    return (
      <div className="wizard-page">
        <div className="wizard-container">
          <div className="wizard-success">
            <div className="wizard-success-icon">✓</div>
            <h2>Merci pour votre soumission</h2>
            <p>Vos réponses ont été enregistrées avec succès.</p>
            <p className="wizard-success-note">Les fonctionnalités de paiement et de traitement automatisé seront disponibles prochainement.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="wizard-btn wizard-btn-primary"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <ProjectWizard />;
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={
      <div className="wizard-page">
        <div className="wizard-container">
          <div className="wizard-loading">
            <div className="loading-spinner"></div>
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    }>
      <NewProjectPageContent />
    </Suspense>
  );
}
