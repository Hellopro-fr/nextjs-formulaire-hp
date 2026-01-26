"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NeedsQuestionnaire from '@/components/flow/NeedsQuestionnaire';
import { useFlowStore } from '@/lib/stores/flow-store';

export default function QuestionnaireClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCategoryId } = useFlowStore();

  // Récupérer et stocker le categoryId depuis l'URL
  useEffect(() => {
    // Priorité : categoryId (depuis token) > id_categorie (mode dev)
    const categoryIdFromToken = searchParams.get('categoryId');
    const categoryIdFromDev = searchParams.get('id_categorie');
    const categoryId = categoryIdFromToken || categoryIdFromDev;

    if (categoryId) {
      const id = parseInt(categoryId, 10);
      if (!isNaN(id) && id > 0) {
        setCategoryId(id);
      }
    }
  }, [searchParams, setCategoryId]);

  const handleComplete = (answers: Record<number, string[]>) => {
    // Navigate to profile step
    router.push('/profile');
  };

  return (
    <NeedsQuestionnaire
      onComplete={handleComplete}
      rubriqueId='2007702'
    />
  );
}
