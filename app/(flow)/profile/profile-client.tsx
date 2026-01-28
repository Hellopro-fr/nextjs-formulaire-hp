"use client";

import { useState } from 'react';
import ProfileTypeStep from '@/components/flow/ProfileTypeStep';
import MatchingLoader from '@/components/flow/MatchingLoader';
import { useFlowNavigation } from '@/hooks/useFlowNavigation';
import type { ProfileData } from '@/types';
import { useFlowStore } from '@/lib/stores/flow-store';

interface Country {
  id: number;
  libelle: string;
}

interface ProfileClientProps {
  priorityCountries: Country[];
  otherCountries: Country[];
}

export default function ProfileClient({
  priorityCountries,
  otherCountries,
}: ProfileClientProps) {
  const { goToSelection, goToQuestionnaire } = useFlowNavigation();
  const [showLoader, setShowLoader] = useState(false);

  const handleComplete = (data: ProfileData) => {
    // Show loader before navigating to selection
    setShowLoader(true);
  };

  const handleLoaderComplete = () => {
    // Navigate to selection step after loader finishes (with GET params preserved)
    goToSelection();
  };

  const handleBack = () => {
    // Navigate back to questionnaire (with GET params preserved)
    goToQuestionnaire();
  };

  if (showLoader) {
    return <MatchingLoader onComplete={handleLoaderComplete} duration={5000} />;
  }

  return (
    <ProfileTypeStep
      onComplete={handleComplete}
      onBack={handleBack}
      priorityCountries={priorityCountries}
      otherCountries={otherCountries}
    />
  );
}
