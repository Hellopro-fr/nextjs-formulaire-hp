"use client";

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFlowStore } from '@/lib/stores/flow-store';

export function useDynamicQuestionnaire(rubriqueId: string) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { dynamicAnswers, setDynamicAnswer, resetDynamicAnswers } = useFlowStore();

  // Appel A : Charger Q1
  const {
    data: entryData,
    isLoading: isLoadingEntry,
    error: entryError
  } = useQuery({
    queryKey: ['questionnaire', 'q1', rubriqueId],
    queryFn: async () => {
      const res = await fetch(`/api/questionnaire/q1?rubrique_id=${rubriqueId}`);
      if (!res.ok) throw new Error('Failed to fetch Q1');
      return res.json();
    },
    enabled: !!rubriqueId,
  });

  // Réponse Q1 de l'utilisateur
  const q1AnswerCode = dynamicAnswers?.['Q1']?.[0];

  // Appel B : Charger le parcours (seulement après réponse Q1)
  const {
    data: pathData,
    isLoading: isLoadingPath,
    error: pathError
  } = useQuery({
    queryKey: ['questionnaire', 'qn', rubriqueId, q1AnswerCode],
    queryFn: async () => {
      const res = await fetch(`/api/questionnaire/qn?rubrique_id=${rubriqueId}&q1_answer=${q1AnswerCode}`);
      if (!res.ok) throw new Error('Failed to fetch path questions');
      return res.json();
    },
    enabled: !!q1AnswerCode && !!rubriqueId,
  });

  // Question courante
  const currentQuestion = useMemo(() => {
    if (currentIndex === 0) {
      return entryData?.entryQuestion || null;
    }
    if (!pathData?.questions) return null;
    return pathData.questions[currentIndex - 1] || null;
  }, [entryData, pathData, currentIndex]);

  // Progression
  const progress = useMemo(() => {
    if (!pathData || currentIndex === 0) {
      return { current: 1, total: 1, percent: 0 };
    }
    const total = 1 + (pathData.totalQuestions || pathData.questions?.length || 0);
    const current = currentIndex + 1;
    return { current, total, percent: Math.round((current / total) * 100) };
  }, [pathData, currentIndex]);

  // Soumettre réponse
  const submitAnswer = (answerCodes: string[]) => {
    if (!currentQuestion) return;
    const questionCode = currentQuestion.code || `Q${currentIndex + 1}`;
    setDynamicAnswer(questionCode, answerCodes);
    setCurrentIndex(prev => prev + 1);
  };

  // Retour arrière
  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Fin du questionnaire
  const isComplete = useMemo(() => {
    if (!pathData || currentIndex === 0) return false;
    const totalInPath = pathData.totalQuestions || pathData.questions?.length || 0;
    return currentIndex > totalInPath;
  }, [pathData, currentIndex]);

  // Reset
  const reset = () => {
    resetDynamicAnswers();
    setCurrentIndex(0);
  };

  return {
    // État
    currentQuestion,
    currentIndex,
    isLoading: isLoadingEntry || (!!q1AnswerCode && isLoadingPath),
    error: entryError || pathError,

    // Progression
    progress,

    // Parcours
    pathId: pathData?.pathId || null,
    pathName: pathData?.pathName || null,

    // Actions
    submitAnswer,
    goBack,
    reset,

    // Flags
    canGoBack: currentIndex > 0,
    isComplete,
    isEntryQuestion: currentIndex === 0,
  };
}
