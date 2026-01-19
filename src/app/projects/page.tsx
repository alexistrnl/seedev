'use client';

/**
 * PAGE PROJETS - Liste des projets de l'utilisateur connecté
 * 
 * PROTECTION: Vérifie que l'utilisateur est connecté
 * FETCH: Récupère les project_intakes de l'utilisateur avec pagination
 * LAYOUT: Même structure que /admin mais adapté pour l'utilisateur
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { pb } from '@/lib/pocketbase';
import { MAPPINGS, MAPPINGS_V1, type IntakeAnswers, isV2 } from '@/lib/intake';
import '../admin/admin.css';

interface ProjectIntake {
  id: string;
  project_name: string;
  short_title: string;
  status: 'submitted' | 'under_analysis' | 'analysis_sent' | 'waiting_validation' | 'approved_for_dev';
  created: string;
  answers: IntakeAnswers;
  admin_summary?: string;
  analysis?: string;
  recommendation?: string;
  analysis_sent_at?: string;
  needs_db: boolean;
  needs_ai: boolean;
  needs_integrations: boolean;
  needs_payment: boolean;
  owner: string;
  expand?: {
    owner?: {
      id: string;
      email: string;
      name?: string;
    };
  };
}

const STATUS_OPTIONS: Array<{ value: ProjectIntake['status']; label: string }> = [
  { value: 'submitted', label: 'Soumis' },
  { value: 'under_analysis', label: 'En analyse' },
  { value: 'analysis_sent', label: 'Analyse envoyée' },
  { value: 'waiting_validation', label: 'En attente de validation' },
  { value: 'approved_for_dev', label: 'Approuvé pour développement' },
];

const getStatusLabel = (status: ProjectIntake['status']): string => {
  return STATUS_OPTIONS.find(opt => opt.value === status)?.label || status;
};

const getStatusColor = (status: ProjectIntake['status']): string => {
  switch (status) {
    case 'submitted':
      return 'rgba(59, 130, 246, 0.2)'; // bleu
    case 'under_analysis':
      return 'rgba(168, 85, 247, 0.2)'; // violet
    case 'analysis_sent':
      return 'rgba(251, 191, 36, 0.2)'; // jaune
    case 'waiting_validation':
      return 'rgba(249, 115, 22, 0.2)'; // orange
    case 'approved_for_dev':
      return 'rgba(34, 197, 94, 0.2)'; // vert
    default:
      return 'rgba(255, 255, 255, 0.1)';
  }
};

const getStatusBorderColor = (status: ProjectIntake['status']): string => {
  switch (status) {
    case 'submitted':
      return 'rgba(59, 130, 246, 0.4)';
    case 'under_analysis':
      return 'rgba(168, 85, 247, 0.4)';
    case 'analysis_sent':
      return 'rgba(251, 191, 36, 0.4)';
    case 'waiting_validation':
      return 'rgba(249, 115, 22, 0.4)';
    case 'approved_for_dev':
      return 'rgba(34, 197, 94, 0.4)';
    default:
      return 'rgba(255, 255, 255, 0.2)';
  }
};

export default function ProjectsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<ProjectIntake[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedProject, setSelectedProject] = useState<ProjectIntake | null>(null);
  const perPage = 50;

  // Vérifier l'authentification
  useEffect(() => {
    if (authLoading) return;

    // Si pas connecté, rediriger vers login
    if (!pb.authStore.isValid || !pb.authStore.model) {
      router.push('/login');
      return;
    }

    // Charger les projets
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, router, page]);

  // Sélectionner le premier projet quand la liste change
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  // Recharger le projet sélectionné pour récupérer les analyses mises à jour (auto-refresh toutes les 15s)
  useEffect(() => {
    if (!selectedProject || !pb.authStore.isValid) return;

    const selectedProjectId = selectedProject.id; // Capture l'ID pour éviter les dépendances

    const refreshSelectedProject = async () => {
      try {
        const updated = await pb.collection('project_intakes').getOne<ProjectIntake>(
          selectedProjectId,
          { expand: 'owner' }
        );
        setSelectedProject(updated);
        // Mettre à jour aussi dans la liste
        setProjects(prev => prev.map(p => p.id === selectedProjectId ? updated : p));
      } catch (err) {
        console.error('[Projects] Erreur lors du rafraîchissement du projet:', err);
      }
    };

    // Rafraîchir toutes les 15 secondes
    const interval = setInterval(refreshSelectedProject, 15000);
    return () => clearInterval(interval);
  }, [selectedProject?.id]);

  const loadProjects = async () => {
    if (!pb.authStore.isValid || !pb.authStore.model) {
      setError('Non autorisé');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Filtrer uniquement les projets de l'utilisateur connecté
      const userId = pb.authStore.model.id;
      const filter = `owner = "${userId}"`;

      const res = await pb.collection('project_intakes').getList<ProjectIntake>(page, perPage, {
        sort: '-created',
        expand: 'owner',
        filter,
      });

      setProjects(res.items);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    } catch (err: any) {
      console.error('[Projects] Erreur lors du chargement des projets:', err);
      setError(err?.message || 'Erreur lors du chargement des projets');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Fonction pour convertir les slugs en labels lisibles (SAFE)
  const getLabelFromSlug = (mapping: Record<string, string> | undefined | null, slug: string | undefined | null): string => {
    if (!slug || slug.trim() === '') {
      return '—';
    }
    if (!mapping || typeof mapping !== 'object') {
      return String(slug);
    }
    try {
      const entry = Object.entries(mapping).find(([_, value]) => value === slug);
      return entry ? entry[0] : String(slug);
    } catch (e) {
      console.warn('[Projects] Erreur dans getLabelFromSlug:', e);
      return String(slug);
    }
  };

  const renderArrayField = (items: string[] | undefined | null, mapping?: Record<string, string> | undefined | null): string => {
    if (!items || items.length === 0) return '—';
    const labels = items.map(item => mapping ? getLabelFromSlug(mapping, item) : (item || '—'));
    return labels.filter(l => l !== '—').join(', ') || '—';
  };

  const renderTextField = (value: string | undefined): string => {
    return value?.trim() || '—';
  };

  // Afficher un loader pendant le chargement de l'auth
  if (authLoading || isLoading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-loading-spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  // Si erreur d'accès
  if (error && !pb.authStore.isValid) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <h2>Non autorisé</h2>
          <p>Vous devez être connecté pour accéder à cette page.</p>
          <button onClick={() => router.push('/login')} className="admin-btn admin-btn-primary">
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar - Projects List */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2 className="admin-sidebar-logo">Mes Projets</h2>
          <div className="admin-sidebar-header-actions">
            <button 
              onClick={() => router.push('/dashboard')} 
              className="admin-sidebar-back-btn"
              title="Retour au dashboard"
            >
              🏠
            </button>
          </div>
        </div>
        
        <div className="admin-projects-list-header">
          <h3 className="admin-projects-list-title">Projets ({totalItems})</h3>
          <div className="admin-projects-list-header-actions">
            {totalPages > 1 && (
              <span className="admin-projects-list-pagination">Page {page}/{totalPages}</span>
            )}
          </div>
        </div>
        
        <div className="admin-projects-list-scroll">
          {projects.length === 0 ? (
            <div className="admin-projects-list-empty">
              <p>Aucun projet trouvé</p>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className={`admin-projects-list-item ${selectedProject?.id === project.id ? 'admin-projects-list-item-active' : ''}`}
                onClick={() => setSelectedProject(project)}
              >
                <div className="admin-projects-list-item-content">
                  <div className="admin-projects-list-item-header">
                    <h4 className="admin-projects-list-item-title">
                      {project.project_name || project.short_title || 'Sans nom'}
                    </h4>
                    <span
                      className="admin-projects-list-item-status-badge"
                      style={{
                        background: getStatusColor(project.status),
                        borderColor: getStatusBorderColor(project.status),
                      }}
                    >
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                  {project.short_title && project.short_title !== project.project_name && (
                    <p className="admin-projects-list-item-subtitle">{project.short_title}</p>
                  )}
                  <div className="admin-projects-list-item-meta">
                    <span className="admin-projects-list-item-date">
                      {new Date(project.created).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="admin-projects-list-pagination-controls">
            <button
              onClick={() => {
                const newPage = Math.max(1, page - 1);
                setPage(newPage);
              }}
              disabled={page === 1 || isLoading}
              className="admin-btn admin-btn-secondary admin-btn-small"
            >
              ←
            </button>
            <span className="admin-pagination-info">{page}/{totalPages}</span>
            <button
              onClick={() => {
                const newPage = Math.min(totalPages, page + 1);
                setPage(newPage);
              }}
              disabled={page === totalPages || isLoading}
              className="admin-btn admin-btn-secondary admin-btn-small"
            >
              →
            </button>
          </div>
        )}
      </aside>

      {/* Main Content - Project Details */}
      <main className="admin-main-split">
        {selectedProject ? (
          <div className="admin-project-details-split">
            {/* Left Column: Project Details */}
            <div className="admin-project-details-left">
              <ProjectDetailsView 
                project={selectedProject}
                getLabelFromSlug={getLabelFromSlug}
                renderArrayField={renderArrayField}
                renderTextField={renderTextField}
              />
            </div>

            {/* Right Column: Analysis & Recommendation */}
            <div className="admin-project-details-right">
              <div className="admin-project-analysis-section">
                <h2 className="admin-project-analysis-title">Analyse & Recommandation</h2>
                {(selectedProject.analysis || selectedProject.recommendation || selectedProject.status === 'analysis_sent') ? (
                  <div className="admin-project-analysis-content">
                    <div className="admin-project-analysis-field">
                      <label className="admin-project-analysis-label">Analyse</label>
                      <div className="admin-project-analysis-text">
                        {selectedProject.analysis ? (
                          selectedProject.analysis.trim().startsWith('<') ? (
                            <div 
                              dangerouslySetInnerHTML={{ __html: selectedProject.analysis }}
                              style={{ 
                                fontFamily: 'inherit',
                                fontSize: 'inherit',
                                lineHeight: 'inherit',
                                color: 'inherit'
                              }}
                            />
                          ) : (
                            <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{selectedProject.analysis}</p>
                          )
                        ) : (
                          <p style={{ color: '#a1acb8', fontStyle: 'italic', margin: 0 }}>—</p>
                        )}
                      </div>
                    </div>
                    <div className="admin-project-analysis-field">
                      <label className="admin-project-analysis-label">Recommandations</label>
                      <div className="admin-project-analysis-text">
                        {selectedProject.recommendation ? (
                          selectedProject.recommendation.trim().startsWith('<') ? (
                            <div 
                              dangerouslySetInnerHTML={{ __html: selectedProject.recommendation }}
                              style={{ 
                                fontFamily: 'inherit',
                                fontSize: 'inherit',
                                lineHeight: 'inherit',
                                color: 'inherit'
                              }}
                            />
                          ) : (
                            <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{selectedProject.recommendation}</p>
                          )
                        ) : (
                          <p style={{ color: '#a1acb8', fontStyle: 'italic', margin: 0 }}>—</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : selectedProject.status === 'submitted' ? (
                  <div className="admin-project-analysis-message">
                    <div className="admin-project-analysis-message-icon">⏳</div>
                    <h3 className="admin-project-analysis-message-title">Analyse en attente</h3>
                    <p className="admin-project-analysis-message-text">
                      L'analyse de votre projet n'a pas encore débuté. 
                      Il est encore temps de modifier vos réponses si vous souhaitez apporter des changements à votre projet.
                    </p>
                    <button
                      className="admin-project-analysis-edit-btn"
                      onClick={() => {
                        router.push(`/dashboard/new?edit=${selectedProject.id}`);
                      }}
                    >
                      Modifier mes réponses
                    </button>
                  </div>
                ) : selectedProject.status === 'under_analysis' ? (
                  <div className="admin-project-analysis-message">
                    <div className="admin-project-analysis-message-icon">🔍</div>
                    <h3 className="admin-project-analysis-message-title">Analyse en cours</h3>
                    <p className="admin-project-analysis-message-text">
                      Votre projet est actuellement en cours d'analyse par notre équipe. 
                      Vous recevrez les recommandations très prochainement.
                    </p>
                  </div>
                ) : (
                  <div className="admin-project-analysis-message">
                    <div className="admin-project-analysis-message-icon">📋</div>
                    <h3 className="admin-project-analysis-message-title">Analyse disponible</h3>
                    <p className="admin-project-analysis-message-text">
                      L'analyse de votre projet sera disponible ici une fois complétée.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="admin-project-details-empty">
            <p>Sélectionnez un projet pour voir les détails</p>
          </div>
        )}
      </main>
    </div>
  );
}

// Composant pour afficher les détails du projet (sans possibilité de modifier le statut)
function ProjectDetailsView({
  project,
  getLabelFromSlug,
  renderArrayField,
  renderTextField,
}: {
  project: ProjectIntake;
  getLabelFromSlug: (mapping: Record<string, string> | undefined | null, slug: string | undefined | null) => string;
  renderArrayField: (items: string[] | undefined | null, mapping?: Record<string, string> | undefined | null) => string;
  renderTextField: (value: string | undefined) => string;
}) {
  const answers = project.answers || {};
  const isAnswersV2 = isV2(answers);
  const mappings = isAnswersV2 ? MAPPINGS : MAPPINGS_V1;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: ProjectIntake['status']): string => {
    return STATUS_OPTIONS.find(opt => opt.value === status)?.label || status;
  };

  const getStatusColor = (status: ProjectIntake['status']): string => {
    switch (status) {
      case 'submitted': return 'rgba(59, 130, 246, 0.2)';
      case 'under_analysis': return 'rgba(168, 85, 247, 0.2)';
      case 'analysis_sent': return 'rgba(251, 191, 36, 0.2)';
      case 'waiting_validation': return 'rgba(249, 115, 22, 0.2)';
      case 'approved_for_dev': return 'rgba(34, 197, 94, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  };

  const getStatusBorderColor = (status: ProjectIntake['status']): string => {
    switch (status) {
      case 'submitted': return 'rgba(59, 130, 246, 0.4)';
      case 'under_analysis': return 'rgba(168, 85, 247, 0.4)';
      case 'analysis_sent': return 'rgba(251, 191, 36, 0.4)';
      case 'waiting_validation': return 'rgba(249, 115, 22, 0.4)';
      case 'approved_for_dev': return 'rgba(34, 197, 94, 0.4)';
      default: return 'rgba(255, 255, 255, 0.2)';
    }
  };

  return (
    <div className="admin-project-details">
      {/* Header */}
      <div className="admin-project-details-header">
        <div className="admin-project-details-header-content">
          <h1 className="admin-project-details-title">
            {project.project_name || project.short_title || 'Projet sans nom'}
          </h1>
          {project.short_title && project.short_title !== project.project_name && (
            <p className="admin-project-details-subtitle">{project.short_title}</p>
          )}
        </div>
        <div className="admin-project-details-header-actions">
          <span
            className="admin-project-details-status-badge"
            style={{
              background: getStatusColor(project.status),
              borderColor: getStatusBorderColor(project.status),
            }}
          >
            {getStatusLabel(project.status)}
          </span>
        </div>
      </div>

      {/* Answers */}
      <div className="admin-project-details-answers">
        <h2 className="admin-project-details-answers-title">Mes réponses</h2>

        {isAnswersV2 ? (
          // V2 - Nouveau questionnaire
          <>
            {/* Section A - Business */}
            <div className="admin-project-details-section">
              <h3 className="admin-project-details-section-title">A) Business — Viabilité & Potentiel</h3>
              <div className="admin-project-details-section-content">
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Problème principal</label>
                  <p className="admin-project-details-field-value">{renderTextField((answers as any).business?.q1_problem)}</p>
                </div>
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Cible principale</label>
                  <p className="admin-project-details-field-value">{getLabelFromSlug(mappings.target, (answers as any).business?.q2_target)}</p>
                </div>
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Fréquence</label>
                  <p className="admin-project-details-field-value">{getLabelFromSlug(mappings.frequency, (answers as any).business?.q3_frequency)}</p>
                </div>
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Solution actuelle</label>
                  <p className="admin-project-details-field-value">{getLabelFromSlug(mappings.currentSolution, (answers as any).business?.q4_current_solution)}</p>
                </div>
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Pourquoi intéressant</label>
                  <p className="admin-project-details-field-value">{renderTextField((answers as any).business?.q5_interesting)}</p>
                </div>
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Prix estimé</label>
                  <p className="admin-project-details-field-value">{getLabelFromSlug(mappings.priceRange, (answers as any).business?.q6_price_range)}</p>
                </div>
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Modèle revenu</label>
                  <p className="admin-project-details-field-value">{getLabelFromSlug(mappings.revenueModel, (answers as any).business?.q7_revenue_model)}</p>
                </div>
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Concurrence</label>
                  <p className="admin-project-details-field-value">{getLabelFromSlug(mappings.competition, (answers as any).business?.q8_competition)}</p>
                </div>
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Point flou/incertain</label>
                  <p className="admin-project-details-field-value">{renderTextField((answers as any).business?.q9_uncertainty)}</p>
                </div>
              </div>
            </div>

            {/* Section B - Produit */}
            <div className="admin-project-details-section">
              <h3 className="admin-project-details-section-title">B) Produit — Expérience Utilisateur</h3>
              <div className="admin-project-details-section-content">
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Action dès arrivée</label>
                  <p className="admin-project-details-field-value">{getLabelFromSlug(mappings.firstAction, (answers as any).product?.q10_first_action)}</p>
                </div>
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Parcours étapes</label>
                  <p className="admin-project-details-field-value">{renderTextField((answers as any).product?.q11_flow_steps)}</p>
                </div>
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Raison de revenir</label>
                  <p className="admin-project-details-field-value">{getLabelFromSlug(mappings.returnReason, (answers as any).product?.q12_return_reason)}</p>
                </div>
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">À retrouver au retour</label>
                  <p className="admin-project-details-field-value">{renderArrayField((answers as any).product?.q13_return_items, mappings.returnItems)}</p>
                </div>
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Besoin de compte</label>
                  <p className="admin-project-details-field-value">{getLabelFromSlug(mappings.needAccount, (answers as any).product?.q14_need_account)}</p>
                </div>
              </div>
            </div>

            {/* Section C - Tech */}
            <div className="admin-project-details-section">
              <h3 className="admin-project-details-section-title">C) Tech — Faisabilité</h3>
              <div className="admin-project-details-section-content">
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">À stocker</label>
                  <p className="admin-project-details-field-value">{renderArrayField((answers as any).tech?.q15_store_what, mappings.storeWhat)}</p>
                </div>
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">IA</label>
                  <p className="admin-project-details-field-value">{getLabelFromSlug(mappings.aiType, (answers as any).tech?.q16_ai_type)}</p>
                </div>
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Intégrations</label>
                  <p className="admin-project-details-field-value">{renderArrayField((answers as any).tech?.q17_integrations, mappings.integrations)}</p>
                </div>
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Type de site</label>
                  <p className="admin-project-details-field-value">{getLabelFromSlug(mappings.siteType, (answers as any).tech?.q18_site_type)}</p>
                </div>
              </div>
            </div>

            {/* Section D - Design */}
            <div className="admin-project-details-section">
              <h3 className="admin-project-details-section-title">D) Design — Identité Visuelle</h3>
              <div className="admin-project-details-section-content">
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Références design</label>
                  <p className="admin-project-details-field-value">{renderTextField((answers as any).design?.q19_references)}</p>
                </div>
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Style</label>
                  <p className="admin-project-details-field-value">{getLabelFromSlug(mappings.designStyle, (answers as any).design?.q20_style)}</p>
                </div>
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Focus homepage</label>
                  <p className="admin-project-details-field-value">{getLabelFromSlug(mappings.homepageFocus, (answers as any).design?.q21_home_focus)}</p>
                </div>
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Type de sortie</label>
                  <p className="admin-project-details-field-value">{getLabelFromSlug(mappings.outputType, (answers as any).design?.q22_output_type)}</p>
                </div>
              </div>
            </div>

            {/* Section E - Final */}
            <div className="admin-project-details-section">
              <h3 className="admin-project-details-section-title">E) Synthèse Finale</h3>
              <div className="admin-project-details-section-content">
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Pitch</label>
                  <p className="admin-project-details-field-value">{renderTextField((answers as any).final?.q23_pitch)}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          // V1 - Ancien questionnaire (backward compatibility)
          <div className="admin-project-details-section">
            <h3 className="admin-project-details-section-title">Réponses (Ancien format)</h3>
            <div className="admin-project-details-section-content">
              <div className="admin-project-details-field">
                <label className="admin-project-details-field-label">Nom du projet</label>
                <p className="admin-project-details-field-value">{renderTextField((answers as any).principle_value?.q0_project_name)}</p>
              </div>
              <div className="admin-project-details-field">
                <label className="admin-project-details-field-label">Utilité principale</label>
                <p className="admin-project-details-field-value">{renderTextField((answers as any).principle_value?.q1_utility)}</p>
              </div>
              <div className="admin-project-details-field">
                <label className="admin-project-details-field-label">Public cible</label>
                <p className="admin-project-details-field-value">{renderArrayField((answers as any).principle_value?.q2_audience, mappings.audience)}</p>
              </div>
              {/* ... autres champs V1 ... */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
