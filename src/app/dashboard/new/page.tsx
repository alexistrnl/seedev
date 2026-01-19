'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { pb } from '@/lib/pocketbase';
import { isV2, hydrateFormStateFromAnswersV2, type IntakeAnswers } from '@/lib/intake';
import ProjectWizard from '@/components/ProjectWizard';

interface ProjectIntake {
  id: string;
  project_name: string;
  status: 'submitted' | 'under_analysis' | 'analysis_sent' | 'waiting_validation' | 'approved_for_dev';
  answers: IntakeAnswers;
  owner: string;
}

function NewProjectPageContent() {
  // TOUS LES HOOKS DOIVENT ÊTRE APPELÉS EN PREMIER, AVANT TOUT RETURN CONDITIONNEL
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [editProject, setEditProject] = useState<ProjectIntake | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Récupérer la valeur de success et edit AVANT les returns conditionnels
  const success = searchParams.get('success');
  const editId = searchParams.get('edit');

  // Charger le projet en mode édition
  useEffect(() => {
    if (loading || !editId) return;
    if (!pb.authStore.isValid || !pb.authStore.model) return;

    const loadEditProject = async () => {
      setEditLoading(true);
      setEditError(null);

      try {
        const project = await pb.collection('project_intakes').getOne<ProjectIntake>(editId, {
          expand: 'owner',
        });

        // Vérifier ownership
        if (project.owner !== pb.authStore.model!.id) {
          setEditError('Accès refusé. Ce projet ne vous appartient pas.');
          setEditLoading(false);
          return;
        }

        // Vérifier status
        if (project.status !== 'submitted') {
          setEditError('Modifications verrouillées. Ce projet ne peut plus être modifié une fois l\'analyse démarrée.');
          setEditLoading(false);
          return;
        }

        setEditProject(project);
      } catch (err: any) {
        console.error('[Edit] Erreur lors du chargement du projet:', err);
        setEditError(err?.message || 'Erreur lors du chargement du projet');
      } finally {
        setEditLoading(false);
      }
    };

    loadEditProject();
  }, [editId, loading, user]);

  // useEffect pour l'auth
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

  // MAINTENANT on peut faire les returns conditionnels APRÈS tous les hooks
  if (loading || editLoading) {
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

  // Erreur en mode édition
  if (editId && editError) {
    return (
      <div className="wizard-page">
        <div className="wizard-container">
          <div className="wizard-error">
            <h2>Erreur</h2>
            <p>{editError}</p>
            <button
              onClick={() => router.push('/projects')}
              className="wizard-btn wizard-btn-primary"
            >
              Retour à mes projets
            </button>
          </div>
        </div>
      </div>
    );
  }

  // En mode édition, attendre que le projet soit chargé
  if (editId && !editProject) {
    return (
      <div className="wizard-page">
        <div className="wizard-container">
          <div className="wizard-loading">
            <div className="loading-spinner"></div>
            <p>Chargement du projet...</p>
          </div>
        </div>
      </div>
    );
  }

  // Écran de succès après soumission
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

  // Préparer les données initiales en mode édition
  let initialFormState = undefined;
  if (editProject && isV2(editProject.answers)) {
    initialFormState = hydrateFormStateFromAnswersV2(editProject.answers);
  }

  return (
    <ProjectWizard 
      editMode={!!editId}
      editProjectId={editId || undefined}
      initialFormState={initialFormState}
    />
  );
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
