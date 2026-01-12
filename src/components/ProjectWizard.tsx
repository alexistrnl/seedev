'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './project-wizard.css';

export interface ProjectAnswers {
  // Step 1
  projectName?: string;
  // Step 2
  pitch?: string;
  // Step 3
  target?: string;
  targetOther?: string;
  // Step 4
  problem?: string;
  // Step 5
  solution?: string;
  // Step 6
  competitors?: string[];
  competitorsAlternatives?: string;
  // Step 7
  mvpFeature?: string;
  // Step 8
  mvpFeatures?: string[];
  // Step 9
  productFormat?: string;
  // Step 10
  monetization?: string;
  // Step 11
  technicalLevel?: string;
  // Step 12
  objectives?: string[];
}

interface Step {
  id: number;
  component: React.ReactNode;
  validate?: (answers: ProjectAnswers) => boolean;
}

export default function ProjectWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<ProjectAnswers>({});
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const STORAGE_KEY = 'seedev_project_draft';
  const TOTAL_STEPS = 12;

  // Restaurer depuis localStorage au mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAnswers(parsed.answers || {});
        setCurrentStep(parsed.currentStep || 0);
      } catch (e) {
        console.error('Erreur lors de la restauration:', e);
      }
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      answers,
      currentStep,
    }));
  }, [answers, currentStep]);

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  const updateAnswer = (key: keyof ProjectAnswers, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleNext = () => {
    const step = steps[currentStep];
    if (step.validate && !step.validate(answers)) {
      setError('Ce champ est obligatoire pour poursuivre.');
      return;
    }
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(prev => prev + 1);
      setError(null);
    } else {
      setShowSummary(true);
    }
  };

  const handleBack = () => {
    if (showSummary) {
      setShowSummary(false);
    } else if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simuler un délai pour l'analyse
    setTimeout(() => {
      setIsSubmitting(false);
      // Afficher l'écran de confirmation
      router.push('/dashboard/new?success=true');
    }, 1500);
  };

  const steps: Step[] = [
    {
      id: 1,
      component: (
        <div className="wizard-step">
          <label className="wizard-label">Nom du projet</label>
          <input
            type="text"
            value={answers.projectName || ''}
            onChange={(e) => updateAnswer('projectName', e.target.value)}
            className="wizard-input"
            placeholder="Ex: Plateforme de gestion collaborative"
            autoFocus
          />
          <p className="wizard-helper">Ce nom pourra être modifié ultérieurement.</p>
        </div>
      ),
      validate: (a) => !!a.projectName?.trim(),
    },
    {
      id: 2,
      component: (
        <div className="wizard-step">
          <label className="wizard-label">Proposition de valeur en une phrase</label>
          <textarea
            value={answers.pitch || ''}
            onChange={(e) => updateAnswer('pitch', e.target.value)}
            className="wizard-textarea"
            placeholder="Ex: Une solution SaaS permettant aux équipes distribuées de collaborer en temps réel sur des projets complexes."
            rows={4}
            autoFocus
          />
          <div className="wizard-info">
            <span className="wizard-info-icon">💡</span>
            <span>Cette formulation nous permet d'évaluer la clarté et la pertinence de votre proposition de valeur.</span>
          </div>
        </div>
      ),
      validate: (a) => !!a.pitch?.trim(),
    },
    {
      id: 3,
      component: (
        <div className="wizard-step">
          <label className="wizard-label">Segment de marché cible</label>
          <div className="wizard-radio-group">
            {['Étudiants', 'Freelances', 'PME', 'Créateurs de contenu', 'Grand public', 'Autre'].map((option) => (
              <label key={option} className="wizard-radio">
                <input
                  type="radio"
                  name="target"
                  value={option}
                  checked={answers.target === option}
                  onChange={(e) => updateAnswer('target', e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {answers.target === 'Autre' && (
            <input
              type="text"
              value={answers.targetOther || ''}
              onChange={(e) => updateAnswer('targetOther', e.target.value)}
              className="wizard-input"
              placeholder="Veuillez préciser votre segment cible"
              autoFocus
            />
          )}
          <div className="wizard-info">
            <span className="wizard-info-icon">💡</span>
            <span>Le segment cible détermine la stratégie de pricing, le positionnement marketing et la complexité technique du MVP.</span>
          </div>
        </div>
      ),
      validate: (a) => !!a.target && (a.target !== 'Autre' || !!a.targetOther?.trim()),
    },
    {
      id: 4,
      component: (
        <div className="wizard-step">
          <label className="wizard-label">Problématique adressée</label>
          <textarea
            value={answers.problem || ''}
            onChange={(e) => updateAnswer('problem', e.target.value)}
            className="wizard-textarea"
            placeholder="Décrivez précisément la problématique que votre solution résout pour votre marché cible..."
            rows={5}
            autoFocus
          />
          <div className="wizard-info">
            <span className="wizard-info-icon">💡</span>
            <span>Une problématique mal définie compromet la viabilité commerciale. Nous recherchons une friction réelle et mesurable sur le marché.</span>
          </div>
        </div>
      ),
      validate: (a) => !!a.problem?.trim(),
    },
    {
      id: 5,
      component: (
        <div className="wizard-step">
          <label className="wizard-label">Mécanisme de résolution</label>
          <textarea
            value={answers.solution || ''}
            onChange={(e) => updateAnswer('solution', e.target.value)}
            className="wizard-textarea"
            placeholder="Décrivez comment votre solution adresse la problématique identifiée, en détaillant le parcours utilisateur et la valeur délivrée..."
            rows={5}
            autoFocus
          />
          <p className="wizard-helper">Précisez le parcours utilisateur et la valeur créée en quelques lignes.</p>
        </div>
      ),
      validate: (a) => !!a.solution?.trim(),
    },
    {
      id: 6,
      component: (
        <div className="wizard-step">
          <label className="wizard-label">Landscape concurrentiel</label>
          <div className="wizard-checkbox-group">
            {["Aucune alternative identifiée", "Alternatives existantes identifiées", "Analyse en cours"].map((option) => (
              <label key={option} className="wizard-checkbox">
                <input
                  type="checkbox"
                  checked={answers.competitors?.includes(option) || false}
                  onChange={(e) => {
                    const current = answers.competitors || [];
                    if (e.target.checked) {
                      updateAnswer('competitors', [...current, option]);
                    } else {
                      updateAnswer('competitors', current.filter(c => c !== option));
                    }
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {answers.competitors?.includes("Alternatives existantes identifiées") && (
            <input
              type="text"
              value={answers.competitorsAlternatives || ''}
              onChange={(e) => updateAnswer('competitorsAlternatives', e.target.value)}
              className="wizard-input"
              placeholder="Veuillez citer 1 à 3 alternatives principales"
              autoFocus
            />
          )}
        </div>
      ),
    },
    {
      id: 7,
      component: (
        <div className="wizard-step">
          <label className="wizard-label">Fonctionnalité critique du MVP</label>
          <input
            type="text"
            value={answers.mvpFeature || ''}
            onChange={(e) => updateAnswer('mvpFeature', e.target.value)}
            className="wizard-input"
            placeholder="Ex: Système d'authentification et gestion de profils utilisateurs"
            autoFocus
          />
          <div className="wizard-info">
            <span className="wizard-info-icon">💡</span>
            <span>Cette fonctionnalité permet de définir le périmètre minimal viable et livrable du MVP.</span>
          </div>
        </div>
      ),
      validate: (a) => !!a.mvpFeature?.trim(),
    },
    {
      id: 8,
      component: (
        <div className="wizard-step">
          <label className="wizard-label">Fonctionnalités complémentaires du MVP (optionnel)</label>
          {[1, 2, 3].map((num) => (
            <input
              key={num}
              type="text"
              value={answers.mvpFeatures?.[num - 1] || ''}
              onChange={(e) => {
                const current = answers.mvpFeatures || [];
                const updated = [...current];
                updated[num - 1] = e.target.value;
                updateAnswer('mvpFeatures', updated);
              }}
              className="wizard-input"
              placeholder={`Fonctionnalité ${num} (optionnel)`}
              autoFocus={num === 1}
            />
          ))}
        </div>
      ),
    },
    {
      id: 9,
      component: (
        <div className="wizard-step">
          <label className="wizard-label">Architecture produit</label>
          <div className="wizard-radio-group">
            {['SaaS', 'Application mobile', 'Site web', 'Marketplace', 'Autre'].map((option) => (
              <label key={option} className="wizard-radio">
                <input
                  type="radio"
                  name="productFormat"
                  value={option}
                  checked={answers.productFormat === option}
                  onChange={(e) => updateAnswer('productFormat', e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      ),
      validate: (a) => !!a.productFormat,
    },
    {
      id: 10,
      component: (
        <div className="wizard-step">
          <label className="wizard-label">Modèle économique</label>
          <div className="wizard-radio-group">
            {['Abonnement récurrent', 'Paiement unique', 'Freemium', 'Monétisation publicitaire', 'À définir'].map((option) => (
              <label key={option} className="wizard-radio">
                <input
                  type="radio"
                  name="monetization"
                  value={option}
                  checked={answers.monetization === option}
                  onChange={(e) => updateAnswer('monetization', e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          <div className="wizard-info">
            <span className="wizard-info-icon">💡</span>
            <span>Le modèle économique détermine l'architecture technique et fonctionnelle du MVP.</span>
          </div>
        </div>
      ),
      validate: (a) => !!a.monetization,
    },
    {
      id: 11,
      component: (
        <div className="wizard-step">
          <label className="wizard-label">Niveau d'expertise technique</label>
          <div className="wizard-radio-group">
            {['Débutant', 'Intermédiaire', 'Avancé', 'Aucune expertise technique'].map((option) => (
              <label key={option} className="wizard-radio">
                <input
                  type="radio"
                  name="technicalLevel"
                  value={option}
                  checked={answers.technicalLevel === option}
                  onChange={(e) => updateAnswer('technicalLevel', e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          <p className="wizard-helper">Cette information nous permet d'adapter nos recommandations à votre profil.</p>
        </div>
      ),
      validate: (a) => !!a.technicalLevel,
    },
    {
      id: 12,
      component: (
        <div className="wizard-step">
          <label className="wizard-label">Objectifs principaux (sélectionner au maximum 2)</label>
          <div className="wizard-checkbox-group">
            {[
              "Validation de marché avant investissement",
              'Génération de revenus',
              'Livraison rapide d\'un MVP',
              "Développement de compétences techniques"
            ].map((option) => (
              <label key={option} className="wizard-checkbox">
                <input
                  type="checkbox"
                  checked={answers.objectives?.includes(option) || false}
                  onChange={(e) => {
                    const current = answers.objectives || [];
                    if (e.target.checked) {
                      if (current.length < 2) {
                        updateAnswer('objectives', [...current, option]);
                      }
                    } else {
                      updateAnswer('objectives', current.filter(o => o !== option));
                    }
                  }}
                  disabled={!answers.objectives?.includes(option) && (answers.objectives?.length || 0) >= 2}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      ),
    },
  ];

  // Écran de succès après soumission
  if (isSubmitting) {
    return (
      <div className="wizard-page">
        <div className="wizard-container">
          <div className="wizard-success">
            <div className="wizard-success-icon">✓</div>
            <h2>Traitement en cours</h2>
            <p>Vos réponses sont actuellement en cours d'analyse par notre équipe.</p>
          </div>
        </div>
      </div>
    );
  }

  // Écran récapitulatif
  if (showSummary) {
    return (
      <div className="wizard-page">
        <div className="wizard-container">
          <div className="wizard-summary">
            <h2 className="wizard-summary-title">Récapitulatif de votre projet</h2>
            <div className="wizard-summary-content">
              <div className="wizard-summary-section">
                <h3>Informations générales</h3>
                <p><strong>Nom du projet:</strong> {answers.projectName || 'Non renseigné'}</p>
                <p><strong>Proposition de valeur:</strong> {answers.pitch || 'Non renseigné'}</p>
                <p><strong>Segment cible:</strong> {answers.target === 'Autre' ? answers.targetOther : answers.target || 'Non renseigné'}</p>
              </div>
              <div className="wizard-summary-section">
                <h3>Problématique & Solution</h3>
                <p><strong>Problématique adressée:</strong> {answers.problem || 'Non renseigné'}</p>
                <p><strong>Mécanisme de résolution:</strong> {answers.solution || 'Non renseigné'}</p>
              </div>
              <div className="wizard-summary-section">
                <h3>Analyse concurrentielle</h3>
                <p><strong>Landscape concurrentiel:</strong> {answers.competitors?.join(', ') || 'Non renseigné'}</p>
                {answers.competitorsAlternatives && (
                  <p><strong>Alternatives identifiées:</strong> {answers.competitorsAlternatives}</p>
                )}
              </div>
              <div className="wizard-summary-section">
                <h3>Définition du MVP</h3>
                <p><strong>Fonctionnalité critique:</strong> {answers.mvpFeature || 'Non renseigné'}</p>
                {answers.mvpFeatures && answers.mvpFeatures.length > 0 && (
                  <p><strong>Fonctionnalités complémentaires:</strong> {answers.mvpFeatures.filter(f => f).join(', ')}</p>
                )}
              </div>
              <div className="wizard-summary-section">
                <h3>Architecture & Modèle économique</h3>
                <p><strong>Architecture produit:</strong> {answers.productFormat || 'Non renseigné'}</p>
                <p><strong>Modèle économique:</strong> {answers.monetization || 'Non renseigné'}</p>
                <p><strong>Niveau d'expertise technique:</strong> {answers.technicalLevel || 'Non renseigné'}</p>
              </div>
              <div className="wizard-summary-section">
                <h3>Objectifs stratégiques</h3>
                <p>{answers.objectives?.join(', ') || 'Non renseigné'}</p>
              </div>
            </div>
            <div className="wizard-actions">
              <button onClick={handleBack} className="wizard-btn wizard-btn-secondary">
                Modifier les réponses
              </button>
              <button onClick={handleSubmit} className="wizard-btn wizard-btn-primary">
                Soumettre pour analyse
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="wizard-page">
      <div className="wizard-container">
        {/* Progress Bar */}
        <div className="wizard-progress-container">
          <div className="wizard-progress-bar">
            <div 
              className="wizard-progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="wizard-progress-text">
            Étape {currentStep + 1} / {TOTAL_STEPS}
          </div>
        </div>

        {/* Question Card */}
        <div className="wizard-card">
          {error && (
            <div className="wizard-error">
              {error}
            </div>
          )}
          {currentStepData.component}
        </div>

        {/* Navigation */}
        <div className="wizard-navigation">
          <button
            onClick={handleBack}
            className="wizard-btn wizard-btn-secondary"
            disabled={currentStep === 0}
          >
            Retour
          </button>
          <button
            onClick={handleNext}
            className="wizard-btn wizard-btn-primary"
          >
            {currentStep === TOTAL_STEPS - 1 ? 'Consulter le récapitulatif' : 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  );
}
