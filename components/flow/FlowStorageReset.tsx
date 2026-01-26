'use client';

import { useEffect, useRef } from 'react';
import { useFlowStore } from '@/lib/stores/flow-store';

/**
 * Composant qui vide le store Zustand (sessionStorage) uniquement lors d'un vrai
 * rechargement de page (F5, ouverture d'un nouvel onglet, etc.).
 *
 * La navigation client-side (router.push) ne déclenche PAS de reset.
 *
 * Utilise performance.navigation.type ou PerformanceNavigationTiming pour
 * détecter le type de navigation.
 */
export default function FlowStorageReset() {
  const reset = useFlowStore((state) => state.reset);
  const hasChecked = useRef(false);

  useEffect(() => {
    // Ne s'exécuter qu'une seule fois par montage du composant
    if (hasChecked.current) return;
    hasChecked.current = true;

    if (typeof window === 'undefined') return;

    // Détecter le type de navigation
    let navigationType: string | undefined;

    // Méthode moderne: PerformanceNavigationTiming
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      navigationType = navEntries[0].type;
    }

    const hasInitialized = sessionStorage.getItem('flow-initialized') === 'true';

    if (!hasInitialized) {
      sessionStorage.removeItem('flow-storage');
      reset();
      sessionStorage.setItem('flow-initialized', 'true');
    } else if (navigationType === 'reload') {
      sessionStorage.removeItem('flow-storage');
      reset();
    }
  }, [reset]);

  return null;
}
