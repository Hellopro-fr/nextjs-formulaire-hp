"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProfileTypeStep from '@/components/flow/ProfileTypeStep';
import MatchingLoader from '@/components/flow/MatchingLoader';
import type { ProfileData } from '@/types';

interface ProfileClientProps {
  priorityCountries: string[];
  otherCountries: string[];
}

export default function ProfileClient({
  priorityCountries,
  otherCountries,
}: ProfileClientProps) {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);

  const handleComplete = (data: ProfileData) => {
    // Show loader before navigating to selection
    setShowLoader(true);
  };

  const handleLoaderComplete = () => {
    // Navigate to selection step after loader finishes
    router.push('/selection');
  };

  const handleBack = () => {
    router.push('/questionnaire');
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
