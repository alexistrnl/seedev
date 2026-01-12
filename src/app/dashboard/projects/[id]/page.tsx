'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { pb } from '@/lib/pocketbase';
import type { Project } from '@/types/project';
import '../../dashboard.css';

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const projectId = params.id as string;

  useEffect(() => {
    // Attendre que l'auth soit chargée
    if (authLoading) return;

    // Si pas d'utilisateur, rediriger vers login
    if (!user) {
      router.push('/login');
      return;
    }

    // Vérifier si l'email est vérifié
    if (!user.emailVerified) {
      router.push('/login?reason=verify');
      return;
    }

    // Charger le projet
    loadProject();
  }, [user, authLoading, router, projectId]);

  const loadProject = async () => {
    if (!projectId) {
      setError('ID de projet manquant');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const projectData = await pb.collection('projects').getOne<Project>(projectId);
      setProject(projectData);
    } catch (error: any) {
      console.error('[Project] Erreur lors du chargement du projet:', error);
      if (error?.status === 404) {
        setError('Projet introuvable');
      } else if (error?.status === 403) {
        setError('Vous n\'avez pas accès à ce projet');
      } else {
        setError('Erreur lors du chargement du projet');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'rgba(251, 191, 36, 0.2)';
      case 'in_progress':
        return 'rgba(34, 197, 94, 0.2)';
      case 'completed':
        return 'rgba(59, 130, 246, 0.2)';
      default:
        return 'rgba(255, 255, 255, 0.1)';
    }
  };

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'rgba(251, 191, 36, 0.3)';
      case 'in_progress':
        return 'rgba(34, 197, 94, 0.3)';
      case 'completed':
        return 'rgba(59, 130, 246, 0.3)';
      default:
        return 'rgba(255, 255, 255, 0.1)';
    }
  };

  // Afficher un loader pendant le chargement de l'auth
  if (authLoading || isLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur, ne rien afficher (redirection en cours)
  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <div className="dashboard-header-content">
            <h1 className="dashboard-title">Projet</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="dashboard-main">
          {error ? (
            <section className="dashboard-section">
              <div className="dashboard-card">
                <div className="dashboard-empty">
                  <p className="dashboard-empty-text" style={{ color: 'rgba(239, 68, 68, 0.9)' }}>
                    {error}
                  </p>
                  <div className="dashboard-empty-button">
                    <button
                      className="dashboard-add-btn"
                      onClick={() => router.push('/dashboard')}
                    >
                      <span>Retour au dashboard</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          ) : project ? (
            <>
              <section className="dashboard-section">
                <div className="dashboard-card">
                  <h3 className="dashboard-card-title">{project.name}</h3>
                  <div className="dashboard-info-grid">
                    <div className="dashboard-info-item">
                      <span className="dashboard-info-label">Statut</span>
                      <span 
                        className="dashboard-info-value"
                        style={{
                          display: 'inline-block',
                          padding: '0.5rem 1rem',
                          background: getStatusColor(project.status),
                          border: `2px solid ${getStatusBorderColor(project.status)}`,
                          borderRadius: '8px',
                          fontWeight: 600
                        }}
                      >
                        {getStatusLabel(project.status)}
                      </span>
                    </div>
                    <div className="dashboard-info-item">
                      <span className="dashboard-info-label">Date de création</span>
                      <span className="dashboard-info-value">
                        {new Date(project.created).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {project.updated !== project.created && (
                      <div className="dashboard-info-item">
                        <span className="dashboard-info-label">Dernière modification</span>
                        <span className="dashboard-info-value">
                          {new Date(project.updated).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="dashboard-section">
                <div className="dashboard-card">
                  <div className="dashboard-empty-button">
                    <button
                      className="dashboard-add-btn"
                      onClick={() => router.push('/dashboard')}
                    >
                      <span>Retour au dashboard</span>
                    </button>
                  </div>
                </div>
              </section>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
