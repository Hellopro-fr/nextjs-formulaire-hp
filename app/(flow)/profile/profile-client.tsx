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

  // Accès au store Zustand
  const { dynamicEquivalences, setEquivalenceCaracteristique, setMatchingResults } = useFlowStore();  

  /**
   * Logique de regroupement et de nettoyage des équivalences
   */
  const processEquivalences = () => {
    const merged: Record<string, any> = {};

    // 1. Regroupement par id_caracteristique
    Object.values(dynamicEquivalences).forEach((questionArray: any) => {
      questionArray.forEach((charac: any) => {
        const id = charac.id_caracteristique;

        if (!merged[id]) {
          merged[id] = {
            ...charac,
            valeurs_cibles: Array.isArray(charac.valeurs_cibles) ? [...charac.valeurs_cibles] : charac.valeurs_cibles,
            valeurs_bloquantes: Array.isArray(charac.valeurs_bloquantes) ? [...charac.valeurs_bloquantes] : charac.valeurs_bloquantes,
          };
        } else {
          // Fusion des tableaux (si ce sont des tableaux)
          if (Array.isArray(charac.valeurs_cibles)) {
            merged[id].valeurs_cibles = [...new Set([...merged[id].valeurs_cibles, ...charac.valeurs_cibles])];
          }
          if (Array.isArray(charac.valeurs_bloquantes)) {
            merged[id].valeurs_bloquantes = [...new Set([...merged[id].valeurs_bloquantes, ...charac.valeurs_bloquantes])];
          }
        }
      });
    });

    // 2. Nettoyage : Si une valeur est cible, on l'enlève des bloquantes
    Object.keys(merged).forEach((id) => {
      const item = merged[id];
      if (Array.isArray(item.valeurs_cibles) && Array.isArray(item.valeurs_bloquantes)) {
        item.valeurs_bloquantes = item.valeurs_bloquantes.filter(
          (val: any) => !item.valeurs_cibles.includes(val)
        );
      }
    });

    return Object.values(merged);
  };

  const handleComplete = async (data: ProfileData) => {
    const cleanedEquivalences = processEquivalences();
    setEquivalenceCaracteristique(cleanedEquivalences);   

    // Show loader before navigating to selection
    setShowLoader(true);

    try {

      const response = await fetch('/api/matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: data,
          equivalences: cleanedEquivalences,
        }),
      });

      const results = await response.json();

      setMatchingResults({
        recommended: results.recommended,
        others: results.others
      });

      console.log("Equivalences nettoyées prêtes pour l'API:", cleanedEquivalences);

    } catch (error) {
      console.error("Erreur lors du traitement final:", error);
    }

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
