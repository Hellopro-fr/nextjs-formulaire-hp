"use client";

import { useEffect, useRef } from 'react';
import GeoZoneStep from '@/components/flow/GeoZoneStep';
import { useFlowStore } from '@/lib/stores/flow-store';
import { useFlowNavigation } from '@/hooks/useFlowNavigation';
import type { GeoData } from '@/lib/stores/flow-store';

export default function GeoZoneClient() {
  const { setGeoData } = useFlowStore();
  const { goToQuestionnaire, goToProfile, goToSelection } = useFlowNavigation();
  const hasTrackedView = useRef(false);

  // Track page view au montage
  useEffect(() => {
    if (!hasTrackedView.current) {
      hasTrackedView.current = true;
      // Track geo-zone page view if needed
    }
  }, []);

  const handleComplete = (data: GeoData) => {
    // Sauvegarder les données dans le store
    setGeoData(data);
    // Aller vers le profil
    // goToProfile();
    goToSelection();
  };

  const handleBack = () => {
    // Retourner au questionnaire
    goToQuestionnaire();
  };

  return (
    <GeoZoneStep
      onComplete={handleComplete}
      onBack={handleBack}
    />
  );
}
