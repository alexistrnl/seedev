'use client';

/**
 * PAGE ADMIN DÉTAIL PROJET
 * 
 * Affiche toutes les réponses du questionnaire d'un projet
 * avec possibilité de modifier le statut
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { pb } from '@/lib/pocketbase';
import { MAPPINGS, MAPPINGS_V1, type IntakeAnswers } from '@/lib/intake';
import './admin-detail.css';

interface ProjectIntake {
  id: string;
  project_name: string;
  short_title: string;
  status: 'submitted' | 'under_analysis' | 'analysis_sent' | 'waiting_validation' | 'approved_for_dev';
  created: string;
  answers: IntakeAnswers;
  admin_summary?: string;
  audience?: string[]; // Champ dérivé depuis answers (V1) ou stocké séparément
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

// Fonction pour convertir les slugs en labels lisibles (SAFE)
const getLabelFromSlug = (mapping: Record<string, string> | undefined | null, slug: string | undefined | null): string => {
  // Si slug est vide/null/undefined, retourner "—"
  if (!slug || slug.trim() === '') {
    return '—';
  }
  
  // Si mapping est null/undefined, retourner le slug tel quel
  if (!mapping || typeof mapping !== 'object') {
    return String(slug);
  }
  
  // Chercher le label correspondant au slug
  try {
    const entry = Object.entries(mapping).find(([_, value]) => value === slug);
    return entry ? entry[0] : String(slug);
  } catch (e) {
    // En cas d'erreur, retourner le slug
    console.warn('[Admin Detail] Erreur dans getLabelFromSlug:', e);
    return String(slug);
  }
};

const getStatusLabel = (status: ProjectIntake['status']): string => {
  return STATUS_OPTIONS.find(opt => opt.value === status)?.label || status;
};

const getStatusColor = (status: ProjectIntake['status']): string => {
  switch (status) {
    case 'submitted':
      return 'rgba(59, 130, 246, 0.2)';
    case 'under_analysis':
      return 'rgba(168, 85, 247, 0.2)';
    case 'analysis_sent':
      return 'rgba(251, 191, 36, 0.2)';
    case 'waiting_validation':
      return 'rgba(249, 115, 22, 0.2)';
    case 'approved_for_dev':
      return 'rgba(34, 197, 94, 0.2)';
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

export default function AdminProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<ProjectIntake | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

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

    // Charger le projet
    if (projectId) {
      loadProject();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, router, projectId]);

  const loadProject = async () => {
    if (!projectId || !pb.authStore.isValid) {
      setError('ID de projet manquant ou non autorisé');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const record = await pb.collection('project_intakes').getOne<ProjectIntake>(projectId, {
        expand: 'owner',
      });
      setProject(record);
    } catch (err: any) {
      console.error('[Admin Detail] Erreur lors du chargement du projet:', err);
      if (err?.status === 404) {
        setError('Projet non trouvé');
      } else if (err?.status === 403) {
        setError('Accès refusé à ce projet');
      } else {
        setError(err?.message || 'Erreur lors du chargement du projet');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: ProjectIntake['status']) => {
    if (!project) return;

    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      await pb.collection('project_intakes').update(project.id, { status: newStatus });
      setProject({ ...project, status: newStatus });
      setUpdateMessage('Statut mis à jour avec succès');
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (err: any) {
      console.error('[Admin Detail] Erreur lors de la mise à jour du statut:', err);
      setUpdateMessage('Erreur lors de la mise à jour du statut');
      setTimeout(() => setUpdateMessage(null), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderArrayField = (items: string[] | undefined | null, mapping?: Record<string, string> | undefined | null): string => {
    if (!items || items.length === 0) return '—';
    const labels = items.map(item => mapping ? getLabelFromSlug(mapping, item) : (item || '—'));
    return labels.filter(l => l !== '—').join(', ') || '—';
  };

  const renderTextField = (value: string | undefined): string => {
    return value?.trim() || '—';
  };

  // Afficher un loader pendant le chargement
  if (authLoading || isLoading) {
    return (
      <div className="admin-detail-page">
        <div className="admin-detail-loading">
          <div className="admin-detail-loading-spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  // Si erreur d'accès
  if (error && (!pb.authStore.isValid || (pb.authStore.model && !(pb.authStore.model as any).is_admin))) {
    return (
      <div className="admin-detail-page">
        <div className="admin-detail-error">
          <h2>Accès refusé</h2>
          <p>{error}</p>
          <button onClick={() => router.push('/admin')} className="admin-detail-btn admin-detail-btn-primary">
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  // Si projet non trouvé
  if (error || !project) {
    return (
      <div className="admin-detail-page">
        <div className="admin-detail-error">
          <h2>Erreur</h2>
          <p>{error || 'Projet non trouvé'}</p>
          <button onClick={() => router.push('/admin')} className="admin-detail-btn admin-detail-btn-primary">
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const answers = project.answers || {};
  
  // Détecter la version basée sur la structure
  const hasV2Structure = answers && typeof answers === 'object' && 'v' in answers && (answers as any).v === 2;

  return (
    <div className="admin-detail-page">
      <div className="admin-detail-container">
        {/* Header */}
        <div className="admin-detail-header">
          <div className="admin-detail-header-main">
            <button onClick={() => router.push('/admin')} className="admin-detail-btn admin-detail-btn-secondary">
              ← Retour
            </button>
            <h1 className="admin-detail-title">
              {project.project_name || project.short_title || 'Projet sans nom'}
            </h1>
            {project.short_title && project.short_title !== project.project_name && (
              <p className="admin-detail-subtitle">{project.short_title}</p>
            )}
          </div>
          <div className="admin-detail-header-meta">
            <div className="admin-detail-meta-item">
              <span className="admin-detail-meta-label">Statut</span>
              <span 
                className="admin-detail-status-badge"
                style={{
                  background: getStatusColor(project.status),
                  borderColor: getStatusBorderColor(project.status),
                }}
              >
                {getStatusLabel(project.status)}
              </span>
            </div>
            <div className="admin-detail-meta-item">
              <span className="admin-detail-meta-label">Owner</span>
              <span className="admin-detail-meta-value">
                {project.expand?.owner?.email || project.owner || 'N/A'}
              </span>
            </div>
            <div className="admin-detail-meta-item">
              <span className="admin-detail-meta-label">Date de création</span>
              <span className="admin-detail-meta-value">{formatDate(project.created)}</span>
            </div>
          </div>
        </div>

        {/* Actions admin */}
        <div className="admin-detail-actions">
          <div className="admin-detail-actions-content">
            <label className="admin-detail-actions-label">Modifier le statut :</label>
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value as ProjectIntake['status'])}
              disabled={isUpdating}
              className="admin-detail-status-select"
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
            {isUpdating && <span className="admin-detail-updating">Mise à jour...</span>}
          </div>
          {updateMessage && (
            <div className={`admin-detail-message ${updateMessage.includes('succès') ? 'admin-detail-message-success' : 'admin-detail-message-error'}`}>
              {updateMessage}
            </div>
          )}
        </div>

        {/* Zone réponses */}
        <div className="admin-detail-answers">
          <h2 className="admin-detail-answers-title">Réponses utilisateur</h2>

          {/* Affichage selon la version */}
          {hasV2Structure ? (
            // V2 - Nouveau questionnaire
            <>
              {/* Section 0 - Identité */}
              <div className="admin-detail-section">
                <h3 className="admin-detail-section-title">Identité</h3>
                <div className="admin-detail-section-content">
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Nom du projet</label>
                    <p className="admin-detail-field-value">{renderTextField((answers as any).identity?.q0_project_name)}</p>
                  </div>
                </div>
              </div>

              {/* Section A - Business — Viabilité & Potentiel */}
              <div className="admin-detail-section">
                <h3 className="admin-detail-section-title">A) Business — Viabilité & Potentiel</h3>
                <div className="admin-detail-section-content">
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Problème principal</label>
                    <p className="admin-detail-field-value">{renderTextField((answers as any).business?.q1_problem)}</p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Cible principale</label>
                    <p className="admin-detail-field-value">
                      {(() => {
                        const answersAny = (project?.answers ?? {}) as any;
                        
                        const targetSlug =
                          answersAny?.business?.q2_target ??
                          answersAny?.principle_value?.q2_audience?.[0] ??
                          project?.audience?.[0] ??
                          null;
                        
                        // audience existe dans les deux versions, utiliser le mapping approprié
                        const audienceMapping = hasV2Structure ? MAPPINGS.audience : MAPPINGS_V1.audience;
                        return getLabelFromSlug(audienceMapping, targetSlug);
                      })()}
                    </p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Fréquence</label>
                    <p className="admin-detail-field-value">
                      {(() => {
                        const answersAny = (project?.answers ?? {}) as any;
                        const frequencySlug =
                          answersAny?.business?.q3_frequency ??
                          answersAny?.principle_value?.q3_frequency ??
                          (project as any)?.problem_frequency ??
                          null;
                        // Pour V2, utiliser MAPPINGS.frequency, pour V1 il n'y a pas cette clé
                        const frequencyMapping = hasV2Structure ? (MAPPINGS as any).frequency : undefined;
                        return getLabelFromSlug(frequencyMapping, frequencySlug);
                      })()}
                    </p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Solution actuelle</label>
                    <p className="admin-detail-field-value">
                      {(() => {
                        const answersAny = (project?.answers ?? {}) as any;
                        const solutionSlug =
                          answersAny?.business?.q4_current_solution ??
                          (project as any)?.current_solution ??
                          null;
                        // Pour V2, utiliser MAPPINGS.currentSolution, pour V1 il n'y a pas cette clé
                        const solutionMapping = hasV2Structure ? (MAPPINGS as any).currentSolution : undefined;
                        return getLabelFromSlug(solutionMapping, solutionSlug);
                      })()}
                    </p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Pourquoi intéressant</label>
                    <p className="admin-detail-field-value">{renderTextField((answers as any).business?.q5_interesting)}</p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Prix estimé</label>
                    <p className="admin-detail-field-value">
                      {(() => {
                        const answersAny = (project?.answers ?? {}) as any;
                        const priceSlug =
                          answersAny?.business?.q6_price_range ??
                          (project as any)?.price_range ??
                          null;
                        // Pour V2, utiliser MAPPINGS.priceRange, pour V1 il n'y a pas cette clé
                        const priceMapping = hasV2Structure ? (MAPPINGS as any).priceRange : undefined;
                        return getLabelFromSlug(priceMapping, priceSlug);
                      })()}
                    </p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Modèle revenu</label>
                    <p className="admin-detail-field-value">
                      {(() => {
                        const answersAny = (project?.answers ?? {}) as any;
                        const revenueSlug =
                          answersAny?.business?.q7_revenue_model ??
                          (project as any)?.monetizations?.[0] ??
                          null;
                        // Pour V2, utiliser MAPPINGS.revenueModel, pour V1 utiliser MAPPINGS_V1.monetization
                        const revenueMapping = hasV2Structure ? (MAPPINGS as any).revenueModel : (MAPPINGS_V1 as any).monetization;
                        return getLabelFromSlug(revenueMapping, revenueSlug);
                      })()}
                    </p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Concurrence</label>
                    <p className="admin-detail-field-value">
                      {(() => {
                        const answersAny = (project?.answers ?? {}) as any;
                        const competitionSlug =
                          answersAny?.business?.q8_competition ??
                          (project as any)?.competition_level ??
                          null;
                        // Pour V2, utiliser MAPPINGS.competition, pour V1 il n'y a pas cette clé
                        const competitionMapping = hasV2Structure ? (MAPPINGS as any).competition : undefined;
                        return getLabelFromSlug(competitionMapping, competitionSlug);
                      })()}
                    </p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Point flou/incertain</label>
                    <p className="admin-detail-field-value">{renderTextField((answers as any).business?.q9_uncertainty)}</p>
                  </div>
                </div>
              </div>

              {/* Section B - Produit — Expérience Utilisateur */}
              <div className="admin-detail-section">
                <h3 className="admin-detail-section-title">B) Produit — Expérience Utilisateur</h3>
                <div className="admin-detail-section-content">
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Action dès arrivée</label>
                    <p className="admin-detail-field-value">
                      {(() => {
                        const answersAny = (project?.answers ?? {}) as any;
                        const actionSlug = answersAny?.product?.q10_first_action ?? null;
                        // Pour V2, utiliser MAPPINGS.firstAction, pour V1 utiliser MAPPINGS_V1.mainAction
                        const actionMapping = hasV2Structure ? (MAPPINGS as any).firstAction : (MAPPINGS_V1 as any).mainAction;
                        return getLabelFromSlug(actionMapping, actionSlug);
                      })()}
                    </p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Parcours étapes</label>
                    <p className="admin-detail-field-value">{renderTextField((answers as any).product?.q11_flow_steps)}</p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Raison de revenir</label>
                    <p className="admin-detail-field-value">
                      {(() => {
                        const answersAny = (project?.answers ?? {}) as any;
                        const returnReasonSlug =
                          answersAny?.product?.q12_return_reason ??
                          (project as any)?.return_reason ??
                          null;
                        // Pour V2, utiliser MAPPINGS.returnReason, pour V1 il n'y a pas cette clé
                        const returnReasonMapping = hasV2Structure ? (MAPPINGS as any).returnReason : undefined;
                        return getLabelFromSlug(returnReasonMapping, returnReasonSlug);
                      })()}
                    </p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">À retrouver au retour</label>
                    <p className="admin-detail-field-value">
                      {(() => {
                        const answersAny = (project?.answers ?? {}) as any;
                        const returnItems = answersAny?.product?.q13_return_items ?? null;
                        // returnItems existe dans les deux versions, utiliser MAPPINGS dans la section V2
                        return renderArrayField(returnItems, MAPPINGS.returnItems);
                      })()}
                    </p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Besoin de compte</label>
                    <p className="admin-detail-field-value">
                      {(() => {
                        const answersAny = (project?.answers ?? {}) as any;
                        const accountSlug =
                          answersAny?.product?.q14_need_account ??
                          (project as any)?.need_account ??
                          null;
                        // Pour V2, utiliser MAPPINGS.needAccount, pour V1 utiliser MAPPINGS_V1.personalSpace (similaire)
                        const accountMapping = hasV2Structure ? (MAPPINGS as any).needAccount : (MAPPINGS_V1 as any).personalSpace;
                        return getLabelFromSlug(accountMapping, accountSlug);
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section C - Tech — Faisabilité */}
              <div className="admin-detail-section">
                <h3 className="admin-detail-section-title">C) Tech — Faisabilité</h3>
                <div className="admin-detail-section-content">
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">À stocker</label>
                    <p className="admin-detail-field-value">
                      {(() => {
                        const answersAny = (project?.answers ?? {}) as any;
                        const storeWhat = answersAny?.tech?.q15_store_what ?? null;
                        // storeWhat existe uniquement dans MAPPINGS (V2)
                        const storeWhatMapping = hasV2Structure ? (MAPPINGS as any).storeWhat : undefined;
                        return renderArrayField(storeWhat, storeWhatMapping);
                      })()}
                    </p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">IA</label>
                    <p className="admin-detail-field-value">
                      {(() => {
                        const answersAny = (project?.answers ?? {}) as any;
                        const aiSlug = answersAny?.tech?.q16_ai_type ?? null;
                        // aiType existe uniquement dans MAPPINGS (V2)
                        const aiMapping = hasV2Structure ? (MAPPINGS as any).aiType : undefined;
                        return getLabelFromSlug(aiMapping, aiSlug);
                      })()}
                    </p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Intégrations</label>
                    <p className="admin-detail-field-value">
                      {(() => {
                        const answersAny = (project?.answers ?? {}) as any;
                        const integrations = answersAny?.tech?.q17_integrations ?? null;
                        // integrations existe dans les deux versions, utiliser MAPPINGS dans la section V2
                        return renderArrayField(integrations, MAPPINGS.integrations);
                      })()}
                    </p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Type de site</label>
                    <p className="admin-detail-field-value">
                      {(() => {
                        const answersAny = (project?.answers ?? {}) as any;
                        const siteTypeSlug =
                          answersAny?.tech?.q18_site_type ??
                          answersAny?.q13_site_type ??
                          (project as any)?.site_type ??
                          null;
                        // siteType existe dans les deux versions, utiliser MAPPINGS dans la section V2
                        return getLabelFromSlug(MAPPINGS.siteType, siteTypeSlug);
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section D - Vision Design */}
              <div className="admin-detail-section">
                <h3 className="admin-detail-section-title">D) Vision Design</h3>
                <div className="admin-detail-section-content">
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Références</label>
                    <p className="admin-detail-field-value">{renderTextField((answers as any).design?.q19_references)}</p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Style</label>
                    <p className="admin-detail-field-value">
                      {(() => {
                        const answersAny = (project?.answers ?? {}) as any;
                        const styleSlug =
                          answersAny?.design?.q20_style ??
                          (project as any)?.design_style ??
                          null;
                        // designStyle existe uniquement dans MAPPINGS (V2)
                        const styleMapping = hasV2Structure ? (MAPPINGS as any).designStyle : undefined;
                        return getLabelFromSlug(styleMapping, styleSlug);
                      })()}
                    </p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Focus homepage</label>
                    <p className="admin-detail-field-value">
                      {(() => {
                        const answersAny = (project?.answers ?? {}) as any;
                        const homeFocusSlug =
                          answersAny?.design?.q21_home_focus ??
                          (project as any)?.homepage_focus ??
                          null;
                        // homepageFocus existe uniquement dans MAPPINGS (V2)
                        const homeFocusMapping = hasV2Structure ? (MAPPINGS as any).homepageFocus : undefined;
                        return getLabelFromSlug(homeFocusMapping, homeFocusSlug);
                      })()}
                    </p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Output final</label>
                    <p className="admin-detail-field-value">
                      {(() => {
                        const answersAny = (project?.answers ?? {}) as any;
                        const outputSlug =
                          answersAny?.design?.q22_output_type ??
                          (project as any)?.final_output_type ??
                          null;
                        // outputType existe uniquement dans MAPPINGS (V2)
                        const outputMapping = hasV2Structure ? (MAPPINGS as any).outputType : undefined;
                        return getLabelFromSlug(outputMapping, outputSlug);
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section E - Synthèse */}
              <div className="admin-detail-section">
                <h3 className="admin-detail-section-title">E) Synthèse</h3>
                <div className="admin-detail-section-content">
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Pitch A à Z</label>
                    <p className="admin-detail-field-value admin-detail-field-value-long">{renderTextField((answers as any).final?.q23_pitch)}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // V1 - Ancien questionnaire (compatibilité)
            <>
              {/* Section A: Principe & valeur */}
              <div className="admin-detail-section">
                <h3 className="admin-detail-section-title">A) Principe & valeur</h3>
                <div className="admin-detail-section-content">
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Nom du projet</label>
                    <p className="admin-detail-field-value">{renderTextField((answers as any).q0_project_name)}</p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Utilité principale</label>
                    <p className="admin-detail-field-value">{renderTextField((answers as any).q1_utility)}</p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Public cible</label>
                    <p className="admin-detail-field-value">{renderArrayField((answers as any).q2_audience, MAPPINGS_V1.audience)}</p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Problème résolu ou bénéfice apporté</label>
                    <p className="admin-detail-field-value">{renderTextField((answers as any).q3_problem_gain)}</p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Proposition de valeur unique</label>
                    <p className="admin-detail-field-value">{renderTextField((answers as any).q4_value_proposition)}</p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Modèle de monétisation</label>
                    <p className="admin-detail-field-value">{renderArrayField((answers as any).q5_monetization, MAPPINGS_V1.monetization)}</p>
                  </div>
                </div>
              </div>

              {/* Section B: Comportement utilisateur */}
              <div className="admin-detail-section">
                <h3 className="admin-detail-section-title">B) Comportement utilisateur</h3>
                <div className="admin-detail-section-content">
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Action principale attendue</label>
                    <p className="admin-detail-field-value">{getLabelFromSlug(MAPPINGS_V1.mainAction, (answers as any).q6_main_action)}</p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Après la première action</label>
                    <p className="admin-detail-field-value">{renderTextField((answers as any).q7_after_action)}</p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Type d'utilisation</label>
                    <p className="admin-detail-field-value">{getLabelFromSlug(MAPPINGS_V1.usageType, (answers as any).q8_usage_type)}</p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Éléments à retrouver au retour</label>
                    <p className="admin-detail-field-value">{renderArrayField((answers as any).q9_return_items, MAPPINGS_V1.returnItems)}</p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Espace personnel nécessaire</label>
                    <p className="admin-detail-field-value">{getLabelFromSlug(MAPPINGS_V1.personalSpace, (answers as any).q10_personal_space)}</p>
                  </div>
                </div>
              </div>

              {/* Section C: Automatisation & IA */}
              <div className="admin-detail-section">
                <h3 className="admin-detail-section-title">C) Automatisation & IA</h3>
                <div className="admin-detail-section-content">
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Fonctionnalités d'automatisation</label>
                    <p className="admin-detail-field-value">{renderArrayField((answers as any).q11_automation, MAPPINGS_V1.automation)}</p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Intégrations externes</label>
                    <p className="admin-detail-field-value">{renderArrayField((answers as any).q12_integrations, MAPPINGS_V1.integrations)}</p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Type de site</label>
                    <p className="admin-detail-field-value">{getLabelFromSlug(MAPPINGS_V1.siteType, (answers as any).q13_site_type)}</p>
                  </div>
                </div>
              </div>

              {/* Section D: Administration & contrôle */}
              <div className="admin-detail-section">
                <h3 className="admin-detail-section-title">D) Administration & contrôle</h3>
                <div className="admin-detail-section-content">
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Fonctionnalités d'administration souhaitées</label>
                    <p className="admin-detail-field-value">{renderArrayField((answers as any).q14_admin_features, MAPPINGS_V1.adminFeatures)}</p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Fonctionnement autonome</label>
                    <p className="admin-detail-field-value">{getLabelFromSlug(MAPPINGS_V1.autonomy, (answers as any).q15_autonomy)}</p>
                  </div>
                </div>
              </div>

              {/* Section E: Réalité terrain */}
              <div className="admin-detail-section">
                <h3 className="admin-detail-section-title">E) Réalité terrain</h3>
                <div className="admin-detail-section-content">
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Stratégie pour attirer les premiers visiteurs</label>
                    <p className="admin-detail-field-value">{renderTextField((answers as any).q16_first_visitors)}</p>
                  </div>
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Premier ajustement en cas d'échec</label>
                    <p className="admin-detail-field-value">{renderTextField((answers as any).q17_adjustment)}</p>
                  </div>
                </div>
              </div>

              {/* Section F: Synthèse finale */}
              <div className="admin-detail-section">
                <h3 className="admin-detail-section-title">F) Synthèse finale</h3>
                <div className="admin-detail-section-content">
                  <div className="admin-detail-field">
                    <label className="admin-detail-field-label">Description complète du projet</label>
                    <p className="admin-detail-field-value admin-detail-field-value-long">{renderTextField((answers as any).q18_full_description)}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Admin summary si disponible */}
          {project.admin_summary && (
            <div className="admin-detail-section admin-detail-section-summary">
              <h3 className="admin-detail-section-title">Résumé admin</h3>
              <div className="admin-detail-section-content">
                <p className="admin-detail-summary-text">{project.admin_summary}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
