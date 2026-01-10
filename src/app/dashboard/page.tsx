'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pb';
import './dashboard.css';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    if (!pb.authStore.isValid) {
      router.push('/login');
      return;
    }

    // Récupérer les informations de l'utilisateur
    setUser(pb.authStore.model);
    
    // Charger les projets de l'utilisateur
    loadProjects();
    setIsLoading(false);
  }, [router]);

  const loadProjects = async () => {
    try {
      // Récupérer les projets de l'utilisateur connecté
      const records = await pb.collection('projects').getList(1, 20, {
        filter: `user = "${pb.authStore.model?.id}"`,
        sort: '-created',
      });
      setProjects(records.items);
    } catch (error) {
      // Si la collection n'existe pas encore, on continue sans erreur
      console.log('Collection projects non disponible pour le moment');
      setProjects([]);
    }
  };

  const handleLogout = () => {
    pb.authStore.clear();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <div className="dashboard-header-content">
            <h1 className="dashboard-title">SEEDEV</h1>
            <div className="dashboard-user-info">
              <span className="dashboard-user-name">{user?.name || user?.email}</span>
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
            <h2 className="dashboard-section-title">Bienvenue {user?.name || 'sur votre dashboard'} !</h2>
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
                {user?.name && (
                  <div className="dashboard-info-item">
                    <span className="dashboard-info-label">Nom</span>
                    <span className="dashboard-info-value">{user.name}</span>
                  </div>
                )}
                <div className="dashboard-info-item">
                  <span className="dashboard-info-label">Compte créé le</span>
                  <span className="dashboard-info-value">
                    {user?.created ? new Date(user.created).toLocaleDateString('fr-FR') : 'N/A'}
                  </span>
                </div>
                <div className="dashboard-info-item">
                  <span className="dashboard-info-label">Statut</span>
                  <span className="dashboard-info-value">
                    {user?.verified ? (
                      <span className="status-verified">✓ Vérifié</span>
                    ) : (
                      <span className="status-unverified">En attente de vérification</span>
                    )}
                  </span>
                </div>
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


