"use client";

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFlowStore } from '@/lib/stores/flow-store';

// =============================================================================
// TYPES - Format API
// =============================================================================

// Format brut de l'API
interface ApiQuestion {
  id: number;
  intitule: string;
  choix: string;              // "1" = single, "2" = multi
  justification: string | null;
  id_reponse_parent: number | null;
  id_question_parent: number | null;
  reponses: ApiAnswer[];
}

interface ApiAnswer {
  id: number;
  reponse: string;
  equivalence?: unknown[];    // Format à définir plus tard
}

// Format normalisé pour le frontend
interface NormalizedQuestion {
  id: number;
  code: string;
  title: string;
  type: 'single' | 'multi';
  justification: string | null;
  answers: NormalizedAnswer[];
}

interface NormalizedAnswer {
  id: string;
  code: string;
  mainText: string;
}

// =============================================================================
// TRANSFORMERS - Convertir format API → format frontend
// =============================================================================

/**
 * Transforme une question de l'API vers le format frontend
 */
function normalizeQuestion(apiQuestion: ApiQuestion, questionIndex: number): NormalizedQuestion {
  return {
    id: apiQuestion.id,
    code: `Q${questionIndex + 1}`,
    title: apiQuestion.intitule,
    type: apiQuestion.choix === '2' ? 'multi' : 'single',
    justification: apiQuestion.justification,
    answers: apiQuestion.reponses.map((r) => ({
      id: String(r.id),
      code: String(r.id),
      mainText: r.reponse,
    })),
  };
}

// =============================================================================
// HOOK
// =============================================================================

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
      const apiData: ApiQuestion = await res.json();

      // Transformer vers le format frontend
      return {
        entryQuestion: normalizeQuestion(apiData, 0),
      };
    },
    enabled: !!rubriqueId,
  });

  // Réponse Q1 de l'utilisateur (utilise le code de la réponse = id)
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
      const apiData: ApiQuestion[] = await res.json();

      // Transformer chaque question du parcours (Q2 à Qn)
      // L'index commence à 1 car Q1 est déjà passée
      const questions = apiData.map((q, index) => normalizeQuestion(q, index + 1));

      return {
        questions,
        totalQuestions: apiData.length,
      };
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

    // Parcours (à implémenter si l'API retourne ces infos)
    // pathId: null,
    // pathName: null,

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
