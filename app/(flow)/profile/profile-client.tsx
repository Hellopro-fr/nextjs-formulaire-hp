"use client";

import { useRouter } from 'next/navigation';
import ProfileTypeStep from '@/components/flow/ProfileTypeStep';
import type { ProfileData } from '@/types';

export default function ProfileClient() {
  const router = useRouter();

  const handleComplete = (data: ProfileData) => {
    // Navigate to selection step
    router.push('/selection');
  };

  const handleBack = () => {
    router.push('/questionnaire');
  };

  const handleClose = () => {
    router.push('/');
  };

  return (
    <ProfileTypeStep
      onComplete={handleComplete}
      onBack={handleBack}
      onClose={handleClose}
    />
  );
}
