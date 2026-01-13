"use client";

import { useRouter } from 'next/navigation';
import NeedsQuestionnaire from '@/components/flow/NeedsQuestionnaire';

export default function QuestionnaireClient() {
  const router = useRouter();

  const handleComplete = (answers: Record<number, string[]>) => {
    // Navigate to profile step
    router.push('/profile');
  };

  const handleClose = () => {
    router.push('/');
  };

  return (
    <NeedsQuestionnaire
      onComplete={handleComplete}
      onClose={handleClose}
    />
  );
}
