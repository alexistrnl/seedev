'use client';

/**
 * DASHBOARD - Gestion des projets
 * 
 * FETCH PROJETS: loadProjects() - ligne ~45
 *   Utilise pb.collection('projects').getFullList() pour charger tous les projets de l'utilisateur connecté
 *   Les règles PocketBase filtrent automatiquement par owner = @request.auth.id
 * 
 * CRÉATION PROJET: handleCreateProject() - ligne ~55
 *   Ouvre un modal pour saisir le nom du projet
 *   Utilise pb.collection('projects').create() pour créer le projet avec status 'draft'
 * 
 * NAVIGATION: handleProjectClick() - ligne ~80
 *   Redirige vers /dashboard/projects/[id] au clic sur une card de projet
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/auth';
import { pb } from '@/lib/pocketbase';
import type { Project } from '@/types/project';
import './dashboard.css';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  useEffect(() => {
    // Si on charge encore, attendre
    if (loading) return;

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

    // Charger les projets de l'utilisateur
    loadProjects();
  }, [user, loading, router]);

  // FETCH PROJETS: Charger les projets de l'utilisateur depuis PocketBase
  const loadProjects = async () => {
    if (!pb.authStore.isValid) {
      setProjects([]);
      return;
    }

    setIsLoadingProjects(true);
    try {
      // Les règles PocketBase filtrent automatiquement par owner = @request.auth.id
      const projectsData = await pb.collection('projects').getFullList<Project>({
        sort: '-created',
      });
      setProjects(projectsData);
    } catch (error: any) {
      console.error('[Dashboard] Erreur lors du chargement des projets:', error);
      setProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  };


  // NAVIGATION: Ouvrir un projet
  const handleProjectClick = (projectId: string) => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Afficher un loader pendant le chargement de l'auth
  if (loading) {
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
        {/* Bouton de déconnexion en position fixe */}
        <button onClick={handleLogout} className="dashboard-logout-btn-fixed">
          <span>Déconnexion</span>
        </button>

        {/* Main Content - Deux cartes principales */}
        <main className="dashboard-main-cards">
          {/* Carte 1: Créer un projet */}
          <div className="dashboard-card-container dashboard-card-container-create">
            <div 
              className="dashboard-card dashboard-card-create"
              onClick={() => router.push('/dashboard/new')}
            >
              <div className="dashboard-main-card-header">
                <h2 className="dashboard-main-card-title">Lancer mon projet</h2>
                <div className="dashboard-main-card-icon">+</div>
              </div>
              <p className="dashboard-main-card-description">
                Transformez vos idées en projets concrets. Lancez votre nouveau projet dès maintenant.
              </p>
              <div className="dashboard-layers">
                <div className="dashboard-layer"></div>
                <div className="dashboard-layer"></div>
                <div className="dashboard-layer"></div>
                <div className="dashboard-layer"></div>
                <div className="dashboard-layer"></div>
                <div className="dashboard-layer"></div>
                <div className="dashboard-layer"></div>
                <div className="dashboard-layer"></div>
                <div className="dashboard-layer"></div>
                <div className="dashboard-layer"></div>
              </div>
            </div>
          </div>

          {/* Carte 2: Mes projets */}
          <div className="dashboard-card-container dashboard-card-container-projects">
            <div className="dashboard-card dashboard-card-projects">
              <div className="dashboard-main-card-header">
                <h2 className="dashboard-main-card-title">Mes projets</h2>
                <div className="dashboard-main-card-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>
              </div>
            {isLoadingProjects ? (
              <div className="dashboard-projects-loading">
                <p>Chargement des projets...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="dashboard-projects-empty">
                <p>Aucun projet pour le moment</p>
                <p className="dashboard-projects-empty-hint">
                  Créez votre premier projet en cliquant sur la carte du haut
                </p>
              </div>
            ) : (
              <div className="dashboard-projects-list">
                {projects.map((project) => (
                  <div 
                    key={project.id} 
                    className="dashboard-project-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProjectClick(project.id);
                    }}
                  >
                    <div className="dashboard-project-item-content">
                      <h3 className="dashboard-project-item-title">
                        {project.name || 'Projet sans nom'}
                      </h3>
                      <div className="dashboard-project-item-meta">
                        <span className="dashboard-project-item-status">
                          {project.status === 'draft' ? 'Brouillon' : 
                           project.status === 'in_progress' ? 'En cours' : 
                           'Terminé'}
                        </span>
                        <span className="dashboard-project-item-date">
                          {new Date(project.created).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="dashboard-project-item-arrow">→</div>
                  </div>
                ))}
              </div>
            )}
              <div className="dashboard-layers">
                <div className="dashboard-layer"></div>
                <div className="dashboard-layer"></div>
                <div className="dashboard-layer"></div>
                <div className="dashboard-layer"></div>
                <div className="dashboard-layer"></div>
                <div className="dashboard-layer"></div>
                <div className="dashboard-layer"></div>
                <div className="dashboard-layer"></div>
                <div className="dashboard-layer"></div>
                <div className="dashboard-layer"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


