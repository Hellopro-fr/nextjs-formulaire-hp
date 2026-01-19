// ========================================
// TYPES & INTERFACES - API READY
// ========================================

// ========================================
// QUESTIONNAIRE TYPES
// ========================================
export interface Answer {
  id: string;
  mainText: string;
  secondaryText?: string;
}

export interface Question {
  id: number;
  title: string;
  justification: string;
  multiSelect: boolean;
  answers: Answer[];
}

export type UserAnswers = Record<number, string[]>;

// ========================================
// PROFILE TYPES
// ========================================
export type ProfileType = "pro_france" | "creation" | "pro_foreign" | "particulier" | null;

export interface CompanyResult {
  siren: string;
  name: string;
  address: string;
}

export interface ProfileData {
  type: ProfileType;
  company?: CompanyResult;
  companyName?: string;
  postalCode?: string;
  city?: string;
  country?: string;
}

export interface PostalCodeCity {
  postalCode: string;
  city: string;
}

// ========================================
// SUPPLIER & PRODUCT TYPES
// ========================================
export interface ProductSpec {
  label: string;
  value: string;
  matches?: boolean;
  expected?: string;
}

export interface SupplierInfo {
  name: string;
  description: string;
  location: string;
  rating: number;
  reviewCount: number;
  responseTime: string;
  yearsActive: number;
  certifications: string[];
}

export interface Supplier {
  id: string;
  productName: string;
  supplierName: string;
  rating: number;
  distance: number;
  matchScore: number;
  image: string;
  images: string[];
  isRecommended: boolean;
  isCertified?: boolean;
  matchGaps: string[];
  description: string;
  specs: ProductSpec[];
  supplier: SupplierInfo;
}

// ========================================
// LEAD / CONTACT TYPES
// ========================================
export interface ContactFormData {
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  countryCode?: string;
  phone: string;
  message: string;
}

export interface LeadSubmission {
  contact: ContactFormData;
  profile: ProfileData;
  answers: UserAnswers;
  selectedSupplierIds: string[];
  submittedAt: string;
}

export interface LeadResponse {
  success: boolean;
  leadId?: string;
  message?: string;
  redirectUrl?: string;
}

// ========================================
// CRITERIA TYPES
// ========================================
export interface CriteriaOption {
  value: string;
  label: string;
}

export interface ModifyCriteriaData {
  liftType: string;
  capacities: string[];
  voltage: string;
  zones: string[];
  options: string[];
  expandSearch: boolean;
}

// ========================================
// API RESPONSE TYPES
// ========================================
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ========================================
// FLOW STATE TYPES
// ========================================
export type FlowStep = "questionnaire" | "profile" | "selection";
export type ViewState = "selection" | "contact" | "modify-criteria" | "custom-need";

// ========================================
// STEP CONFIGURATION
// ========================================
export interface StepConfig {
  id: number;
  label: string;
}

export const FLOW_STEPS: StepConfig[] = [
  { id: 1, label: "Votre besoin" },
  { id: 2, label: "Sélection" },
  { id: 3, label: "Demande de devis" },
];

// ========================================
// DEMANDE D'INFORMATION TYPES
// ========================================
export * from './demande';
