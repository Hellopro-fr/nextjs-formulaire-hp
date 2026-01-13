"use client";

import { useRouter } from 'next/navigation';
import SupplierSelectionModal from '@/components/flow/SupplierSelectionModal';
import { useFlowStore } from '@/lib/stores/flow-store';

export default function SelectionClient() {
  const router = useRouter();
  const { userAnswers } = useFlowStore();

  const handleBackToQuestionnaire = () => {
    router.push('/questionnaire');
  };

  const handleClose = () => {
    router.push('/');
  };

  return (
    <SupplierSelectionModal
      userAnswers={userAnswers}
      onBackToQuestionnaire={handleBackToQuestionnaire}
      onClose={handleClose}
    />
  );
}
