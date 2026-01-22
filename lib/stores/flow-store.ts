import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ContactFormData, ProfileData, UserAnswers } from '@/types';

export interface FlowState {
  // État du questionnaire
  userAnswers: Record<number, string[]>;
  otherTexts: Record<number, string>;

  // État du questionnaire dynamique
  dynamicAnswers: Record<string, string[]>;

  // État du profil
  profileData: ProfileData | null;

  contactData: ContactFormData | null;

  // État de la sélection
  selectedSupplierIds: string[];

  // Timestamp de début (pour tracking)
  startTime: number | null;

  // Actions
  setUserAnswers: (answers: Record<number, string[]>) => void;
  setOtherTexts: (texts: Record<number, string>) => void;
  setAnswer: (questionId: number, answerIds: string[]) => void;
  setOtherText: (questionId: number, text: string) => void;
  setDynamicAnswer: (questionCode: string, answerCodes: string[]) => void;
  resetDynamicAnswers: () => void;
  setProfileData: (data: ProfileData) => void;
  setContactData: (data: ContactFormData) => void;
  setSelectedSupplierIds: (ids: string[]) => void;
  toggleSupplier: (supplierId: string) => void;
  setStartTime: (time: number) => void;
  reset: () => void;
}

const initialState = {
  userAnswers: {},
  otherTexts: {},
  dynamicAnswers: {},
  profileData: null,
  contactData: null,
  selectedSupplierIds: [],
  startTime: null,
};

export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUserAnswers: (answers) => set({ userAnswers: answers }),

      setOtherTexts: (texts) => set({ otherTexts: texts }),

      setAnswer: (questionId, answerIds) =>
        set((state) => ({
          userAnswers: {
            ...state.userAnswers,
            [questionId]: answerIds,
          },
        })),

      setOtherText: (questionId, text) =>
        set((state) => ({
          otherTexts: {
            ...state.otherTexts,
            [questionId]: text,
          },
        })),

      setDynamicAnswer: (questionCode, answerCodes) =>
        set((state) => ({
          dynamicAnswers: {
            ...state.dynamicAnswers,
            [questionCode]: answerCodes,
          },
        })),

      resetDynamicAnswers: () => set({ dynamicAnswers: {} }),

      setProfileData: (data) => set({ profileData: data }),

      setContactData: (data) => set({ contactData: data }),

      setSelectedSupplierIds: (ids) => set({ selectedSupplierIds: ids }),

      toggleSupplier: (supplierId) =>
        set((state) => {
          const isSelected = state.selectedSupplierIds.includes(supplierId);
          return {
            selectedSupplierIds: isSelected
              ? state.selectedSupplierIds.filter((id) => id !== supplierId)
              : [...state.selectedSupplierIds, supplierId],
          };
        }),

      setStartTime: (time) => set({ startTime: time }),

      reset: () => set(initialState),
    }),
    {
      name: 'flow-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

// Sélecteurs utilitaires
export const selectHasCompletedQuestionnaire = (state: FlowState, totalQuestions: number) =>
  Object.keys(state.userAnswers).length >= totalQuestions;

export const selectHasCompletedProfile = (state: FlowState) =>
  state.profileData !== null;

export const selectTimeSpentSeconds = (state: FlowState) =>
  state.startTime ? Math.round((Date.now() - state.startTime) / 1000) : 0;
