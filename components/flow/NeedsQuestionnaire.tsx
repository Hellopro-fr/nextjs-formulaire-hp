'use client';

import { useState, useEffect } from "react";
import ProgressHeader from "./ProgressHeader";
import QuestionScreen from "./QuestionScreen";
import { QUESTIONS } from "@/data/questions";
import { useFlowStore } from "@/lib/stores/flow-store";
import { useDynamicQuestionnaire } from "@/hooks/api/useDynamicQuestionnaire";

interface NeedsQuestionnaireProps {
  onComplete: (answers: Record<number, string[]> | Record<string, string[]>) => void;
  // Si rubriqueId est fourni, on utilise le mode dynamique (API)
  // Sinon, on utilise les questions statiques
  rubriqueId?: string;
}

const STEPS = [
  { id: 1, label: "Votre besoin" },
  { id: 2, label: "Sélection" },
  { id: 3, label: "Demande de devis" },
];

const NeedsQuestionnaire = ({ onComplete, rubriqueId }: NeedsQuestionnaireProps) => {
  // Store Zustand pour persistance dans sessionStorage
  const {
    userAnswers,
    otherTexts,
    dynamicAnswers,
    setAnswer,
    setOtherText,
    setDynamicAnswer,
    setStartTime,
    startTime,
  } = useFlowStore();

  // Mode dynamique si rubriqueId est fourni
  const isDynamicMode = !!rubriqueId;

  // Hook pour le mode dynamique
  const dynamicQuestionnaire = useDynamicQuestionnaire(rubriqueId || '');

  // State pour le mode statique
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Initialiser le timestamp de début du funnel
  useEffect(() => {
    if (!startTime) {
      setStartTime(Date.now());
    }
  }, [startTime, setStartTime]);

  // Quand le questionnaire dynamique est terminé
  useEffect(() => {
    if (isDynamicMode && dynamicQuestionnaire.isComplete) {
      onComplete(dynamicAnswers);
    }
  }, [isDynamicMode, dynamicQuestionnaire.isComplete, dynamicAnswers, onComplete]);

  // === MODE DYNAMIQUE ===
  if (isDynamicMode) {
    const {
      currentQuestion,
      currentIndex,
      isLoading,
      error,
      progress,
      submitAnswer,
      goBack,
      canGoBack,
    } = dynamicQuestionnaire;

    // Loading state
    if (isLoading) {
      return (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <ProgressHeader steps={STEPS} currentStep={1} progress={0} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Chargement des questions...</p>
            </div>
          </div>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <ProgressHeader steps={STEPS} currentStep={1} progress={0} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <p className="text-destructive">Erreur lors du chargement des questions</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      );
    }

    // No question available
    if (!currentQuestion) {
      return (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <ProgressHeader steps={STEPS} currentStep={1} progress={0} />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Aucune question disponible</p>
          </div>
        </div>
      );
    }

    // Calculate progress for step 1 (0-33%)
    const questionProgress = progress.percent * 0.33;

    const handleDynamicSelectAnswer = (answerCode: string) => {
      const questionCode = currentQuestion.code || `Q${currentIndex + 1}`;
      const currentAnswers = dynamicAnswers[questionCode] || [];

      if (currentQuestion.type === 'multi') {
        // Toggle selection for multi-select
        if (currentAnswers.includes(answerCode)) {
          setDynamicAnswer(questionCode, currentAnswers.filter((code) => code !== answerCode));
        } else {
          setDynamicAnswer(questionCode, [...currentAnswers, answerCode]);
        }
      } else {
        // Single select - submit and advance
        submitAnswer([answerCode]);
      }
    };

    const handleDynamicNext = () => {
      const questionCode = currentQuestion.code || `Q${currentIndex + 1}`;
      const currentAnswers = dynamicAnswers[questionCode] || [];
      if (currentAnswers.length > 0) {
        submitAnswer(currentAnswers);
      }
    };

    // Adapter la question dynamique au format QuestionScreen
    const adaptedQuestion = {
      id: currentQuestion.id || currentIndex + 1,
      title: currentQuestion.title,
      justification: currentQuestion.justification,
      multiSelect: currentQuestion.type === 'multi',
      answers: currentQuestion.answers?.map((a: { code: string; mainText: string; secondaryText?: string }) => ({
        id: a.code,
        mainText: a.mainText,
        secondaryText: a.secondaryText,
      })) || [],
    };

    const questionCode = currentQuestion.code || `Q${currentIndex + 1}`;

    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <ProgressHeader
          steps={STEPS}
          currentStep={1}
          progress={questionProgress}
        />

        <div className="flex-1 overflow-y-auto">
          <QuestionScreen
            question={adaptedQuestion}
            currentIndex={currentIndex}
            totalQuestions={progress.total}
            selectedAnswers={dynamicAnswers[questionCode] || []}
            otherText=""
            onSelectAnswer={handleDynamicSelectAnswer}
            onOtherTextChange={() => {}}
            onNext={handleDynamicNext}
            onBack={goBack}
            isFirst={!canGoBack}
            isLast={currentIndex === progress.total - 1}
          />
        </div>
      </div>
    );
  }

  // === MODE STATIQUE (comportement original) ===
  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const totalQuestions = QUESTIONS.length;

  const handleSelectAnswer = (answerId: string, autoAdvance?: boolean) => {
    const currentAnswers = userAnswers[currentQuestion.id] || [];

    if (currentQuestion.multiSelect) {
      // Toggle selection for multi-select
      if (currentAnswers.includes(answerId)) {
        setAnswer(currentQuestion.id, currentAnswers.filter((id) => id !== answerId));
      } else {
        setAnswer(currentQuestion.id, [...currentAnswers, answerId]);
      }
    } else {
      // Single select - replace and auto-advance
      setAnswer(currentQuestion.id, [answerId]);

      // Auto-advance after a short delay for visual feedback
      if (autoAdvance) {
        setTimeout(() => {
          handleNext();
        }, 300);
      }
    }
  };

  const handleOtherTextChange = (text: string) => {
    setOtherText(currentQuestion.id, text);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // All questions answered, proceed to selection
      onComplete(userAnswers);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Calculate progress: each question is a portion of step 1 (0-33%)
  const questionProgress = ((currentQuestionIndex + 1) / totalQuestions) * 33;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <ProgressHeader
        steps={STEPS}
        currentStep={1}
        progress={questionProgress}
      />

      <div className="flex-1 overflow-y-auto">
        <QuestionScreen
          question={currentQuestion}
          currentIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          selectedAnswers={userAnswers[currentQuestion.id] || []}
          otherText={otherTexts[currentQuestion.id] || ""}
          onSelectAnswer={handleSelectAnswer}
          onOtherTextChange={handleOtherTextChange}
          onNext={handleNext}
          onBack={handleBack}
          isFirst={currentQuestionIndex === 0}
          isLast={currentQuestionIndex === totalQuestions - 1}
        />
      </div>
    </div>
  );
};

export default NeedsQuestionnaire;
