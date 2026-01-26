"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NeedsQuestionnaire from '@/components/flow/NeedsQuestionnaire';
import { useFlowStore } from '@/lib/stores/flow-store';

interface QuestionnaireClientProps {
  initialCategoryId?: string;
  initialToken?: string;
}

export default function QuestionnaireClient({
  initialCategoryId,
  initialToken
}: QuestionnaireClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCategoryId } = useFlowStore();

  // Récupérer et stocker le categoryId
  // Priorité : props du Server Component > searchParams client
  useEffect(() => {
    // Props passées depuis le Server Component (middleware rewrite)
    let categoryId = initialCategoryId;

    // Fallback: searchParams côté client (pour navigation interne)
    if (!categoryId) {
      categoryId = searchParams.get('categoryId') || searchParams.get('id_categorie') || undefined;
    }

    console.log('[QuestionnaireClient] categoryId:', {
      fromServerProps: initialCategoryId,
      fromSearchParams: searchParams.get('categoryId') || searchParams.get('id_categorie'),
      final: categoryId,
    });

    if (categoryId) {
      const id = parseInt(categoryId, 10);
      if (!isNaN(id) && id > 0) {
        console.log('[QuestionnaireClient] Setting categoryId:', id);
        setCategoryId(id);
      }
    }
  }, [initialCategoryId, searchParams, setCategoryId]);

  const handleComplete = (answers: Record<number, string[]>) => {
    // Navigate to profile step
    router.push('/profile');
  };

  return (
    <NeedsQuestionnaire
      onComplete={handleComplete}
      rubriqueId={initialCategoryId}
    />
  );
}
