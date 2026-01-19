/**
 * Project Intake - Source de vérité unique
 * Gestion du schéma, mapping, validation et construction du payload PocketBase
 */

// ============================================================================
// SCHÉMA ANSWERS V1 (ancien, conservé pour compatibilité)
// ============================================================================

export interface IntakeAnswersV1 {
  q0_project_name: string;
  q1_utility: string;
  q2_audience: string[];
  q3_problem_gain: string;
  q4_value_proposition: string;
  q5_monetization: string[];
  q6_main_action: string;
  q7_after_action: string;
  q8_usage_type: string;
  q9_return_items: string[];
  q10_personal_space: string;
  q11_automation: string[];
  q12_integrations: string[];
  q13_site_type: string;
  q14_admin_features: string[];
  q15_autonomy: string;
  q16_first_visitors: string;
  q17_adjustment: string;
  q18_full_description: string;
}

// Type union pour compatibilité
export type IntakeAnswers = IntakeAnswersV1 | IntakeAnswersV2;

// ============================================================================
// SCHÉMA ANSWERS V2 (nouveau questionnaire Q0-Q23)
// ============================================================================

export interface IntakeAnswersV2 {
  v: 2;
  identity: {
    q0_project_name: string;
  };
  business: {
    q1_problem: string;
    q2_target: string;              // single slug
    q3_frequency: string;           // daily/weekly/occasional/rare
    q4_current_solution: string;    // diy/bad_tool/pay_someone/do_nothing
    q5_interesting: string;
    q6_price_range: string;         // lt10/10_30/30_100/gt100
    q7_revenue_model: string;        // one_time/monthly/annual/pay_per_use/freemium
    q8_competition: string;          // high/medium/low/none
    q9_uncertainty: string;
  };
  product: {
    q10_first_action: string;        // discover/provide_info/produce/pay
    q11_flow_steps: string;
    q12_return_reason: string;       // often/sometimes/one_time
    q13_return_items: string[];      // history/created_content/purchases/settings/nothing (exclusif)
    q14_need_account: string;        // required/later/none
  };
  tech: {
    q15_store_what: string[];        // users/content/payments/files/history/nothing (exclusif)
    q16_ai_type: string;             // none/generate/analyze/recommend
    q17_integrations: string[];      // payment/email/social/files/other
    q18_site_type: string;           // static/interactive/intelligent
  };
  design: {
    q19_references: string;
    q20_style: string;               // minimal/fun/dark/luxury/simple/other
    q21_home_focus: string;          // big_button/input_field/dashboard/feed/other
    q22_output_type: string;          // report/dashboard/file/ready_content/other
  };
  final: {
    q23_pitch: string;
  };
}

// Helper pour vérifier la version
export function isV2(answers: IntakeAnswers): answers is IntakeAnswersV2 {
  return typeof answers === 'object' && answers !== null && 'v' in answers && answers.v === 2;
}

// ============================================================================
// MAPPING LABELS -> SLUGS (V1 - conservé pour compatibilité)
// ============================================================================

export const MAPPINGS_V1 = {
  audience: {
    'Particuliers': 'individuals',
    'Professionnels / Entreprises': 'businesses',
    'Étudiants': 'students',
    'Freelances': 'freelancers',
    'PME': 'smb',
    'Créateurs de contenu': 'creators',
    'Grand public': 'general_public',
    'Autre': 'other',
  },
  monetization: {
    'Paiement unique': 'one_time',
    'Abonnement mensuel': 'monthly',
    'Abonnement annuel': 'annual',
    'Paiement à l\'utilisation': 'pay_per_use',
    'Freemium': 'freemium',
    'Publicité': 'ads',
    'Commission / Marketplace': 'commission_marketplace',
    'Sponsoring': 'sponsoring',
    'Autre': 'other',
  },
  mainAction: {
    'Découvrir / comprendre': 'discover',
    'Renseigner une information': 'provide_info',
    'Produire quelque chose (créer, générer, publier)': 'produce',
    'Payer / commander': 'pay',
  },
  usageType: {
    'Une utilisation unique (il vient, fait son truc, repart)': 'one_time',
    'Une utilisation répétée (il a une raison de revenir)': 'repeated',
  },
  returnItems: {
    'Un historique': 'history',
    'Des contenus créés': 'created_content',
    'Des achats': 'purchases',
    'Des paramètres': 'settings',
    'Rien du tout': 'nothing',
  },
  personalSpace: {
    'Oui, indispensable': 'required',
    'Oui, mais plus tard': 'later',
    'Non, inutile': 'none',
  },
  automation: {
    'Répondre automatiquement': 'auto_reply',
    'Générer du contenu': 'generate_content',
    'Analyser ce que l\'utilisateur envoie': 'analyze_input',
    'Proposer des choix personnalisés': 'personalized_choices',
  },
  integrations: {
    'Paiement': 'payment',
    'Réseaux sociaux': 'social',
    'Email': 'email',
    'Fichiers': 'files',
    'Autre': 'other',
  },
  siteType: {
    'Statique (vitrine)': 'static',
    'Interactif': 'interactive',
    '"Intelligent"': 'intelligent',
  },
  adminFeatures: {
    'Voir les utilisateurs': 'view_users',
    'Modifier du contenu': 'edit_content',
    'Bloquer / supprimer des choses': 'moderate_delete',
  },
  autonomy: {
    'Oui, complètement autonome': 'autonomous',
    'Non, nécessite une intervention régulière': 'needs_regular_intervention',
  },
} as const;

// ============================================================================
// MAPPING LABELS -> SLUGS (V2 - nouveau questionnaire)
// ============================================================================

export const MAPPINGS = {
  // Q2: Target (single)
  target: {
    'Particuliers': 'individuals',
    'Étudiants': 'students',
    'Freelances': 'freelancers',
    'Créateurs de contenu': 'creators',
    'Entrepreneurs/PME': 'smb',
    'Autre': 'other',
  },
  
  // Q3: Frequency
  frequency: {
    'Tous les jours': 'daily',
    'Plusieurs fois par semaine': 'weekly',
    'Occasionnellement': 'occasional',
    'Rarement': 'rare',
  },
  
  // Q4: Current solution
  currentSolution: {
    'Ils bricolent seuls': 'diy',
    'Ils utilisent un outil imparfait': 'bad_tool',
    'Ils payent quelqu\'un': 'pay_someone',
    'Ils ne font rien': 'do_nothing',
  },
  
  // Q6: Price range
  priceRange: {
    'Moins de 10€': 'lt10',
    '10–30€': '10_30',
    '30–100€': '30_100',
    'Plus de 100€': 'gt100',
  },
  
  // Q7: Revenue model
  revenueModel: {
    'Paiement unique': 'one_time',
    'Abonnement mensuel': 'monthly',
    'Abonnement annuel': 'annual',
    'Paiement à l\'usage': 'pay_per_use',
    'Freemium': 'freemium',
  },
  
  // Q8: Competition
  competition: {
    'Oui, beaucoup': 'high',
    'Oui, quelques-uns': 'medium',
    'Très peu': 'low',
    'Aucun': 'none',
  },
  
  // Q10: First action
  firstAction: {
    'Découvrir / comprendre': 'discover',  // CORRIGÉ: espace avant le slash
    'Renseigner une info': 'provide_info',
    'Créer / générer quelque chose': 'produce',  // CORRIGÉ: espace avant le slash + "quelque chose"
    'Acheter / commander': 'pay',  // CORRIGÉ: espace avant le slash
  },
  
  // Q12: Return reason
  returnReason: {
    'Oui, souvent': 'often',
    'Oui, de temps en temps': 'sometimes',
    'Non, usage unique': 'one_time',
  },
  
  // Q13: Return items (exclusif avec "nothing")
  returnItems: {
    'Historique': 'history',
    'Contenus créés': 'created_content',
    'Achats': 'purchases',
    'Paramètres': 'settings',
    'Rien': 'nothing',
  },
  
  // Q14: Need account
  needAccount: {
    'Oui indispensable': 'required',
    'Oui plus tard': 'later',
    'Non inutile': 'none',
  },
  
  // Q15: Store what (exclusif avec "nothing")
  storeWhat: {
    'Comptes utilisateurs': 'users',
    'Contenus / projets': 'content',  // CORRIGÉ: espace avant le slash
    'Paiements': 'payments',
    'Fichiers': 'files',
    'Historique': 'history',
    'Rien': 'nothing',
  },
  
  // Q16: AI type
  aiType: {
    'Non': 'none',
    'Oui, il génère du contenu': 'generate',  // CORRIGÉ: label complet du wizard
    'Oui, il analyse des données': 'analyze',  // CORRIGÉ: label complet du wizard
    'Oui, il fait des recommandations': 'recommend',  // CORRIGÉ: label complet du wizard
  },
  
  // Q17: Integrations
  integrations: {
    'Paiement': 'payment',
    'Email': 'email',
    'Réseaux sociaux': 'social',
    'Fichiers': 'files',
    'Autre': 'other',
  },
  
  // Q18: Site type
  siteType: {
    'Vitrine simple': 'static',
    'Outil interactif': 'interactive',
    'Application intelligente': 'intelligent',
  },
  
  // Q20: Design style
  designStyle: {
    'Premium minimal': 'minimal',
    'Fun & dynamique': 'fun',
    'Dark / tech': 'dark',  // CORRIGÉ: espace avant le slash pour correspondre au wizard
    'Luxe': 'luxury',
    'Très simple': 'simple',
    'Autre': 'other',
  },
  
  // Q21: Homepage focus
  homepageFocus: {
    'Un gros bouton': 'big_button',
    'Un champ à remplir': 'input_field',
    'Un tableau de bord': 'dashboard',
    'Un feed / liste': 'feed',  // CORRIGÉ: espace avant le slash pour correspondre au wizard
    'Autre': 'other',
  },
  
  // Q22: Output type
  outputType: {
    'Une page de rapport': 'report',
    'Un tableau de bord': 'dashboard',
    'Un fichier / PDF': 'file',  // CORRIGÉ: espace avant le slash pour correspondre au wizard
    'Un contenu prêt à poster': 'ready_content',
    'Autre': 'other',
  },
} as const;

// ============================================================================
// HELPER: Convertir slug -> label (FONCTION UNIQUE EXPORTÉE)
// ============================================================================

/**
 * Convertit un slug en label via un mapping inversé
 * Version safe qui gère les cas null/undefined et retourne toujours une string
 */
export function getLabelFromSlug(
  mapping: Record<string, string> | undefined | null,
  slug: string | undefined | null
): string {
  if (!slug) return "—";
  if (!mapping) return String(slug);
  const found = Object.entries(mapping).find(([_, v]) => v === slug);
  return found?.[0] ?? String(slug);
}

// ============================================================================
// TYPES DÉRIVÉS
// ============================================================================

export interface DerivedFields {
  audience: string[];  // Array même si single (q2_target) - NOTE: nom changé de "audiences" à "audience"
  monetizations: string[];  // Array même si single (q7_revenue_model)
  site_type: 'static' | 'interactive' | 'intelligent';
  usage_type: 'one_time' | 'repeated';
  need_account: 'required' | 'later' | 'none';  // NOTE: nom changé de "needs_account" à "need_account"
  needs_db: boolean;
  needs_ai: boolean;
  needs_integrations: boolean;
  needs_payment: boolean;
  needs_admin_panel: boolean;
  // Nouveaux champs business/design
  problem_frequency: 'daily' | 'weekly' | 'occasional' | 'rare';
  current_solution: 'diy' | 'bad_tool' | 'pay_someone' | 'do_nothing';
  price_range: 'lt10' | '10_30' | '30_100' | 'gt100';
  competition_level: 'high' | 'medium' | 'low' | 'none';
  return_reason: 'often' | 'sometimes' | 'one_time';
  design_references: string;
  design_style: 'minimal' | 'fun' | 'dark' | 'luxury' | 'simple' | 'other';
  homepage_focus: 'big_button' | 'input_field' | 'dashboard' | 'feed' | 'other';
  final_output_type: 'report' | 'dashboard' | 'file' | 'ready_content' | 'other';
}

// ============================================================================
// FONCTION: Build Answers depuis FormState
// ============================================================================

export interface FormState {
  // V2 - Nouveau questionnaire
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

// Helper pour gérer les arrays exclusifs avec "nothing"
function handleExclusiveArray(
  items: string[], 
  nothingLabel: string, 
  nothingSlug: string,
  mapping: Record<string, string>
): string[] {
  if (!items || items.length === 0) return [];
  const hasNothing = items.includes(nothingLabel);
  if (hasNothing) {
    return [nothingSlug];
  }
  return items.map(label => mapping[label as keyof typeof mapping] || label);
}

export function buildAnswersFromFormState(formState: FormState): IntakeAnswersV2 {
  // Gérer Q13 (return_items) avec exclusivité "nothing"
  const q13_return_items = handleExclusiveArray(
    formState.q13_return_items || [],
    'Rien',
    'nothing',
    MAPPINGS.returnItems
  );
  
  // Gérer Q15 (store_what) avec exclusivité "nothing"
  const q15_store_what = handleExclusiveArray(
    formState.q15_store_what || [],
    'Rien',
    'nothing',
    MAPPINGS.storeWhat
  );
  
  // Q17 (integrations) - pas d'exclusivité
  const q17_integrations = (formState.q17_integrations || []).map(label =>
    MAPPINGS.integrations[label as keyof typeof MAPPINGS.integrations] || label
  );

  return {
    v: 2,
    identity: {
      q0_project_name: (formState.projectName || '').trim(),
    },
    business: {
      q1_problem: formState.q1_problem || '',
      q2_target: formState.q2_target ? MAPPINGS.target[formState.q2_target as keyof typeof MAPPINGS.target] || formState.q2_target : '',
      q3_frequency: formState.q3_frequency ? MAPPINGS.frequency[formState.q3_frequency as keyof typeof MAPPINGS.frequency] || formState.q3_frequency : '',
      q4_current_solution: formState.q4_current_solution ? MAPPINGS.currentSolution[formState.q4_current_solution as keyof typeof MAPPINGS.currentSolution] || formState.q4_current_solution : '',
      q5_interesting: formState.q5_interesting || '',
      q6_price_range: formState.q6_price_range ? MAPPINGS.priceRange[formState.q6_price_range as keyof typeof MAPPINGS.priceRange] || formState.q6_price_range : '',
      q7_revenue_model: formState.q7_revenue_model ? MAPPINGS.revenueModel[formState.q7_revenue_model as keyof typeof MAPPINGS.revenueModel] || formState.q7_revenue_model : '',
      q8_competition: formState.q8_competition ? MAPPINGS.competition[formState.q8_competition as keyof typeof MAPPINGS.competition] || formState.q8_competition : '',
      q9_uncertainty: formState.q9_uncertainty || '',
    },
    product: {
      q10_first_action: formState.q10_first_action ? MAPPINGS.firstAction[formState.q10_first_action as keyof typeof MAPPINGS.firstAction] || formState.q10_first_action : '',
      q11_flow_steps: formState.q11_flow_steps || '',
      q12_return_reason: formState.q12_return_reason ? MAPPINGS.returnReason[formState.q12_return_reason as keyof typeof MAPPINGS.returnReason] || formState.q12_return_reason : '',
      q13_return_items,
      q14_need_account: formState.q14_need_account ? MAPPINGS.needAccount[formState.q14_need_account as keyof typeof MAPPINGS.needAccount] || formState.q14_need_account : '',
    },
    tech: {
      q15_store_what,
      q16_ai_type: formState.q16_ai_type ? MAPPINGS.aiType[formState.q16_ai_type as keyof typeof MAPPINGS.aiType] || formState.q16_ai_type : '',
      q17_integrations,
      q18_site_type: formState.q18_site_type ? MAPPINGS.siteType[formState.q18_site_type as keyof typeof MAPPINGS.siteType] || formState.q18_site_type : '',
    },
    design: {
      q19_references: formState.q19_references || '',
      q20_style: formState.q20_style ? MAPPINGS.designStyle[formState.q20_style as keyof typeof MAPPINGS.designStyle] || formState.q20_style : '',
      q21_home_focus: formState.q21_home_focus ? MAPPINGS.homepageFocus[formState.q21_home_focus as keyof typeof MAPPINGS.homepageFocus] || formState.q21_home_focus : '',
      q22_output_type: formState.q22_output_type ? MAPPINGS.outputType[formState.q22_output_type as keyof typeof MAPPINGS.outputType] || formState.q22_output_type : '',
    },
    final: {
      q23_pitch: formState.q23_pitch || '',
    },
  };
}

// ============================================================================
// FONCTION: Hydrate FormState depuis AnswersV2 (slug -> label)
// ============================================================================


/**
 * Convertit un array de slugs en array de labels
 */
function getLabelsFromSlugs(mapping: Record<string, string>, slugs: string[] | undefined | null): string[] {
  if (!slugs || slugs.length === 0) return [];
  return slugs
    .map(slug => getLabelFromSlug(mapping, slug))
    .filter(label => label !== "—");
}

/**
 * Hydrate FormState depuis IntakeAnswersV2
 * Convertit les slugs stockés dans answers en labels pour l'UI
 */
export function hydrateFormStateFromAnswersV2(answers: IntakeAnswersV2): FormState {
  const a = answers;
  
  return {
    // Q0: Project name
    projectName: a.identity?.q0_project_name || '',
    
    // Business
    q1_problem: a.business?.q1_problem || '',
    q2_target: getLabelFromSlug(MAPPINGS.target, a.business?.q2_target) || '',
    q3_frequency: getLabelFromSlug(MAPPINGS.frequency, a.business?.q3_frequency) || '',
    q4_current_solution: getLabelFromSlug(MAPPINGS.currentSolution, a.business?.q4_current_solution) || '',
    q5_interesting: a.business?.q5_interesting || '',
    q6_price_range: getLabelFromSlug(MAPPINGS.priceRange, a.business?.q6_price_range) || '',
    q7_revenue_model: getLabelFromSlug(MAPPINGS.revenueModel, a.business?.q7_revenue_model) || '',
    q8_competition: getLabelFromSlug(MAPPINGS.competition, a.business?.q8_competition) || '',
    q9_uncertainty: a.business?.q9_uncertainty || '',
    
    // Product
    q10_first_action: getLabelFromSlug(MAPPINGS.firstAction, a.product?.q10_first_action) || '',
    q11_flow_steps: a.product?.q11_flow_steps || '',
    q12_return_reason: getLabelFromSlug(MAPPINGS.returnReason, a.product?.q12_return_reason) || '',
    q13_return_items: getLabelsFromSlugs(MAPPINGS.returnItems, a.product?.q13_return_items),
    q14_need_account: getLabelFromSlug(MAPPINGS.needAccount, a.product?.q14_need_account) || '',
    
    // Tech
    q15_store_what: getLabelsFromSlugs(MAPPINGS.storeWhat, a.tech?.q15_store_what),
    q16_ai_type: getLabelFromSlug(MAPPINGS.aiType, a.tech?.q16_ai_type) || '',
    q17_integrations: getLabelsFromSlugs(MAPPINGS.integrations, a.tech?.q17_integrations),
    q18_site_type: getLabelFromSlug(MAPPINGS.siteType, a.tech?.q18_site_type) || '',
    
    // Design
    q19_references: a.design?.q19_references || '',
    q20_style: getLabelFromSlug(MAPPINGS.designStyle, a.design?.q20_style) || '',
    q21_home_focus: getLabelFromSlug(MAPPINGS.homepageFocus, a.design?.q21_home_focus) || '',
    q22_output_type: getLabelFromSlug(MAPPINGS.outputType, a.design?.q22_output_type) || '',
    
    // Final
    q23_pitch: a.final?.q23_pitch || '',
  };
}

// ============================================================================
// FONCTION: Compute Derived Fields
// ============================================================================

export function computeDerivedFields(answers: IntakeAnswers): DerivedFields {
  if (isV2(answers)) {
    // V2 - Nouveau questionnaire
    const a = answers;
    
    // needs_ai = (q16_ai_type != "none") OR (q18_site_type == "intelligent")
    const needs_ai = a.tech.q16_ai_type !== 'none' || a.tech.q18_site_type === 'intelligent';
    
    // needs_integrations = (q17_integrations.length > 0)
    const needs_integrations = a.tech.q17_integrations.length > 0;
    
    // needs_payment = (q17_integrations includes "payment") OR (q7_revenue_model in ["one_time","monthly","annual","pay_per_use","freemium"])
    const paymentMonetizations = ['one_time', 'monthly', 'annual', 'pay_per_use', 'freemium'];
    const needs_payment = a.tech.q17_integrations.includes('payment') || 
      paymentMonetizations.includes(a.business.q7_revenue_model);
    
    // needs_db = (q15_store_what NOT includes "nothing") OR (q14_need_account != "none") OR (q12_return_reason != "one_time")
    const needs_db = !a.tech.q15_store_what.includes('nothing') || 
      a.product.q14_need_account !== 'none' || 
      a.product.q12_return_reason !== 'one_time';
    
    // usage_type = (q12_return_reason == "one_time") ? "one_time" : "repeated"
    const usage_type = a.product.q12_return_reason === 'one_time' ? 'one_time' : 'repeated';
    
    return {
      audience: [a.business.q2_target], // Array même si single
      monetizations: [a.business.q7_revenue_model], // Array même si single
      site_type: a.tech.q18_site_type as 'static' | 'interactive' | 'intelligent',
      usage_type: usage_type as 'one_time' | 'repeated',
      need_account: a.product.q14_need_account as 'required' | 'later' | 'none',
      needs_db,
      needs_ai,
      needs_integrations,
      needs_payment,
      needs_admin_panel: false, // Pour l'instant
      problem_frequency: a.business.q3_frequency as 'daily' | 'weekly' | 'occasional' | 'rare',
      current_solution: a.business.q4_current_solution as 'diy' | 'bad_tool' | 'pay_someone' | 'do_nothing',
      price_range: a.business.q6_price_range as 'lt10' | '10_30' | '30_100' | 'gt100',
      competition_level: a.business.q8_competition as 'high' | 'medium' | 'low' | 'none',
      return_reason: a.product.q12_return_reason as 'often' | 'sometimes' | 'one_time',
      design_references: a.design.q19_references,
      design_style: a.design.q20_style as 'minimal' | 'fun' | 'dark' | 'luxury' | 'simple' | 'other',
      homepage_focus: a.design.q21_home_focus as 'big_button' | 'input_field' | 'dashboard' | 'feed' | 'other',
      final_output_type: a.design.q22_output_type as 'report' | 'dashboard' | 'file' | 'ready_content' | 'other',
    };
  } else {
    // V1 - Ancien questionnaire (compatibilité)
    const a = answers as IntakeAnswersV1;
    const needs_ai = a.q11_automation.length > 0 || a.q13_site_type === 'intelligent';
    const needs_integrations = a.q12_integrations.length > 0;
    const paymentMonetizations = ['one_time', 'monthly', 'annual', 'pay_per_use', 'freemium', 'commission_marketplace', 'sponsoring'];
    const needs_payment = a.q12_integrations.includes('payment') || 
      a.q5_monetization.some(m => paymentMonetizations.includes(m));
    const needs_admin_panel = a.q14_admin_features.length > 0;
    const needs_db = !a.q9_return_items.includes('nothing') || 
      a.q10_personal_space !== 'none' || 
      a.q8_usage_type === 'repeated';
    
    return {
      audience: a.q2_audience,
      monetizations: a.q5_monetization,
      site_type: a.q13_site_type as 'static' | 'interactive' | 'intelligent',
      usage_type: a.q8_usage_type as 'one_time' | 'repeated',
      need_account: a.q10_personal_space as 'required' | 'later' | 'none',
      needs_db,
      needs_ai,
      needs_integrations,
      needs_payment,
      needs_admin_panel,
      // Valeurs par défaut pour les champs v2 (non disponibles en v1)
      problem_frequency: 'occasional',
      current_solution: 'diy',
      price_range: '10_30',
      competition_level: 'medium',
      return_reason: a.q8_usage_type === 'repeated' ? 'sometimes' : 'one_time',
      design_references: '',
      design_style: 'simple',
      homepage_focus: 'other',
      final_output_type: 'other',
    };
  }
}

// ============================================================================
// FONCTION: Generate Short Title
// ============================================================================

export function generateShortTitle(answers: IntakeAnswers): string {
  let source = '';
  
  if (isV2(answers)) {
    // V2
    source = answers.identity.q0_project_name?.trim() || '';
    if (!source) {
      source = answers.business.q1_problem?.trim() || '';
    }
    if (!source) {
      source = answers.final.q23_pitch?.trim() || '';
    }
  } else {
    // V1
    const a = answers as IntakeAnswersV1;
    source = a.q0_project_name?.trim() || '';
    if (!source) {
      source = a.q1_utility?.trim() || '';
    }
    if (!source) {
      source = a.q18_full_description?.trim() || '';
    }
  }
  
  if (!source) {
    // Fallback avec date
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 16).replace(/[-:T]/g, '');
    return `Projet-${dateStr}`;
  }
  
  // Nettoyer les retours à la ligne et limiter à 8 mots, min 5 chars
  const cleaned = source.replace(/\s+/g, ' ').trim();
  const words = cleaned.split(/\s+/).slice(0, 8);
  const result = words.join(' ');
  
  // S'assurer que c'est >= 5 chars
  if (result.length < 5) {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 16).replace(/[-:T]/g, '');
    return result.length > 0 ? `${result}-${dateStr.slice(-4)}` : `Projet-${dateStr}`;
  }
  
  return result;
}

// ============================================================================
// FONCTION: Generate Admin Summary
// ============================================================================

export function generateAdminSummary(answers: IntakeAnswers, derived: DerivedFields): string {
  const lines: string[] = [];
  
  if (isV2(answers)) {
    // V2 - Nouveau format
    const a = answers;
    
    // Ligne 1: Problème + cible + monétisation
    const problem = a.business.q1_problem?.substring(0, 60) || 'Non spécifié';
    const target = getLabelFromSlug(MAPPINGS.target, a.business.q2_target) || 'Non spécifié';
    const revenue = getLabelFromSlug(MAPPINGS.revenueModel, a.business.q7_revenue_model) || 'Non spécifié';
    lines.push(`Problème: ${problem}${a.business.q1_problem && a.business.q1_problem.length > 60 ? '...' : ''} | Cible: ${target} | Modèle: ${revenue}`);
    
    // Ligne 2: Type site + IA + intégrations
    const siteType = getLabelFromSlug(MAPPINGS.siteType, a.tech.q18_site_type) || 'Non spécifié';
    const aiType = a.tech.q16_ai_type !== 'none' ? getLabelFromSlug(MAPPINGS.aiType, a.tech.q16_ai_type) : 'Aucune';
    const integrations = a.tech.q17_integrations.length > 0 
      ? a.tech.q17_integrations.map(slug => getLabelFromSlug(MAPPINGS.integrations, slug)).join(', ')
      : 'Aucune';
    lines.push(`Type: ${siteType} | IA: ${aiType} | Intégrations: ${integrations}`);
    
    // Ligne 3: Design style + output
    const designStyle = getLabelFromSlug(MAPPINGS.designStyle, a.design.q20_style) || 'Non spécifié';
    const outputType = getLabelFromSlug(MAPPINGS.outputType, a.design.q22_output_type) || 'Non spécifié';
    lines.push(`Design: ${designStyle} | Output: ${outputType}`);
  } else {
    // V1 - Ancien format (compatibilité)
    const a = answers as IntakeAnswersV1;
    
    if (a.q1_utility) {
      lines.push(`Utilité: ${a.q1_utility.substring(0, 80)}${a.q1_utility.length > 80 ? '...' : ''}`);
    }
    
    const audienceStr = derived.audience.length > 0 ? derived.audience.join(', ') : 'Non spécifié';
    const monetizationStr = derived.monetizations.length > 0 ? derived.monetizations.join(', ') : 'Non spécifié';
    lines.push(`Public: ${audienceStr} | Modèle: ${monetizationStr}`);
    
    const techNeeds: string[] = [];
    if (derived.needs_ai) techNeeds.push('IA');
    if (derived.needs_db) techNeeds.push('Base de données');
    if (derived.needs_integrations) techNeeds.push('Intégrations');
    if (derived.needs_payment) techNeeds.push('Paiement');
    if (derived.needs_admin_panel) techNeeds.push('Admin');
    
    lines.push(`Type: ${derived.site_type} | Besoins: ${techNeeds.length > 0 ? techNeeds.join(', ') : 'Aucun'}`);
    lines.push(`Usage: ${derived.usage_type} | Compte: ${derived.need_account}`);
  }
  
  return lines.join('\n');
}


// ============================================================================
// FONCTION: Validate Answers
// ============================================================================

export interface ValidationError {
  question: string;
  message: string;
}

export function validateAnswers(answers: IntakeAnswers): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (isV2(answers)) {
    // V2 - Validation du nouveau questionnaire
    const a = answers;
    
    // Q0: project_name non vide, >= 3 chars
    if (!a.identity.q0_project_name?.trim() || a.identity.q0_project_name.trim().length < 3) {
      errors.push({ question: 'Q0', message: 'Le nom du projet est requis (minimum 3 caractères)' });
    }
    
    // Q1: problem obligatoire
    if (!a.business.q1_problem?.trim()) {
      errors.push({ question: 'Q1', message: 'Le problème est requis' });
    }
    
    // Q2: target obligatoire
    if (!a.business.q2_target?.trim()) {
      errors.push({ question: 'Q2', message: 'La cible est requise' });
    }
    
    // Q3: frequency obligatoire
    if (!a.business.q3_frequency?.trim()) {
      errors.push({ question: 'Q3', message: 'La fréquence est requise' });
    }
    
    // Q4: current_solution obligatoire
    if (!a.business.q4_current_solution?.trim()) {
      errors.push({ question: 'Q4', message: 'La solution actuelle est requise' });
    }
    
    // Q6: price_range obligatoire
    if (!a.business.q6_price_range?.trim()) {
      errors.push({ question: 'Q6', message: 'La fourchette de prix est requise' });
    }
    
    // Q7: revenue_model obligatoire
    if (!a.business.q7_revenue_model?.trim()) {
      errors.push({ question: 'Q7', message: 'Le modèle de revenu est requis' });
    }
    
    // Q8: competition obligatoire
    if (!a.business.q8_competition?.trim()) {
      errors.push({ question: 'Q8', message: 'Le niveau de concurrence est requis' });
    }
    
    // Q10: first_action obligatoire
    if (!a.product.q10_first_action?.trim()) {
      errors.push({ question: 'Q10', message: 'L\'action principale est requise' });
    }
    
    // Q12: return_reason obligatoire
    if (!a.product.q12_return_reason?.trim()) {
      errors.push({ question: 'Q12', message: 'La raison de retour est requise' });
    }
    
    // Q13: return_items - si "nothing" présent alors array = ["nothing"] (exclusif)
    if (!a.product.q13_return_items || a.product.q13_return_items.length === 0) {
      errors.push({ question: 'Q13', message: 'Au moins un élément à retrouver doit être sélectionné' });
    } else if (a.product.q13_return_items.includes('nothing') && a.product.q13_return_items.length > 1) {
      errors.push({ question: 'Q13', message: 'Si "Rien" est sélectionné, aucun autre élément ne peut être sélectionné' });
    }
    
    // Q14: need_account obligatoire
    if (!a.product.q14_need_account?.trim()) {
      errors.push({ question: 'Q14', message: 'La nécessité d\'un compte est requise' });
    }
    
    // Q15: store_what - si "nothing" présent alors array = ["nothing"] (exclusif)
    if (!a.tech.q15_store_what || a.tech.q15_store_what.length === 0) {
      errors.push({ question: 'Q15', message: 'Au moins un élément à stocker doit être sélectionné' });
    } else if (a.tech.q15_store_what.includes('nothing') && a.tech.q15_store_what.length > 1) {
      errors.push({ question: 'Q15', message: 'Si "Rien" est sélectionné, aucun autre élément ne peut être sélectionné' });
    }
    
    // Q18: site_type obligatoire
    if (!a.tech.q18_site_type?.trim()) {
      errors.push({ question: 'Q18', message: 'Le type de site est requis' });
    }
    
    // Q20: style obligatoire
    if (!a.design.q20_style?.trim()) {
      errors.push({ question: 'Q20', message: 'Le style de design est requis' });
    }
    
    // Q21: home_focus obligatoire
    if (!a.design.q21_home_focus?.trim()) {
      errors.push({ question: 'Q21', message: 'Le focus de la page d\'accueil est requis' });
    }
    
    // Q22: output_type obligatoire
    if (!a.design.q22_output_type?.trim()) {
      errors.push({ question: 'Q22', message: 'Le type de sortie est requis' });
    }
    
    // Q23: pitch obligatoire
    if (!a.final.q23_pitch?.trim()) {
      errors.push({ question: 'Q23', message: 'Le pitch final est requis' });
    }
  } else {
    // V1 - Validation ancien questionnaire (compatibilité)
    const a = answers as IntakeAnswersV1;
    
    if (!a.q0_project_name?.trim()) {
      errors.push({ question: 'Q0', message: 'Le nom du projet est requis' });
    }
    if (!a.q1_utility?.trim()) {
      errors.push({ question: 'Q1', message: 'L\'utilité principale est requise' });
    }
    if (!a.q2_audience || a.q2_audience.length === 0) {
      errors.push({ question: 'Q2', message: 'Au moins un segment de clientèle doit être sélectionné' });
    }
    if (!a.q3_problem_gain?.trim()) {
      errors.push({ question: 'Q3', message: 'Le problème résolu ou bénéfice est requis' });
    }
    if (!a.q4_value_proposition?.trim()) {
      errors.push({ question: 'Q4', message: 'La proposition de valeur est requise' });
    }
    if (!a.q5_monetization || a.q5_monetization.length === 0) {
      errors.push({ question: 'Q5', message: 'Au moins un modèle de monétisation doit être sélectionné' });
    }
    if (!a.q6_main_action) {
      errors.push({ question: 'Q6', message: 'L\'action principale est requise' });
    }
    if (!a.q8_usage_type) {
      errors.push({ question: 'Q8', message: 'Le type d\'utilisation est requis' });
    }
    if (!a.q10_personal_space) {
      errors.push({ question: 'Q10', message: 'La nécessité d\'un espace personnel est requise' });
    }
    if (!a.q13_site_type) {
      errors.push({ question: 'Q13', message: 'Le type de site est requis' });
    }
    if (!a.q15_autonomy) {
      errors.push({ question: 'Q15', message: 'Le niveau d\'autonomie est requis' });
    }
    if (!a.q18_full_description?.trim()) {
      errors.push({ question: 'Q18', message: 'La description complète est requise' });
    }
  }
  
  return errors;
}

// ============================================================================
// FONCTION: Build PocketBase Payload
// ============================================================================

export interface PocketBasePayload {
  status: 'submitted' | 'under_analysis' | 'analysis_sent' | 'waiting_validation' | 'approved_for_dev';
  project_name: string;
  short_title: string;
  answers: IntakeAnswers;
  admin_summary: string;
  audience: string[];  // NOTE: nom changé de "audiences" à "audience"
  monetizations: string[];
  site_type: 'static' | 'interactive' | 'intelligent';
  usage_type: 'one_time' | 'repeated';
  need_account: 'required' | 'later' | 'none';  // NOTE: nom changé de "needs_account" à "need_account"
  needs_db: boolean;
  needs_ai: boolean;
  needs_integrations: boolean;
  needs_payment: boolean;
  needs_admin_panel: boolean;
  // Nouveaux champs business/design
  problem_frequency: 'daily' | 'weekly' | 'occasional' | 'rare';
  current_solution: 'diy' | 'bad_tool' | 'pay_someone' | 'do_nothing';
  price_range: 'lt10' | '10_30' | '30_100' | 'gt100';
  competition_level: 'high' | 'medium' | 'low' | 'none';
  return_reason: 'often' | 'sometimes' | 'one_time';
  design_references: string;
  design_style: 'minimal' | 'fun' | 'dark' | 'luxury' | 'simple' | 'other';
  homepage_focus: 'big_button' | 'input_field' | 'dashboard' | 'feed' | 'other';
  final_output_type: 'report' | 'dashboard' | 'file' | 'ready_content' | 'other';
  owner?: string; // ID de l'utilisateur connecté (injecté avant la soumission)
}

export function buildPocketBasePayload(
  answers: IntakeAnswers,
  derived: DerivedFields,
  shortTitle: string,
  adminSummary: string
): PocketBasePayload {
  const projectName = isV2(answers) 
    ? answers.identity.q0_project_name.trim()
    : (answers as IntakeAnswersV1).q0_project_name.trim();
  
  return {
    status: 'submitted',
    project_name: projectName,
    short_title: shortTitle,
    answers,
    admin_summary: adminSummary,
    audience: derived.audience,
    monetizations: derived.monetizations,
    site_type: derived.site_type,
    usage_type: derived.usage_type,
    need_account: derived.need_account,
    needs_db: derived.needs_db,
    needs_ai: derived.needs_ai,
    needs_integrations: derived.needs_integrations,
    needs_payment: derived.needs_payment,
    needs_admin_panel: derived.needs_admin_panel,
    problem_frequency: derived.problem_frequency,
    current_solution: derived.current_solution,
    price_range: derived.price_range,
    competition_level: derived.competition_level,
    return_reason: derived.return_reason,
    design_references: derived.design_references,
    design_style: derived.design_style,
    homepage_focus: derived.homepage_focus,
    final_output_type: derived.final_output_type,
  };
}

// ============================================================================
// FONCTION: Assertions anti-mismatch (dev only)
// ============================================================================

export function assertPayloadIntegrity(payload: PocketBasePayload): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const isV2Payload = isV2(payload.answers);
  
  if (isV2Payload) {
    // V2 - Nouveau questionnaire
    const a = payload.answers as IntakeAnswersV2;
    
    // Assert 1: q2_target est une string (pas un array)
    if (typeof a.business.q2_target !== 'string') {
      throw new Error('MISMATCH: q2_target doit être une string (v2)');
    }
    
    // Assert 2: q7_revenue_model est une string (pas un array)
    if (typeof a.business.q7_revenue_model !== 'string') {
      throw new Error('MISMATCH: q7_revenue_model doit être une string (v2)');
    }
    
    // Assert 3: derived.audience est un array (même si q2_target est string)
    if (!Array.isArray(payload.audience)) {
      throw new Error('MISMATCH: audience (derived) doit être un array');
    }
    
    // Assert 4: derived.monetizations est un array (même si q7_revenue_model est string)
    if (!Array.isArray(payload.monetizations)) {
      throw new Error('MISMATCH: monetizations (derived) doit être un array');
    }
    
    // Assert 5: design_style doit être un slug valide (pas un label)
    const validDesignStyles = ['minimal', 'fun', 'dark', 'luxury', 'simple', 'other'];
    if (!validDesignStyles.includes(payload.design_style)) {
      throw new Error(`MISMATCH: design_style doit être un slug valide (${validDesignStyles.join(', ')}), reçu: "${payload.design_style}"`);
    }
    
    // Assert 6: homepage_focus doit être un slug valide (pas un label)
    const validHomepageFocus = ['big_button', 'input_field', 'dashboard', 'feed', 'other'];
    if (!validHomepageFocus.includes(payload.homepage_focus)) {
      throw new Error(`MISMATCH: homepage_focus doit être un slug valide (${validHomepageFocus.join(', ')}), reçu: "${payload.homepage_focus}"`);
    }
    
    // Assert 7: final_output_type doit être un slug valide (pas un label)
    const validOutputTypes = ['report', 'dashboard', 'file', 'ready_content', 'other'];
    if (!validOutputTypes.includes(payload.final_output_type)) {
      throw new Error(`MISMATCH: final_output_type doit être un slug valide (${validOutputTypes.join(', ')}), reçu: "${payload.final_output_type}"`);
    }
    
    // Assert 8: site_type doit être un slug valide
    const validSiteTypes = ['static', 'interactive', 'intelligent'];
    if (!validSiteTypes.includes(payload.site_type)) {
      throw new Error(`MISMATCH: site_type doit être un slug valide (${validSiteTypes.join(', ')}), reçu: "${payload.site_type}"`);
    }
    
    // Assert 9: usage_type doit être un slug valide
    const validUsageTypes = ['one_time', 'repeated'];
    if (!validUsageTypes.includes(payload.usage_type)) {
      throw new Error(`MISMATCH: usage_type doit être un slug valide (${validUsageTypes.join(', ')}), reçu: "${payload.usage_type}"`);
    }
    
    // Assert 10: need_account doit être un slug valide
    const validNeedAccount = ['required', 'later', 'none'];
    if (!validNeedAccount.includes(payload.need_account)) {
      throw new Error(`MISMATCH: need_account doit être un slug valide (${validNeedAccount.join(', ')}), reçu: "${payload.need_account}"`);
    }
    
    // Assert 11: problem_frequency doit être un slug valide
    const validFrequencies = ['daily', 'weekly', 'occasional', 'rare'];
    if (!validFrequencies.includes(payload.problem_frequency)) {
      throw new Error(`MISMATCH: problem_frequency doit être un slug valide (${validFrequencies.join(', ')}), reçu: "${payload.problem_frequency}"`);
    }
    
    // Assert 12: current_solution doit être un slug valide
    const validSolutions = ['diy', 'bad_tool', 'pay_someone', 'do_nothing'];
    if (!validSolutions.includes(payload.current_solution)) {
      throw new Error(`MISMATCH: current_solution doit être un slug valide (${validSolutions.join(', ')}), reçu: "${payload.current_solution}"`);
    }
    
    // Assert 13: price_range doit être un slug valide
    const validPriceRanges = ['lt10', '10_30', '30_100', 'gt100'];
    if (!validPriceRanges.includes(payload.price_range)) {
      throw new Error(`MISMATCH: price_range doit être un slug valide (${validPriceRanges.join(', ')}), reçu: "${payload.price_range}"`);
    }
    
    // Assert 14: competition_level doit être un slug valide
    const validCompetition = ['high', 'medium', 'low', 'none'];
    if (!validCompetition.includes(payload.competition_level)) {
      throw new Error(`MISMATCH: competition_level doit être un slug valide (${validCompetition.join(', ')}), reçu: "${payload.competition_level}"`);
    }
    
    // Assert 15: return_reason doit être un slug valide
    const validReturnReasons = ['often', 'sometimes', 'one_time'];
    if (!validReturnReasons.includes(payload.return_reason)) {
      throw new Error(`MISMATCH: return_reason doit être un slug valide (${validReturnReasons.join(', ')}), reçu: "${payload.return_reason}"`);
    }
    
    // Assert 16: Version du schéma
    console.log(`[Intake] Version du schéma: 2`);
    console.log('[Intake] Payload:', JSON.stringify(payload, null, 2));
  } else {
    // V1 - Ancien questionnaire (compatibilité)
    const a = payload.answers as IntakeAnswersV1;
    
    // Assert 1: q2_audience est array
    if (!Array.isArray(a.q2_audience)) {
      throw new Error('MISMATCH: q2_audience doit être un array (v1)');
    }
    
    // Assert 2: q5_monetization est array
    if (!Array.isArray(a.q5_monetization)) {
      throw new Error('MISMATCH: q5_monetization doit être un array (v1)');
    }
    
    // Assert 3: Version du schéma
    console.log(`[Intake] Version du schéma: 1`);
    console.log('[Intake] Payload:', JSON.stringify(payload, null, 2));
  }
}
