'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './project-wizard.css';
import {
  buildAnswersFromFormState,
  validateAnswers,
  computeDerivedFields,
  generateShortTitle,
  generateAdminSummary,
  buildPocketBasePayload,
  assertPayloadIntegrity,
  type FormState,
  type ValidationError,
} from '@/lib/intake';
import { getPocketBase } from '@/lib/pocketbase';

export interface ProjectAnswers {
  // V2 - Nouveau questionnaire Q0-Q23
  projectName?: string;
  q1_problem?: string;
  q2_target?: string;
  q3_frequency?: string;
  q4_current_solution?: string;
  q5_interesting?: string;
  q6_price_range?: string;
  q7_revenue_model?: string;
  q8_competition?: string;
  q9_uncertainty?: string;
  q10_first_action?: string;
  q11_flow_steps?: string;
  q12_return_reason?: string;
  q13_return_items?: string[];
  q14_need_account?: string;
  q15_store_what?: string[];
  q16_ai_type?: string;
  q17_integrations?: string[];
  q18_site_type?: string;
  q19_references?: string;
  q20_style?: string;
  q21_home_focus?: string;
  q22_output_type?: string;
  q23_pitch?: string;
}

interface Step {
  id: number;
  component: React.ReactNode;
  validate?: (answers: ProjectAnswers) => boolean;
}

interface ProjectWizardProps {
  editMode?: boolean;
  editProjectId?: string;
  initialFormState?: FormState;
}

export default function ProjectWizard({ editMode = false, editProjectId, initialFormState }: ProjectWizardProps = {}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<ProjectAnswers>(initialFormState || {});
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const STORAGE_KEY = editMode && editProjectId ? `projectWizard_edit_${editProjectId}` : 'seedev_project_draft_v2';
  const TOTAL_STEPS = 24; // Q0-Q23

  // Helper pour calculer un index sûr (clamp entre 0 et steps.length-1)
  const getSafeStepIndex = (index: number, stepsLength: number): number => {
    return Math.min(Math.max(index, 0), Math.max(0, stepsLength - 1));
  };

  // Pré-remplir avec initialFormState en mode édition
  useEffect(() => {
    if (editMode && initialFormState) {
      setAnswers(initialFormState);
      // Ne pas restaurer depuis localStorage en mode édition
      return;
    }
  }, [editMode, initialFormState]);

  // Restaurer depuis localStorage au mount (seulement si pas en mode édition)
  useEffect(() => {
    if (editMode) return; // Skip localStorage en mode édition
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Nettoyer les anciennes clés si présentes (migration)
        const cleanedAnswers: ProjectAnswers = {};
        const newKeys = ['projectName', 'q1_problem', 'q2_target', 'q3_frequency', 'q4_current_solution', 
          'q5_interesting', 'q6_price_range', 'q7_revenue_model', 'q8_competition', 'q9_uncertainty',
          'q10_first_action', 'q11_flow_steps', 'q12_return_reason', 'q13_return_items', 'q14_need_account',
          'q15_store_what', 'q16_ai_type', 'q17_integrations', 'q18_site_type', 'q19_references',
          'q20_style', 'q21_home_focus', 'q22_output_type', 'q23_pitch'];
        newKeys.forEach(key => {
          if (parsed.answers && key in parsed.answers) {
            cleanedAnswers[key as keyof ProjectAnswers] = parsed.answers[key];
          }
        });
        setAnswers(cleanedAnswers);
        // Clamper l'index sauvegardé pour éviter les crashes
        const savedStep = Number(parsed.currentStep);
        if (isFinite(savedStep) && savedStep >= 0) {
          const clampedStep = Math.min(savedStep, TOTAL_STEPS - 1);
          setCurrentStep(clampedStep);
        } else {
          setCurrentStep(0);
        }
      } catch (e) {
        console.error('Erreur lors de la restauration:', e);
        setCurrentStep(0);
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

  // Helper pour gérer les arrays exclusifs avec "nothing" (Q13 et Q15)
  const updateExclusiveArray = (key: 'q13_return_items' | 'q15_store_what', value: string, checked: boolean) => {
    const current = answers[key] || [];
    if (value === 'Rien') {
      // Si "Rien" est coché, remplacer tout par ["Rien"]
      updateAnswer(key, checked ? ['Rien'] : []);
    } else {
      // Si autre option est cochée, retirer "Rien" et ajouter/retirer l'option
      const withoutNothing = current.filter(item => item !== 'Rien');
      if (checked) {
        updateAnswer(key, [...withoutNothing, value]);
      } else {
        updateAnswer(key, withoutNothing.filter(item => item !== value));
      }
    }
  };

  const handleNext = () => {
    // Calculer un index sûr avant d'accéder à steps
    const safeIndex = getSafeStepIndex(currentStep, steps.length);
    const step = steps[safeIndex];
    
    // Garde-fou: si le step n'existe pas, réinitialiser à 0
    if (!step || !step.component) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Wizard] Step manquant:', { currentStep, safeIndex, stepsLength: steps.length, TOTAL_STEPS });
      }
      setCurrentStep(0);
      setError('Erreur: étape introuvable. Réinitialisation...');
      return;
    }
    
    if (step.validate && !step.validate(answers)) {
      setError('Ce champ est obligatoire pour poursuivre.');
      return;
    }
    
    // Clamper le prochain index
    const nextIndex = Math.min(currentStep + 1, TOTAL_STEPS - 1);
    if (nextIndex < TOTAL_STEPS - 1) {
      setCurrentStep(nextIndex);
      setError(null);
    } else {
      setShowSummary(true);
    }
  };

  const handleBack = () => {
    if (showSummary) {
      setShowSummary(false);
    } else if (currentStep > 0) {
      // Clamper le prochain index
      const prevIndex = Math.max(0, currentStep - 1);
      setCurrentStep(prevIndex);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    try {
      // 1. Construire answers depuis formState
      const formState: FormState = answers;
      const intakeAnswers = buildAnswersFromFormState(formState);
      
      // 2. Valider
      const errors = validateAnswers(intakeAnswers);
      if (errors.length > 0) {
        setValidationErrors(errors);
        setShowSummary(false);
        // Aller à la première question avec erreur
        // Q0 = step 0, Q1 = step 1, etc.
        const firstErrorQuestion = parseInt(errors[0].question.replace('Q', ''));
        if (firstErrorQuestion >= 0 && firstErrorQuestion < TOTAL_STEPS) {
          setCurrentStep(firstErrorQuestion);
        }
        return;
      }
      
      setValidationErrors([]);
      setIsSubmitting(true);
      
      // 3. Calculer les champs dérivés
      const derived = computeDerivedFields(intakeAnswers);
      
      // 4. Générer short_title et admin_summary
      const shortTitle = generateShortTitle(intakeAnswers);
      const adminSummary = generateAdminSummary(intakeAnswers, derived);
      
      // 5. Construire le payload
      const payload = buildPocketBasePayload(intakeAnswers, derived, shortTitle, adminSummary);
      
      // 6. Vérifier l'authentification et injecter owner
      const pb = getPocketBase();
      if (!pb.authStore.isValid || !pb.authStore.model) {
        throw new Error('Vous devez être connecté pour soumettre un projet. Veuillez vous reconnecter.');
      }
      
      // 6b. Préparer le payload selon le mode
      let finalPayload;
      if (editMode && editProjectId) {
        // Mode édition: ne pas toucher owner ni status
        finalPayload = {
          ...payload,
          // Ne pas inclure owner (garder celui existant)
          // Ne pas inclure status (garder "submitted")
        };
        // Retirer owner et status du payload pour l'update
        delete (finalPayload as any).owner;
        delete (finalPayload as any).status;
      } else {
        // Mode création: injecter owner
        finalPayload = {
          ...payload,
          owner: pb.authStore.model.id,
        };
      }
      
      // 7. Assertions anti-mismatch (dev only)
      if (!editMode) {
        // En mode création, vérifier l'intégrité avec owner
        assertPayloadIntegrity(finalPayload as any);
      }
      
      // Log en dev pour vérification
      if (process.env.NODE_ENV === 'development') {
        console.log(editMode ? 'UPDATE MODE' : 'CREATE MODE', finalPayload);
      }
      
      // 8. Soumettre à PocketBase
      try {
        if (editMode && editProjectId) {
          console.log('UPDATE PAYLOAD:', finalPayload);
          await pb.collection('project_intakes').update(editProjectId, finalPayload);
          console.log('UPDATE OK');
        } else {
          console.log('CREATE PAYLOAD:', finalPayload);
          await pb.collection('project_intakes').create(finalPayload);
          console.log('CREATE OK');
        }
      } catch (e: any) {
        console.error('PB ERROR:', e);
        console.error('PB ERROR DATA:', e?.data);
        alert(JSON.stringify(e?.data ?? e, null, 2));
        throw e;
      }
      
      // 9. Nettoyer localStorage
      localStorage.removeItem(STORAGE_KEY);
      
      // 10. Rediriger selon le mode
      if (editMode) {
        router.push('/projects');
      } else {
        router.push('/dashboard/new?success=true');
      }
    } catch (err: any) {
      console.error('Erreur lors de la soumission:', err);
      setIsSubmitting(false);
      setError(err?.message || 'Une erreur est survenue lors de la soumission. Veuillez réessayer.');
    }
  };

  const steps: Step[] = [
    // Q0: Nom du projet
    {
      id: 0,
      component: (
        <div className="wizard-step">
          <label className="wizard-label">Donnez un nom à votre projet</label>
          <input
            type="text"
            value={answers.projectName || ''}
            onChange={(e) => updateAnswer('projectName', e.target.value)}
            className="wizard-input"
            placeholder="Donner un nom a votre idée"
            autoFocus
          />
          <p className="wizard-helper">(Vous pourrez le changer ultérieurement)</p>
          {validationErrors.find(e => e.question === 'Q0') && (
            <p className="wizard-error">{validationErrors.find(e => e.question === 'Q0')?.message}</p>
          )}
        </div>
      ),
      validate: (a) => !!a.projectName?.trim() && a.projectName.trim().length >= 3,
    },
    // Q1: Problème
    {
      id: 1,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Business</h3>
          <label className="wizard-label">Quel problème résout votre solution ?</label>
          <textarea
            value={answers.q1_problem || ''}
            onChange={(e) => updateAnswer('q1_problem', e.target.value)}
            className="wizard-textarea"
            placeholder="Décrivez le problème que votre solution résout"
            rows={5}
            autoFocus
          />
          {validationErrors.find(e => e.question === 'Q1') && (
            <p className="wizard-error">{validationErrors.find(e => e.question === 'Q1')?.message}</p>
          )}
        </div>
      ),
      validate: (a) => !!a.q1_problem?.trim(),
    },
    // Q2: Target (single select)
    {
      id: 2,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Business</h3>
          <label className="wizard-label">À qui s'adresse votre projet ?</label>
          <div className="wizard-radio-group">
            {['Particuliers', 'Étudiants', 'Freelances', 'Créateurs de contenu', 'Entrepreneurs/PME', 'Autre'].map((option) => (
              <label key={option} className="wizard-radio">
                <input
                  type="radio"
                  name="q2_target"
                  value={option}
                  checked={answers.q2_target === option}
                  onChange={(e) => updateAnswer('q2_target', e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.find(e => e.question === 'Q2') && (
            <p className="wizard-error">{validationErrors.find(e => e.question === 'Q2')?.message}</p>
          )}
        </div>
      ),
      validate: (a) => !!a.q2_target,
    },
    // Q3: Frequency
    {
      id: 3,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Business</h3>
          <label className="wizard-label">À quelle fréquence vos utilisateurs rencontrent-ils ce problème ?</label>
          <div className="wizard-radio-group">
            {['Tous les jours', 'Plusieurs fois par semaine', 'Occasionnellement', 'Rarement'].map((option) => (
              <label key={option} className="wizard-radio">
                <input
                  type="radio"
                  name="q3_frequency"
                  value={option}
                  checked={answers.q3_frequency === option}
                  onChange={(e) => updateAnswer('q3_frequency', e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.find(e => e.question === 'Q3') && (
            <p className="wizard-error">{validationErrors.find(e => e.question === 'Q3')?.message}</p>
          )}
        </div>
      ),
      validate: (a) => !!a.q3_frequency,
    },
    // Q4: Current solution
    {
      id: 4,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Business</h3>
          <label className="wizard-label">Comment font-ils actuellement pour résoudre ce problème ?</label>
          <div className="wizard-radio-group">
            {['Ils bricolent seuls', 'Ils utilisent un outil imparfait', 'Ils payent quelqu\'un', 'Ils ne font rien'].map((option) => (
              <label key={option} className="wizard-radio">
                <input
                  type="radio"
                  name="q4_current_solution"
                  value={option}
                  checked={answers.q4_current_solution === option}
                  onChange={(e) => updateAnswer('q4_current_solution', e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.find(e => e.question === 'Q4') && (
            <p className="wizard-error">{validationErrors.find(e => e.question === 'Q4')?.message}</p>
          )}
        </div>
      ),
      validate: (a) => !!a.q4_current_solution,
    },
    // Q5: Interesting
    {
      id: 5,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Business</h3>
          <label className="wizard-label">Qu'est-ce qui rend votre idée vraiment intéressante pour les utilisateurs ?</label>
          <textarea
            value={answers.q5_interesting || ''}
            onChange={(e) => updateAnswer('q5_interesting', e.target.value)}
            className="wizard-textarea"
            placeholder="Expliquez ce qui rend votre solution unique et attrayante"
            rows={5}
            autoFocus
          />
        </div>
      ),
      validate: () => true, // Optionnel
    },
    // Q6: Price range
    {
      id: 6,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Business</h3>
          <label className="wizard-label">Quelle fourchette de prix envisagez-vous ?</label>
          <div className="wizard-radio-group">
            {['Moins de 10€', '10–30€', '30–100€', 'Plus de 100€'].map((option) => (
              <label key={option} className="wizard-radio">
                <input
                  type="radio"
                  name="q6_price_range"
                  value={option}
                  checked={answers.q6_price_range === option}
                  onChange={(e) => updateAnswer('q6_price_range', e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.find(e => e.question === 'Q6') && (
            <p className="wizard-error">{validationErrors.find(e => e.question === 'Q6')?.message}</p>
          )}
        </div>
      ),
      validate: (a) => !!a.q6_price_range,
    },
    // Q7: Revenue model
    {
      id: 7,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Business</h3>
          <label className="wizard-label">Quel modèle de revenu envisagez-vous ?</label>
          <div className="wizard-radio-group">
            {['Paiement unique', 'Abonnement mensuel', 'Abonnement annuel', 'Paiement à l\'usage', 'Freemium'].map((option) => (
              <label key={option} className="wizard-radio">
                <input
                  type="radio"
                  name="q7_revenue_model"
                  value={option}
                  checked={answers.q7_revenue_model === option}
                  onChange={(e) => updateAnswer('q7_revenue_model', e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.find(e => e.question === 'Q7') && (
            <p className="wizard-error">{validationErrors.find(e => e.question === 'Q7')?.message}</p>
          )}
        </div>
      ),
      validate: (a) => !!a.q7_revenue_model,
    },
    // Q8: Competition
    {
      id: 8,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Business</h3>
          <label className="wizard-label">Y a-t-il de la concurrence pour ce type de solution ?</label>
          <div className="wizard-radio-group">
            {['Oui, beaucoup', 'Oui, quelques-uns', 'Très peu', 'Aucun'].map((option) => (
              <label key={option} className="wizard-radio">
                <input
                  type="radio"
                  name="q8_competition"
                  value={option}
                  checked={answers.q8_competition === option}
                  onChange={(e) => updateAnswer('q8_competition', e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.find(e => e.question === 'Q8') && (
            <p className="wizard-error">{validationErrors.find(e => e.question === 'Q8')?.message}</p>
          )}
        </div>
      ),
      validate: (a) => !!a.q8_competition,
    },
    // Q9: Uncertainty
    {
      id: 9,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Business</h3>
          <label className="wizard-label">Y a-t-il un point qui vous semble encore flou ou incertain dans votre projet ?</label>
          <textarea
            value={answers.q9_uncertainty || ''}
            onChange={(e) => updateAnswer('q9_uncertainty', e.target.value)}
            className="wizard-textarea"
            placeholder="Décrivez les points d'incertitude ou de flou"
            rows={5}
            autoFocus
          />
        </div>
      ),
      validate: () => true, // Optionnel
    },
    // Q10: First action
    {
      id: 10,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Produit</h3>
          <label className="wizard-label">Quand quelqu'un arrive sur le site, quelle action principale attendez-vous de lui immédiatement ?</label>
          <div className="wizard-radio-group">
            {['Découvrir / comprendre', 'Renseigner une info', 'Créer / générer quelque chose', 'Acheter / commander'].map((option) => (
              <label key={option} className="wizard-radio">
                <input
                  type="radio"
                  name="q10_first_action"
                  value={option}
                  checked={answers.q10_first_action === option}
                  onChange={(e) => updateAnswer('q10_first_action', e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.find(e => e.question === 'Q10') && (
            <p className="wizard-error">{validationErrors.find(e => e.question === 'Q10')?.message}</p>
          )}
        </div>
      ),
      validate: (a) => !!a.q10_first_action,
    },
    // Q11: Flow steps
    {
      id: 11,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Produit</h3>
          <label className="wizard-label">Décrivez le parcours idéal en quelques étapes</label>
          <textarea
            value={answers.q11_flow_steps || ''}
            onChange={(e) => updateAnswer('q11_flow_steps', e.target.value)}
            className="wizard-textarea"
            placeholder="Décrivez étape par étape ce que l'utilisateur fait sur votre site"
            rows={5}
            autoFocus
          />
        </div>
      ),
      validate: () => true, // Optionnel
    },
    // Q12: Return reason
    {
      id: 12,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Produit</h3>
          <label className="wizard-label">Est-ce que les utilisateurs ont une raison de revenir ?</label>
          <div className="wizard-radio-group">
            {['Oui, souvent', 'Oui, de temps en temps', 'Non, usage unique'].map((option) => (
              <label key={option} className="wizard-radio">
                <input
                  type="radio"
                  name="q12_return_reason"
                  value={option}
                  checked={answers.q12_return_reason === option}
                  onChange={(e) => updateAnswer('q12_return_reason', e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.find(e => e.question === 'Q12') && (
            <p className="wizard-error">{validationErrors.find(e => e.question === 'Q12')?.message}</p>
          )}
        </div>
      ),
      validate: (a) => !!a.q12_return_reason,
    },
    // Q13: Return items (avec exclusivité "Rien")
    {
      id: 13,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Produit</h3>
          <label className="wizard-label">Si quelqu'un revient, doit-il retrouver quelque chose ?</label>
          <div className="wizard-checkbox-group">
            {['Historique', 'Contenus créés', 'Achats', 'Paramètres', 'Rien'].map((option) => (
              <label key={option} className="wizard-checkbox">
                <input
                  type="checkbox"
                  checked={answers.q13_return_items?.includes(option) || false}
                  onChange={(e) => updateExclusiveArray('q13_return_items', option, e.target.checked)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.find(e => e.question === 'Q13') && (
            <p className="wizard-error">{validationErrors.find(e => e.question === 'Q13')?.message}</p>
          )}
        </div>
      ),
      validate: (a) => !!a.q13_return_items && a.q13_return_items.length > 0,
    },
    // Q14: Need account
    {
      id: 14,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Produit</h3>
          <label className="wizard-label">Est-ce qu'il est nécessaire que l'utilisateur ait un compte ?</label>
          <div className="wizard-radio-group">
            {['Oui indispensable', 'Oui plus tard', 'Non inutile'].map((option) => (
              <label key={option} className="wizard-radio">
                <input
                  type="radio"
                  name="q14_need_account"
                  value={option}
                  checked={answers.q14_need_account === option}
                  onChange={(e) => updateAnswer('q14_need_account', e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.find(e => e.question === 'Q14') && (
            <p className="wizard-error">{validationErrors.find(e => e.question === 'Q14')?.message}</p>
          )}
        </div>
      ),
      validate: (a) => !!a.q14_need_account,
    },
    // Q15: Store what (avec exclusivité "Rien")
    {
      id: 15,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Tech</h3>
          <label className="wizard-label">Que devez-vous stocker dans une base de données ?</label>
          <div className="wizard-checkbox-group">
            {['Comptes utilisateurs', 'Contenus / projets', 'Paiements', 'Fichiers', 'Historique', 'Rien'].map((option) => (
              <label key={option} className="wizard-checkbox">
                <input
                  type="checkbox"
                  checked={answers.q15_store_what?.includes(option) || false}
                  onChange={(e) => updateExclusiveArray('q15_store_what', option, e.target.checked)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.find(e => e.question === 'Q15') && (
            <p className="wizard-error">{validationErrors.find(e => e.question === 'Q15')?.message}</p>
          )}
        </div>
      ),
      validate: (a) => !!a.q15_store_what && a.q15_store_what.length > 0,
    },
    // Q16: AI type
    {
      id: 16,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Tech</h3>
          <label className="wizard-label">Le site utilise-t-il de l'intelligence artificielle ?</label>
          <div className="wizard-radio-group">
            {['Non', 'Oui, il génère du contenu', 'Oui, il analyse des données', 'Oui, il fait des recommandations'].map((option) => (
              <label key={option} className="wizard-radio">
                <input
                  type="radio"
                  name="q16_ai_type"
                  value={option}
                  checked={answers.q16_ai_type === option}
                  onChange={(e) => updateAnswer('q16_ai_type', e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      ),
      validate: (a) => !!a.q16_ai_type,
    },
    // Q17: Integrations
    {
      id: 17,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Tech</h3>
          <label className="wizard-label">Y a-t-il des outils externes à connecter ?</label>
          <p className="wizard-helper">Sélectionnez les intégrations nécessaires :</p>
          <div className="wizard-checkbox-group">
            {['Paiement', 'Email', 'Réseaux sociaux', 'Fichiers', 'Autre'].map((option) => (
              <label key={option} className="wizard-checkbox">
                <input
                  type="checkbox"
                  checked={answers.q17_integrations?.includes(option) || false}
                  onChange={(e) => {
                    const current = answers.q17_integrations || [];
                    if (e.target.checked) {
                      updateAnswer('q17_integrations', [...current, option]);
                    } else {
                      updateAnswer('q17_integrations', current.filter(c => c !== option));
                    }
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      ),
      validate: () => true, // Optionnel
    },
    // Q18: Site type
    {
      id: 18,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Tech</h3>
          <label className="wizard-label">Si vous deviez décrire le site, diriez-vous qu'il est :</label>
          <div className="wizard-radio-group">
            {['Vitrine simple', 'Outil interactif', 'Application intelligente'].map((option) => (
              <label key={option} className="wizard-radio">
                <input
                  type="radio"
                  name="q18_site_type"
                  value={option}
                  checked={answers.q18_site_type === option}
                  onChange={(e) => updateAnswer('q18_site_type', e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.find(e => e.question === 'Q18') && (
            <p className="wizard-error">{validationErrors.find(e => e.question === 'Q18')?.message}</p>
          )}
        </div>
      ),
      validate: (a) => !!a.q18_site_type,
    },
    // Q19: Design references
    {
      id: 19,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Design</h3>
          <label className="wizard-label">Citez 1 à 3 sites/apps dont vous aimez l'ambiance</label>
          <textarea
            value={answers.q19_references || ''}
            onChange={(e) => updateAnswer('q19_references', e.target.value)}
            className="wizard-textarea"
            placeholder="Exemples: Notion, Stripe, Spotify..."
            rows={3}
            autoFocus
          />
        </div>
      ),
      validate: () => true, // Optionnel
    },
    // Q20: Design style
    {
      id: 20,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Design</h3>
          <label className="wizard-label">Quel style de design souhaitez-vous ?</label>
          <div className="wizard-radio-group">
            {['Premium minimal', 'Fun & dynamique', 'Dark / tech', 'Luxe', 'Très simple', 'Autre'].map((option) => (
              <label key={option} className="wizard-radio">
                <input
                  type="radio"
                  name="q20_style"
                  value={option}
                  checked={answers.q20_style === option}
                  onChange={(e) => updateAnswer('q20_style', e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.find(e => e.question === 'Q20') && (
            <p className="wizard-error">{validationErrors.find(e => e.question === 'Q20')?.message}</p>
          )}
        </div>
      ),
      validate: (a) => !!a.q20_style,
    },
    // Q21: Homepage focus
    {
      id: 21,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Design</h3>
          <label className="wizard-label">Sur la page d'accueil, l'utilisateur voit principalement :</label>
          <div className="wizard-radio-group">
            {['Un gros bouton', 'Un champ à remplir', 'Un tableau de bord', 'Un feed / liste', 'Autre'].map((option) => (
              <label key={option} className="wizard-radio">
                <input
                  type="radio"
                  name="q21_home_focus"
                  value={option}
                  checked={answers.q21_home_focus === option}
                  onChange={(e) => updateAnswer('q21_home_focus', e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.find(e => e.question === 'Q21') && (
            <p className="wizard-error">{validationErrors.find(e => e.question === 'Q21')?.message}</p>
          )}
        </div>
      ),
      validate: (a) => !!a.q21_home_focus,
    },
    // Q22: Output type
    {
      id: 22,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Design</h3>
          <label className="wizard-label">Quel type de résultat l'utilisateur obtient-il ?</label>
          <div className="wizard-radio-group">
            {['Une page de rapport', 'Un tableau de bord', 'Un fichier / PDF', 'Un contenu prêt à poster', 'Autre'].map((option) => (
              <label key={option} className="wizard-radio">
                <input
                  type="radio"
                  name="q22_output_type"
                  value={option}
                  checked={answers.q22_output_type === option}
                  onChange={(e) => updateAnswer('q22_output_type', e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {validationErrors.find(e => e.question === 'Q22') && (
            <p className="wizard-error">{validationErrors.find(e => e.question === 'Q22')?.message}</p>
          )}
        </div>
      ),
      validate: (a) => !!a.q22_output_type,
    },
    // Q23: Final pitch
    {
      id: 23,
      component: (
        <div className="wizard-step">
          <h3 className="wizard-section-title">Synthèse finale</h3>
          <label className="wizard-label">Présentez votre projet de A à Z avec vos mots</label>
          <textarea
            value={answers.q23_pitch || ''}
            onChange={(e) => updateAnswer('q23_pitch', e.target.value)}
            className="wizard-textarea"
            placeholder="Décrivez votre projet dans son ensemble, en expliquant son concept, son fonctionnement, sa valeur et son objectif..."
            rows={12}
            autoFocus
          />
          {validationErrors.find(e => e.question === 'Q23') && (
            <p className="wizard-error">{validationErrors.find(e => e.question === 'Q23')?.message}</p>
          )}
        </div>
      ),
      validate: (a) => !!a.q23_pitch?.trim(),
    },
  ];

  // Si l'index était incorrect, corriger le state (via useEffect pour éviter les warnings React)
  // IMPORTANT: Ce useEffect doit être appelé APRÈS la définition de steps, mais AVANT tous les returns conditionnels
  useEffect(() => {
    if (steps.length > 0) {
      const safeIndex = getSafeStepIndex(currentStep, steps.length);
      if (currentStep !== safeIndex) {
        setCurrentStep(safeIndex);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps.length]);

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
            <h2 className="wizard-summary-title">{editMode ? 'Modifier mon projet' : 'Récapitulatif'}</h2>
            <div className="wizard-summary-content">
              {/* Section 0 - Identité */}
              <div className="wizard-summary-section">
                <h3>Identité</h3>
                <div className="wizard-summary-subsection">
                  <h4>Q0. Nom du projet</h4>
                  <p>{answers.projectName || 'Non renseigné'}</p>
                </div>
              </div>

              {/* Section A - Business */}
              <div className="wizard-summary-section">
                <h3>A) Business</h3>
                <div className="wizard-summary-subsection">
                  <h4>Q1. Problème principal</h4>
                  <p>{answers.q1_problem || 'Non renseigné'}</p>
                </div>
                <div className="wizard-summary-subsection">
                  <h4>Q2. Cible</h4>
                  <p>{answers.q2_target || 'Non renseigné'}</p>
                </div>
                <div className="wizard-summary-subsection">
                  <h4>Q3. Fréquence du problème</h4>
                  <p>{answers.q3_frequency || 'Non renseigné'}</p>
                </div>
                <div className="wizard-summary-subsection">
                  <h4>Q4. Solution actuelle</h4>
                  <p>{answers.q4_current_solution || 'Non renseigné'}</p>
                </div>
                <div className="wizard-summary-subsection">
                  <h4>Q5. Ce qui rend l'idée intéressante</h4>
                  <p>{answers.q5_interesting || 'Non renseigné'}</p>
                </div>
                <div className="wizard-summary-subsection">
                  <h4>Q6. Fourchette de prix</h4>
                  <p>{answers.q6_price_range || 'Non renseigné'}</p>
                </div>
                <div className="wizard-summary-subsection">
                  <h4>Q7. Modèle de revenu</h4>
                  <p>{answers.q7_revenue_model || 'Non renseigné'}</p>
                </div>
                <div className="wizard-summary-subsection">
                  <h4>Q8. Niveau de concurrence</h4>
                  <p>{answers.q8_competition || 'Non renseigné'}</p>
                </div>
                <div className="wizard-summary-subsection">
                  <h4>Q9. Points d'incertitude</h4>
                  <p>{answers.q9_uncertainty || 'Non renseigné'}</p>
                </div>
              </div>

              {/* Section B - Produit */}
              <div className="wizard-summary-section">
                <h3>B) Produit</h3>
                <div className="wizard-summary-subsection">
                  <h4>Q10. Action principale</h4>
                  <p>{answers.q10_first_action || 'Non renseigné'}</p>
                </div>
                <div className="wizard-summary-subsection">
                  <h4>Q11. Parcours idéal</h4>
                  <p>{answers.q11_flow_steps || 'Non renseigné'}</p>
                </div>
                <div className="wizard-summary-subsection">
                  <h4>Q12. Raison de retour</h4>
                  <p>{answers.q12_return_reason || 'Non renseigné'}</p>
                </div>
                <div className="wizard-summary-subsection">
                  <h4>Q13. Éléments à retrouver</h4>
                  <p>{answers.q13_return_items?.join(', ') || 'Non renseigné'}</p>
                </div>
                <div className="wizard-summary-subsection">
                  <h4>Q14. Nécessité d'un compte</h4>
                  <p>{answers.q14_need_account || 'Non renseigné'}</p>
                </div>
              </div>

              {/* Section C - Tech */}
              <div className="wizard-summary-section">
                <h3>C) Tech</h3>
                <div className="wizard-summary-subsection">
                  <h4>Q15. Éléments à stocker</h4>
                  <p>{answers.q15_store_what?.join(', ') || 'Non renseigné'}</p>
                </div>
                <div className="wizard-summary-subsection">
                  <h4>Q16. Type d'IA</h4>
                  <p>{answers.q16_ai_type || 'Non renseigné'}</p>
                </div>
                <div className="wizard-summary-subsection">
                  <h4>Q17. Intégrations</h4>
                  <p>{answers.q17_integrations?.join(', ') || 'Non renseigné'}</p>
                </div>
                <div className="wizard-summary-subsection">
                  <h4>Q18. Type de site</h4>
                  <p>{answers.q18_site_type || 'Non renseigné'}</p>
                </div>
              </div>

              {/* Section D - Design */}
              <div className="wizard-summary-section">
                <h3>D) Design</h3>
                <div className="wizard-summary-subsection">
                  <h4>Q19. Références design</h4>
                  <p>{answers.q19_references || 'Non renseigné'}</p>
                </div>
                <div className="wizard-summary-subsection">
                  <h4>Q20. Style de design</h4>
                  <p>{answers.q20_style || 'Non renseigné'}</p>
                </div>
                <div className="wizard-summary-subsection">
                  <h4>Q21. Focus page d'accueil</h4>
                  <p>{answers.q21_home_focus || 'Non renseigné'}</p>
                </div>
                <div className="wizard-summary-subsection">
                  <h4>Q22. Type de résultat</h4>
                  <p>{answers.q22_output_type || 'Non renseigné'}</p>
                </div>
              </div>

              {/* Section E - Synthèse */}
              <div className="wizard-summary-section">
                <h3>E) Synthèse finale</h3>
                <div className="wizard-summary-subsection">
                  <h4>Q23. Présentation complète du projet</h4>
                  <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{answers.q23_pitch || 'Non renseigné'}</p>
                </div>
              </div>
            </div>
            {validationErrors.length > 0 && (
              <div className="wizard-error" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <strong>Erreurs de validation :</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err.question}: {err.message}</li>
                  ))}
                </ul>
              </div>
            )}
            {error && (
              <div className="wizard-error" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}
            <div className="wizard-actions">
              <button onClick={handleBack} className="wizard-btn wizard-btn-secondary">
                Modifier les réponses
              </button>
              <button onClick={handleSubmit} className="wizard-btn wizard-btn-primary" disabled={isSubmitting}>
                {isSubmitting 
                  ? (editMode ? 'Enregistrement en cours...' : 'Soumission en cours...')
                  : (editMode ? 'Enregistrer mes modifications' : 'Soumettre pour analyse')
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vérifier que steps est défini et non vide
  if (!steps || steps.length === 0) {
    return (
      <div className="wizard-page">
        <div className="wizard-container">
          <div className="wizard-card">
            <div className="wizard-error">
              <h3>Erreur: configuration invalide</h3>
              <p>Le questionnaire n'est pas correctement configuré. Veuillez recharger la page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculer un index sûr avant d'accéder à steps
  const safeStepIndex = getSafeStepIndex(currentStep, steps.length);
  const currentStepData = steps[safeStepIndex];

  // Logs en dev pour diagnostiquer
  if (process.env.NODE_ENV === 'development') {
    if (currentStep !== safeStepIndex || !currentStepData || !currentStepData.component) {
      console.log('[Wizard] Debug:', {
        stepsLength: steps.length,
        currentStep,
        safeStepIndex,
        TOTAL_STEPS,
        hasStep: !!currentStepData,
        hasComponent: !!currentStepData?.component,
      });
    }
  }

  // Garde-fou: si le step n'existe pas ou n'a pas de component, afficher un fallback
  if (!currentStepData || !currentStepData.component) {
    return (
      <div className="wizard-page">
        <div className="wizard-container">
          <div className="wizard-card">
            <div className="wizard-error">
              <h3>Erreur: étape introuvable</h3>
              <p>L'étape {currentStep + 1} n'est pas disponible. Veuillez recharger la page.</p>
              <button 
                onClick={() => {
                  setCurrentStep(0);
                  setError(null);
                }}
                className="wizard-btn wizard-btn-primary"
                style={{ marginTop: '1rem' }}
              >
                Réinitialiser le questionnaire
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            Étape {safeStepIndex + 1} / {TOTAL_STEPS}
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
            disabled={safeStepIndex === 0}
          >
            Retour
          </button>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {editMode && (
              <button
                onClick={handleSubmit}
                className="wizard-btn wizard-btn-save"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            )}
            <button
              onClick={handleNext}
              className="wizard-btn wizard-btn-primary"
            >
              {safeStepIndex === TOTAL_STEPS - 1 ? 'Consulter le récapitulatif' : 'Continuer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
