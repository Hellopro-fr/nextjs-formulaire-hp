// GTM exports
export {
  pushToDataLayer,
  trackFunnelStart as trackGTMFunnelStart,
  trackQuestionAnswered,
  trackQuestionNavigation,
  trackQuestionnaireComplete as trackGTMQuestionnaireComplete,
  trackProfileTypeSelected,
  trackProfileComplete,
  trackSupplierCardClick,
  trackSupplierSelectionChange,
  trackComparisonModalOpen,
  trackFormSubmitAttempt,
  trackLeadSubmitted as trackGTMLeadSubmitted,
  trackLeadSubmissionError,
  trackCompanySearch,
  trackSelectionPageView,
  trackContactFormView,
} from './gtm';

// GA4 exports
export {
  trackEvent,
  trackPageView,
  trackFunnelStart as trackGA4FunnelStart,
  trackQuestionnaireComplete as trackGA4QuestionnaireCompleteSimple,
  trackLeadSubmitted as trackGA4LeadSubmittedSimple,
  trackError,
  trackGA4QuestionAnswered,
  trackGA4QuestionnaireComplete,
  trackGA4ProfileComplete,
  trackGA4SupplierSelection,
  trackGA4LeadSubmitted,
} from './ga4';

// Hotjar exports
export {
  hotjarEvent,
  hotjarIdentify,
  hotjarStateChange,
  hotjarTagRecording,
  hotjarTriggerSurvey,
  HOTJAR_TAGS,
  tagHotjarUser,
} from './hotjar';
