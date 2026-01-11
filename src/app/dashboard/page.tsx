'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/auth';
import './dashboard.css';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    // Si on charge encore, attendre
    if (loading) return;

    // Si pas d'utilisateur, rediriger vers login
    if (!user) {
      router.push('/login');
      return;
    }

    // Si email non vérifié, rediriger vers login avec raison
    if (!user.emailVerified) {
      router.push('/login?reason=verify');
      return;
    }

    // Charger les projets de l'utilisateur
    loadProjects();
  }, [user, loading, router]);

  const loadProjects = async () => {
    try {
      // TODO: Implémenter le chargement des projets avec la nouvelle base de données
      // Exemple: const projectsData = await projectService.getUserProjects();
      // setProjects(projectsData);
      setProjects([]);
    } catch (error) {
      console.log('Erreur lors du chargement des projets');
      setProjects([]);
    }
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

  // Si pas d'utilisateur ou email non vérifié, ne rien afficher (redirection en cours)
  if (!user || !user.emailVerified) {
    return null;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <div className="dashboard-header-content">
            <h1 className="dashboard-title">SEEDEV</h1>
            <div className="dashboard-user-info">
              <span className="dashboard-user-name">{user?.displayName || user?.email}</span>
              <button onClick={handleLogout} className="dashboard-logout-btn">
                Déconnexion
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="dashboard-main">
          {/* Section Bienvenue */}
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">Bienvenue {user?.displayName || user?.email || 'sur votre dashboard'} !</h2>
            <p className="dashboard-section-subtitle">
              Gérez vos projets et suivez leur avancement
            </p>
          </section>

          {/* Informations utilisateur */}
          <section className="dashboard-section">
            <div className="dashboard-card">
              <h3 className="dashboard-card-title">Mes informations</h3>
              <div className="dashboard-info-grid">
                <div className="dashboard-info-item">
                  <span className="dashboard-info-label">Email</span>
                  <span className="dashboard-info-value">{user?.email}</span>
                </div>
                {user?.displayName && (
                  <div className="dashboard-info-item">
                    <span className="dashboard-info-label">Nom</span>
                    <span className="dashboard-info-value">{user.displayName}</span>
                  </div>
                )}
                <div className="dashboard-info-item">
                  <span className="dashboard-info-label">Email vérifié</span>
                  <span className="dashboard-info-value">
                    {user?.emailVerified ? '✓ Oui' : '✗ Non'}
                  </span>
                </div>
                {user?.metadata?.creationTime && (
                  <div className="dashboard-info-item">
                    <span className="dashboard-info-label">Compte créé le</span>
                    <span className="dashboard-info-value">
                      {new Date(user.metadata.creationTime).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Projets */}
          <section className="dashboard-section">
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3 className="dashboard-card-title">Mes projets</h3>
                <button className="dashboard-add-btn">
                  + Nouveau projet
                </button>
              </div>
              
              {projects.length === 0 ? (
                <div className="dashboard-empty">
                  <p className="dashboard-empty-text">
                    Vous n'avez pas encore de projet.
                  </p>
                  <p className="dashboard-empty-subtext">
                    Créez votre premier projet pour commencer !
                  </p>
                </div>
              ) : (
                <div className="dashboard-projects-grid">
                  {projects.map((project) => (
                    <div key={project.id} className="dashboard-project-card">
                      <h4 className="dashboard-project-title">{project.name || 'Projet sans nom'}</h4>
                      <p className="dashboard-project-description">
                        {project.description || 'Aucune description'}
                      </p>
                      <div className="dashboard-project-meta">
                        <span className="dashboard-project-status">
                          {project.status || 'En attente'}
                        </span>
                        <span className="dashboard-project-date">
                          {new Date(project.created).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Actions rapides */}
          <section className="dashboard-section">
            <div className="dashboard-card">
              <h3 className="dashboard-card-title">Actions rapides</h3>
              <div className="dashboard-actions">
                <button className="dashboard-action-btn">
                  Soumettre une idée
                </button>
                <button className="dashboard-action-btn">
                  Voir mes tarifs
                </button>
                <a href="/" className="dashboard-action-btn dashboard-action-link">
                  Retour à l'accueil
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}


