import { useState } from 'react';
import { useFlowStore } from '@/lib/stores/flow-store';
import type { ProfileData } from '@/types';

export function useProcessMatchingLogic() {
  const [showLoader, setShowLoader] = useState(false);
  const { 
    dynamicEquivalences, 
    setEquivalenceCaracteristique, 
    setMatchingResults 
  } = useFlowStore();

  /**
   * Logique de regroupement et de nettoyage des équivalences
   */
  const processEquivalences = () => {
    const merged: Record<string, any> = {};

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
          if (Array.isArray(charac.valeurs_cibles)) {
            merged[id].valeurs_cibles = [...new Set([...merged[id].valeurs_cibles, ...charac.valeurs_cibles])];
          }
          if (Array.isArray(charac.valeurs_bloquantes)) {
            merged[id].valeurs_bloquantes = [...new Set([...merged[id].valeurs_bloquantes, ...charac.valeurs_bloquantes])];
          }
        }
      });
    });

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

  /**
   * Action principale de soumission
   */
  const submitProfile = async (data: ProfileData) => {
    const cleanedEquivalences = processEquivalences();
    setEquivalenceCaracteristique(cleanedEquivalences); 
    
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

    } catch (error) {
      console.error("Erreur lors du matching:", error);
    }
  };

  return {
    showLoader,
    submitProfile,
  };
}