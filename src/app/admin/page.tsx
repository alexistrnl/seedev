'use client';

/**
 * PAGE ADMIN - Gestion des projets utilisateurs
 * 
 * PROTECTION: Vérifie que l'utilisateur est connecté ET is_admin = true
 * FETCH: Récupère tous les project_intakes avec pagination
 * ACTIONS: Permet de modifier le statut des projets
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { pb } from '@/lib/pocketbase';
import { MAPPINGS, MAPPINGS_V1, type IntakeAnswers, isV2 } from '@/lib/intake';
import RichTextEditor from '@/components/RichTextEditor';
import './admin.css';

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

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<ProjectIntake[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedProject, setSelectedProject] = useState<ProjectIntake | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<ProjectIntake['status'] | 'all'>('all');
  const [expandedStatusProjectId, setExpandedStatusProjectId] = useState<string | null>(null);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
  const [analysisText, setAnalysisText] = useState<string>('');
  const [recommendationText, setRecommendationText] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    under_analysis: 0,
    analysis_sent: 0,
    waiting_validation: 0,
    approved_for_dev: 0,
  });
  const perPage = 50;

  // Vérifier les droits admin
  useEffect(() => {
    if (authLoading) return;

    // Si pas connecté, rediriger vers login
    if (!pb.authStore.isValid || !pb.authStore.model) {
      router.push('/login');
      return;
    }

    // Vérifier si l'utilisateur est admin
    const isAdmin = (pb.authStore.model as any).is_admin === true;
    if (!isAdmin) {
      setError('Accès refusé. Vous devez être administrateur pour accéder à cette page.');
      setIsLoading(false);
      return;
    }

    // Charger les projets et les stats
    loadProjects();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, router, page, selectedStatusFilter]);

  // Sélectionner le premier projet quand la liste change
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  // Pré-remplir les champs analysis et recommendation quand un projet est sélectionné
  useEffect(() => {
    if (selectedProject) {
      setAnalysisText(selectedProject.analysis || '');
      setRecommendationText(selectedProject.recommendation || '');
    } else {
      setAnalysisText('');
      setRecommendationText('');
    }
  }, [selectedProject]);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.admin-projects-list-item-status-container')) {
        setExpandedStatusProjectId(null);
      }
    };

    if (expandedStatusProjectId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [expandedStatusProjectId]);

  const loadProjects = async () => {
    if (!pb.authStore.isValid) {
      setError('Non autorisé');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Construire le filtre selon le statut sélectionné
      let filter = '';
      if (selectedStatusFilter !== 'all') {
        filter = `status = "${selectedStatusFilter}"`;
      }

      const res = await pb.collection('project_intakes').getList<ProjectIntake>(page, perPage, {
        sort: '-created',
        expand: 'owner',
        ...(filter && { filter }),
      });

      setProjects(res.items);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    } catch (err: any) {
      console.error('[Admin] Erreur lors du chargement des projets:', err);
      setError(err?.message || 'Erreur lors du chargement des projets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: ProjectIntake['status']) => {
    setIsUpdating(projectId);
    setUpdateMessage(null);

    try {
      await pb.collection('project_intakes').update(projectId, { status: newStatus });
      
      // Mettre à jour l'état local
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, status: newStatus } : p
      ));

      // Mettre à jour le projet sélectionné si c'est celui-ci
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject({ ...selectedProject, status: newStatus });
      }

      setUpdateMessage('Statut mis à jour avec succès');
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (err: any) {
      console.error('[Admin] Erreur lors de la mise à jour du statut:', err);
      setUpdateMessage('Erreur lors de la mise à jour du statut');
      setTimeout(() => setUpdateMessage(null), 3000);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleSendAnalysis = async () => {
    if (!selectedProject) {
      setUpdateMessage('Aucun projet sélectionné');
      setTimeout(() => setUpdateMessage(null), 3000);
      return;
    }

    if (!analysisText.trim() && !recommendationText.trim()) {
      setUpdateMessage('Veuillez remplir au moins l\'analyse ou la recommandation');
      setTimeout(() => setUpdateMessage(null), 3000);
      return;
    }

    setIsSending(true);
    setUpdateMessage(null);

    try {
      await pb.collection('project_intakes').update(selectedProject.id, {
        analysis: analysisText.trim() || null,
        recommendation: recommendationText.trim() || null,
        status: 'analysis_sent',
        analysis_sent_at: new Date().toISOString(),
      });

      // Recharger le projet pour avoir les données à jour
      const updatedProject = await pb.collection('project_intakes').getOne<ProjectIntake>(
        selectedProject.id,
        { expand: 'owner' }
      );

      // Mettre à jour l'état local
      setProjects(prev => prev.map(p => 
        p.id === selectedProject.id ? updatedProject : p
      ));
      setSelectedProject(updatedProject);

      setUpdateMessage('Analyse envoyée avec succès');
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (err: any) {
      console.error('[Admin] Erreur lors de l\'envoi de l\'analyse:', err);
      setUpdateMessage('Erreur lors de l\'envoi de l\'analyse');
      setTimeout(() => setUpdateMessage(null), 3000);
    } finally {
      setIsSending(false);
    }
  };

  const loadStats = async () => {
    if (!pb.authStore.isValid) return;

    try {
      // Charger tous les projets pour avoir les vraies stats (ou utiliser des filtres séparés)
      const allProjects = await pb.collection('project_intakes').getFullList<ProjectIntake>({
        sort: '-created',
      });

      const statusCounts = {
        total: allProjects.length,
        submitted: 0,
        under_analysis: 0,
        analysis_sent: 0,
        waiting_validation: 0,
        approved_for_dev: 0,
      };

      allProjects.forEach((p) => {
        if (statusCounts.hasOwnProperty(p.status)) {
          statusCounts[p.status as keyof typeof statusCounts]++;
        }
      });

      setStats(statusCounts);
    } catch (err: any) {
      console.error('[Admin] Erreur lors du chargement des stats:', err);
    }
  };

  const getOwnerEmail = (project: ProjectIntake): string => {
    if (project.expand?.owner?.email) {
      return project.expand.owner.email;
    }
    return project.owner || 'N/A';
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
      console.warn('[Admin] Erreur dans getLabelFromSlug:', e);
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

  // Si pas admin
  if (error && pb.authStore.isValid) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <h2>Accès refusé</h2>
          <p>{error}</p>
          <button onClick={() => router.push('/dashboard')} className="admin-btn admin-btn-primary">
            Retour au dashboard
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
          <h2 className="admin-sidebar-logo">Admin</h2>
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
            <button
              className={`admin-projects-filter-toggle-btn ${isFiltersExpanded ? 'active' : ''}`}
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              title="Filtrer par statut"
            >
              <svg 
                className="admin-projects-filter-toggle-icon" 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M2 4h12M4 8h8M6 12h4" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Status Filters - Dropdown */}
        {isFiltersExpanded && (
          <div className="admin-projects-filters-dropdown">
            <div className="admin-projects-filters-list">
            <button
              className={`admin-projects-filter-btn ${selectedStatusFilter === 'all' ? 'admin-projects-filter-btn-active' : ''}`}
              onClick={() => {
                setSelectedStatusFilter('all');
                setPage(1);
              }}
            >
              <span>Tous</span>
              <span className="admin-projects-filter-count">({stats.total})</span>
            </button>
            <button
              className={`admin-projects-filter-btn ${selectedStatusFilter === 'submitted' ? 'admin-projects-filter-btn-active' : ''}`}
              onClick={() => {
                setSelectedStatusFilter('submitted');
                setPage(1);
              }}
              style={{
                background: selectedStatusFilter === 'submitted' ? getStatusColor('submitted') : 'transparent',
                borderColor: getStatusBorderColor('submitted'),
              }}
            >
              <span>Soumis</span>
              <span className="admin-projects-filter-count">({stats.submitted})</span>
            </button>
            <button
              className={`admin-projects-filter-btn ${selectedStatusFilter === 'under_analysis' ? 'admin-projects-filter-btn-active' : ''}`}
              onClick={() => {
                setSelectedStatusFilter('under_analysis');
                setPage(1);
              }}
              style={{
                background: selectedStatusFilter === 'under_analysis' ? getStatusColor('under_analysis') : 'transparent',
                borderColor: getStatusBorderColor('under_analysis'),
              }}
            >
              <span>En analyse</span>
              <span className="admin-projects-filter-count">({stats.under_analysis})</span>
            </button>
            <button
              className={`admin-projects-filter-btn ${selectedStatusFilter === 'analysis_sent' ? 'admin-projects-filter-btn-active' : ''}`}
              onClick={() => {
                setSelectedStatusFilter('analysis_sent');
                setPage(1);
              }}
              style={{
                background: selectedStatusFilter === 'analysis_sent' ? getStatusColor('analysis_sent') : 'transparent',
                borderColor: getStatusBorderColor('analysis_sent'),
              }}
            >
              <span>Analyse envoyée</span>
              <span className="admin-projects-filter-count">({stats.analysis_sent})</span>
            </button>
            <button
              className={`admin-projects-filter-btn ${selectedStatusFilter === 'waiting_validation' ? 'admin-projects-filter-btn-active' : ''}`}
              onClick={() => {
                setSelectedStatusFilter('waiting_validation');
                setPage(1);
              }}
              style={{
                background: selectedStatusFilter === 'waiting_validation' ? getStatusColor('waiting_validation') : 'transparent',
                borderColor: getStatusBorderColor('waiting_validation'),
              }}
            >
              <span>En attente</span>
              <span className="admin-projects-filter-count">({stats.waiting_validation})</span>
            </button>
            <button
              className={`admin-projects-filter-btn ${selectedStatusFilter === 'approved_for_dev' ? 'admin-projects-filter-btn-active' : ''}`}
              onClick={() => {
                setSelectedStatusFilter('approved_for_dev');
                setPage(1);
              }}
              style={{
                background: selectedStatusFilter === 'approved_for_dev' ? getStatusColor('approved_for_dev') : 'transparent',
                borderColor: getStatusBorderColor('approved_for_dev'),
              }}
            >
              <span>Approuvés</span>
              <span className="admin-projects-filter-count">({stats.approved_for_dev})</span>
            </button>
            </div>
          </div>
        )}
        
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
              >
                <div 
                  className="admin-projects-list-item-content"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="admin-projects-list-item-header">
                    <h4 className="admin-projects-list-item-title">
                      {project.project_name || project.short_title || 'Sans nom'}
                    </h4>
                  </div>
                  {project.short_title && project.short_title !== project.project_name && (
                    <p className="admin-projects-list-item-subtitle">{project.short_title}</p>
                  )}
                  <div className="admin-projects-list-item-meta">
                    <span className="admin-projects-list-item-owner" title={getOwnerEmail(project)}>
                      {getOwnerEmail(project).split('@')[0]}
                    </span>
                    <span className="admin-projects-list-item-date">
                      {new Date(project.created).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
                
                {/* Status Dropdown */}
                <div className="admin-projects-list-item-status-container">
                  <button
                    className="admin-projects-list-item-status-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedStatusProjectId(expandedStatusProjectId === project.id ? null : project.id);
                    }}
                    style={{
                      background: getStatusColor(project.status),
                      borderColor: getStatusBorderColor(project.status),
                    }}
                  >
                    {getStatusLabel(project.status)}
                    <span className={`admin-projects-list-item-status-arrow ${expandedStatusProjectId === project.id ? 'admin-projects-list-item-status-arrow-expanded' : ''}`}>
                      ▼
                    </span>
                  </button>
                  
                  {expandedStatusProjectId === project.id && (
                    <div className="admin-projects-list-item-status-dropdown">
                      {STATUS_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          className={`admin-projects-list-item-status-option ${project.status === option.value ? 'admin-projects-list-item-status-option-active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(project.id, option.value);
                            setExpandedStatusProjectId(null);
                          }}
                          style={{
                            background: project.status === option.value ? getStatusColor(option.value) : 'transparent',
                            borderColor: getStatusBorderColor(option.value),
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
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

        {/* Project Details - Split in 3 parts */}
        <section className="admin-project-details-column">
          {selectedProject ? (
            <div className="admin-project-details-split">
              {/* Left Column: Project Details */}
              <div className="admin-project-details-left">
                <ProjectDetailsView 
                  project={selectedProject}
                  onStatusChange={handleStatusChange}
                  isUpdating={isUpdating === selectedProject.id}
                  updateMessage={updateMessage}
                  getLabelFromSlug={getLabelFromSlug}
                  renderArrayField={renderArrayField}
                  renderTextField={renderTextField}
                />
              </div>

              {/* Right Column - Top: Analysis, Bottom: Empty */}
              <div className="admin-project-details-right">
                {/* Top: Analysis & Recommendation */}
                <div className="admin-project-analysis-section">
                  <h2 className="admin-project-analysis-title">Analyse & Recommandation</h2>
                  <div className="admin-project-analysis-form">
                    <div className="admin-project-analysis-field admin-project-analysis-field-flex">
                      <label className="admin-project-analysis-label">Analyse</label>
                      <RichTextEditor
                        value={analysisText}
                        onChange={setAnalysisText}
                        placeholder="Rédigez votre analyse du projet..."
                        className="admin-project-analysis-textarea"
                      />
                    </div>
                    <div className="admin-project-analysis-field admin-project-analysis-field-flex">
                      <label className="admin-project-analysis-label">Recommandation</label>
                      <RichTextEditor
                        value={recommendationText}
                        onChange={setRecommendationText}
                        placeholder="Rédigez vos recommandations..."
                        className="admin-project-analysis-textarea"
                      />
                    </div>
                    <button
                      className="admin-project-analysis-send-btn"
                      onClick={handleSendAnalysis}
                      disabled={isSending}
                    >
                      {isSending ? 'Envoi en cours...' : 'Envoyer l\'analyse'}
                    </button>
                  </div>
                </div>

                {/* Bottom: Empty zone for future use */}
                <div className="admin-project-empty-zone">
                  <p className="admin-project-empty-zone-text">Zone réservée</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-project-details-empty">
              <p>Sélectionnez un projet pour voir les détails</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// Composant pour afficher les détails du projet
function ProjectDetailsView({
  project,
  onStatusChange,
  isUpdating,
  updateMessage,
  getLabelFromSlug,
  renderArrayField,
  renderTextField,
}: {
  project: ProjectIntake;
  onStatusChange: (projectId: string, newStatus: ProjectIntake['status']) => void;
  isUpdating: boolean;
  updateMessage: string | null;
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

  const getOwnerEmail = (project: ProjectIntake): string => {
    if (project.expand?.owner?.email) {
      return project.expand.owner.email;
    }
    return project.owner || 'N/A';
  };

  return (
    <div className="admin-project-details">
      {/* Header */}
      <div className="admin-project-details-header">
        <div>
          <h1 className="admin-project-details-title">
            {project.project_name || project.short_title || 'Projet sans nom'}
          </h1>
          {project.short_title && project.short_title !== project.project_name && (
            <p className="admin-project-details-subtitle">{project.short_title}</p>
          )}
        </div>
        <div className="admin-project-details-header-actions">
          <select
            value={project.status}
            onChange={(e) => onStatusChange(project.id, e.target.value as ProjectIntake['status'])}
            disabled={isUpdating}
            className="admin-project-details-status-select"
            style={{
              background: getStatusColor(project.status),
              borderColor: getStatusBorderColor(project.status),
            }}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {isUpdating && <span className="admin-project-details-updating">Mise à jour...</span>}
        </div>
      </div>

      {updateMessage && (
        <div className={`admin-message ${updateMessage.includes('succès') ? 'admin-message-success' : 'admin-message-error'}`}>
          {updateMessage}
        </div>
      )}

      {/* Metadata */}
      <div className="admin-project-details-meta">
        <div className="admin-project-details-meta-item">
          <div className="admin-project-details-meta-icon">👤</div>
          <div className="admin-project-details-meta-content">
            <span className="admin-project-details-meta-label">Owner</span>
            <span className="admin-project-details-meta-value">{getOwnerEmail(project)}</span>
          </div>
        </div>
        <div className="admin-project-details-meta-item">
          <div className="admin-project-details-meta-icon">📅</div>
          <div className="admin-project-details-meta-content">
            <span className="admin-project-details-meta-label">Date de création</span>
            <span className="admin-project-details-meta-value">{formatDate(project.created)}</span>
          </div>
        </div>
        <div className="admin-project-details-meta-item admin-project-details-meta-item-tags">
          <div className="admin-project-details-meta-icon">🏷️</div>
          <div className="admin-project-details-meta-content">
            <span className="admin-project-details-meta-label">Tags</span>
            <div className="admin-project-details-tags">
              {project.needs_db && <span className="admin-tag admin-tag-db">DB</span>}
              {project.needs_ai && <span className="admin-tag admin-tag-ai">IA</span>}
              {project.needs_integrations && <span className="admin-tag admin-tag-integrations">Intégrations</span>}
              {project.needs_payment && <span className="admin-tag admin-tag-payment">Paiement</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div className="admin-project-details-answers">
        <h2 className="admin-project-details-answers-title">Réponses utilisateur</h2>

        {isAnswersV2 ? (
          // V2 - Nouveau questionnaire
          <>
            {/* Section 0 - Identité */}
            <div className="admin-project-details-section">
              <h3 className="admin-project-details-section-title">Identité</h3>
              <div className="admin-project-details-section-content">
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Nom du projet</label>
                  <p className="admin-project-details-field-value">{renderTextField((answers as any).identity?.q0_project_name)}</p>
                </div>
              </div>
            </div>

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
              <h3 className="admin-project-details-section-title">D) Vision Design</h3>
              <div className="admin-project-details-section-content">
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Références</label>
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
                  <label className="admin-project-details-field-label">Output final</label>
                  <p className="admin-project-details-field-value">{getLabelFromSlug(mappings.outputType, (answers as any).design?.q22_output_type)}</p>
                </div>
              </div>
            </div>

            {/* Section E - Synthèse */}
            <div className="admin-project-details-section">
              <h3 className="admin-project-details-section-title">E) Synthèse</h3>
              <div className="admin-project-details-section-content">
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Pitch A à Z</label>
                  <p className="admin-project-details-field-value admin-project-details-field-value-long">{renderTextField((answers as any).final?.q23_pitch)}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          // V1 - Ancien questionnaire (compatibilité)
          <>
            <div className="admin-project-details-section">
              <h3 className="admin-project-details-section-title">A) Principe & valeur</h3>
              <div className="admin-project-details-section-content">
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Nom du projet</label>
                  <p className="admin-project-details-field-value">{renderTextField((answers as any).q0_project_name)}</p>
                </div>
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Utilité principale</label>
                  <p className="admin-project-details-field-value">{renderTextField((answers as any).q1_utility)}</p>
                </div>
                <div className="admin-project-details-field">
                  <label className="admin-project-details-field-label">Public cible</label>
                  <p className="admin-project-details-field-value">{renderArrayField((answers as any).q2_audience, mappings.audience)}</p>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
