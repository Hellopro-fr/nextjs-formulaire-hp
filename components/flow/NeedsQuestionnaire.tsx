"use client";

import { useState, useMemo, useEffect } from "react";
import ProgressHeader from "./ProgressHeader";
import QuestionScreen from "./QuestionScreen";
import { QUESTIONS } from "@/data/questions";
import { useFlowStore } from "@/lib/stores/flow-store";

// Analytics imports
import { trackFunnelStart, trackQuestionAnswered, trackQuestionNavigation, trackQuestionnaireComplete } from "@/lib/analytics/gtm";
import { trackGA4QuestionAnswered, trackGA4QuestionnaireComplete } from "@/lib/analytics/ga4";
import { tagHotjarUser, HOTJAR_TAGS } from "@/lib/analytics/hotjar";

interface NeedsQuestionnaireProps {
  onComplete: (answers: Record<number, string[]>) => void;
  onClose?: () => void;
}

const STEPS = [
  { id: 1, label: "Votre besoin" },
  { id: 2, label: "Sélection" },
  { id: 3, label: "Demande de devis" },
];

// Base number of products - decreases as user answers questions
const BASE_PRODUCT_COUNT = 347;

const NeedsQuestionnaire = ({ onComplete, onClose }: NeedsQuestionnaireProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [otherTexts, setOtherTexts] = useState<Record<number, string>>({});

  // Get flow store actions
  const { setUserAnswers, setOtherTexts: storeOtherTexts, setStartTime, startTime } = useFlowStore();

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const totalQuestions = QUESTIONS.length;

  // Track funnel start on mount
  useEffect(() => {
    if (!startTime) {
      setStartTime(Date.now());
      trackFunnelStart(1);
      tagHotjarUser(HOTJAR_TAGS.STARTED_FUNNEL);
    }
  }, [startTime, setStartTime]);

  // Calculate matching products based on answered questions
  const matchingProductCount = useMemo(() => {
    const answeredCount = Object.keys(answers).length;
    // Decrease by ~15-25% per question answered, with some randomness for realism
    const reductions = [0, 0.18, 0.32, 0.45, 0.56, 0.65, 0.72];
    const reduction = reductions[Math.min(answeredCount, reductions.length - 1)];
    return Math.max(12, Math.round(BASE_PRODUCT_COUNT * (1 - reduction)));
  }, [answers]);

  const handleSelectAnswer = (answerId: string, autoAdvance?: boolean) => {
    const currentAnswers = answers[currentQuestion.id] || [];

    if (currentQuestion.multiSelect) {
      // Toggle selection for multi-select
      if (currentAnswers.includes(answerId)) {
        setAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: currentAnswers.filter((id) => id !== answerId),
        }));
      } else {
        const newAnswers = [...currentAnswers, answerId];
        setAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: newAnswers,
        }));

        // Track answer
        trackQuestionAnswered(currentQuestion.id, currentQuestion.title, newAnswers, true);
        trackGA4QuestionAnswered(currentQuestion.id, newAnswers.length);
      }
    } else {
      // Single select - replace and auto-advance
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: [answerId],
      }));

      // Track answer
      trackQuestionAnswered(currentQuestion.id, currentQuestion.title, [answerId], false);
      trackGA4QuestionAnswered(currentQuestion.id, 1);

      // Auto-advance after a short delay for visual feedback
      if (autoAdvance) {
        setTimeout(() => {
          handleNext();
        }, 300);
      }
    }
  };

  const handleOtherTextChange = (text: string) => {
    setOtherTexts((prev) => ({
      ...prev,
      [currentQuestion.id]: text,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      trackQuestionNavigation(currentQuestionIndex, currentQuestionIndex + 1, 'next');
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // All questions answered, proceed to selection
      const timeSpent = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

      // Track completion
      trackQuestionnaireComplete(totalQuestions, timeSpent);
      trackGA4QuestionnaireComplete(totalQuestions, timeSpent);
      tagHotjarUser(HOTJAR_TAGS.COMPLETED_QUESTIONNAIRE);

      // Save to store
      setUserAnswers(answers);
      storeOtherTexts(otherTexts);

      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      trackQuestionNavigation(currentQuestionIndex, currentQuestionIndex - 1, 'back');
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
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto">
        <QuestionScreen
          question={currentQuestion}
          currentIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          selectedAnswers={answers[currentQuestion.id] || []}
          otherText={otherTexts[currentQuestion.id] || ""}
          onSelectAnswer={handleSelectAnswer}
          onOtherTextChange={handleOtherTextChange}
          onNext={handleNext}
          onBack={handleBack}
          isFirst={currentQuestionIndex === 0}
          isLast={currentQuestionIndex === totalQuestions - 1}
          matchingProductCount={matchingProductCount}
        />
      </div>
    </div>
  );
};

export default NeedsQuestionnaire;
