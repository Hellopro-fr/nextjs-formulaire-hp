"use client";

import { useEffect, useRef } from 'react';
import SupplierSelectionModal from '@/components/flow/SupplierSelectionModal';
import { useFlowStore } from '@/lib/stores/flow-store';
import { useFlowNavigation } from '@/hooks/useFlowNavigation';
import { trackSelectionPageView } from '@/lib/analytics';

export default function SelectionClient() {
  const { userAnswers } = useFlowStore();
  const { goToQuestionnaire } = useFlowNavigation();
  const hasTrackedView = useRef(false);

  // Track selection page view au montage
  useEffect(() => {
    if (!hasTrackedView.current) {
      hasTrackedView.current = true;
      // Valeurs par défaut - seront mises à jour par le composant si nécessaire
      trackSelectionPageView(4, 12); // 4 recommandés, 12 total
    }
  }, []);

  const handleBackToQuestionnaire = () => {
    // Navigate back to questionnaire (with GET params preserved)
    goToQuestionnaire();
  };

  return (
    <SupplierSelectionModal
      userAnswers={userAnswers}
      onBackToQuestionnaire={handleBackToQuestionnaire}
    />
  );
}
