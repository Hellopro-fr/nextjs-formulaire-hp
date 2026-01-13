// Global types are declared in types/global.d.ts

/**
 * Push un événement dans le dataLayer GTM
 */
export function pushToDataLayer(event: string, data?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event,
      ...data,
    });
  }
}

/**
 * Track le début du funnel
 */
export function trackFunnelStart(step: number = 1) {
  pushToDataLayer('funnel_start', { step });
}

/**
 * Track une question répondue
 */
export function trackQuestionAnswered(
  questionId: number,
  questionTitle: string,
  answers: string[],
  isMultiSelect: boolean
) {
  pushToDataLayer('question_answered', {
    question_id: questionId,
    question_title: questionTitle,
    answers,
    is_multiselect: isMultiSelect,
  });
}

/**
 * Track la navigation entre questions
 */
export function trackQuestionNavigation(
  fromQuestion: number,
  toQuestion: number,
  direction: 'next' | 'back'
) {
  pushToDataLayer('question_navigation', {
    from_question: fromQuestion,
    to_question: toQuestion,
    direction,
  });
}

/**
 * Track la fin du questionnaire
 */
export function trackQuestionnaireComplete(totalQuestions: number, timeSpentSeconds: number) {
  pushToDataLayer('questionnaire_complete', {
    total_questions: totalQuestions,
    time_spent_seconds: timeSpentSeconds,
  });
}

/**
 * Track la sélection du type de profil
 */
export function trackProfileTypeSelected(profileType: string) {
  pushToDataLayer('profile_type_selected', {
    profile_type: profileType,
  });
}

/**
 * Track la complétion du profil
 */
export function trackProfileComplete(profileType: string, hasCompany: boolean, location?: string) {
  pushToDataLayer('profile_complete', {
    profile_type: profileType,
    has_company: hasCompany,
    location,
  });
}

/**
 * Track le clic sur une carte fournisseur
 */
export function trackSupplierCardClick(
  supplierId: string,
  supplierName: string,
  matchScore: number,
  action: 'view_details' | 'toggle_select'
) {
  pushToDataLayer('supplier_card_click', {
    supplier_id: supplierId,
    supplier_name: supplierName,
    match_score: matchScore,
    action,
  });
}

/**
 * Track le changement de sélection fournisseur
 */
export function trackSupplierSelectionChange(
  supplierId: string,
  action: 'add' | 'remove',
  totalSelected: number
) {
  pushToDataLayer('supplier_selection_change', {
    supplier_id: supplierId,
    action,
    total_selected: totalSelected,
  });
}

/**
 * Track l'ouverture du modal de comparaison
 */
export function trackComparisonModalOpen(supplierIds: string[]) {
  pushToDataLayer('comparison_modal_open', {
    suppliers_compared: supplierIds,
  });
}

/**
 * Track la tentative de soumission du formulaire
 */
export function trackFormSubmitAttempt(isValid: boolean, missingFields?: string[]) {
  pushToDataLayer('form_submit_attempt', {
    is_valid: isValid,
    missing_fields: missingFields,
  });
}

/**
 * Track la soumission réussie du lead
 */
export function trackLeadSubmitted(leadId: string, suppliersCount: number, profileType: string) {
  pushToDataLayer('lead_submitted', {
    lead_id: leadId,
    suppliers_count: suppliersCount,
    profile_type: profileType,
    conversion: true,
  });
}

/**
 * Track une erreur de soumission
 */
export function trackLeadSubmissionError(errorType: string, errorMessage: string) {
  pushToDataLayer('lead_submission_error', {
    error_type: errorType,
    error_message: errorMessage,
  });
}

/**
 * Track la recherche d'entreprise
 */
export function trackCompanySearch(query: string, resultsCount: number) {
  pushToDataLayer('company_search', {
    query_length: query.length,
    results_count: resultsCount,
  });
}

/**
 * Track la vue de la page de sélection
 */
export function trackSelectionPageView(recommendedCount: number, totalCount: number) {
  pushToDataLayer('selection_page_view', {
    recommended_count: recommendedCount,
    total_count: totalCount,
  });
}

/**
 * Track la vue du formulaire de contact
 */
export function trackContactFormView(selectedSuppliersCount: number) {
  pushToDataLayer('contact_form_view', {
    selected_count: selectedSuppliersCount,
  });
}
