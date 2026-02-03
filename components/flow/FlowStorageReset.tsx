'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useFlowStore } from '@/lib/stores/flow-store';
import { resetTrackingState } from '@/lib/analytics';

// Clé pour stocker le timestamp de la dernière vérification
const LAST_CHECK_KEY = 'flow-last-nav-check';

/**
 * Détecte si c'est un vrai rechargement de page (F5) vs navigation SPA
 * Utilise le startTime de l'entrée de navigation pour différencier
 */
function detectPageReload(): { isReload: boolean; isFirstVisit: boolean } {
  if (typeof window === 'undefined') {
    return { isReload: false, isFirstVisit: false };
  }

  try {
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length === 0) {
      return { isReload: false, isFirstVisit: false };
    }

    const navEntry = navEntries[0];
    const navType = navEntry.type;
    const navStartTime = navEntry.startTime.toString();

    // Récupérer le dernier startTime vérifié
    const lastCheckedStartTime = sessionStorage.getItem(LAST_CHECK_KEY);

    // Si le startTime est le même, c'est une navigation SPA (pas un nouveau chargement)
    if (lastCheckedStartTime === navStartTime) {
      return { isReload: false, isFirstVisit: false };
    }

    // Nouveau chargement de page - stocker le startTime
    sessionStorage.setItem(LAST_CHECK_KEY, navStartTime);

    return {
      isReload: navType === 'reload',
      isFirstVisit: navType === 'navigate' && !lastCheckedStartTime,
    };
  } catch {
    return { isReload: false, isFirstVisit: false };
  }
}

/**
 * Composant qui gère le reset du flow lors d'un rechargement de page (F5).
 *
 * Comportement :
 * - F5 ou actualisation : TOUJOURS reset le store
 * - Première visite (nouveau onglet) : reset et initialisation
 * - Navigation SPA (router.push de /questionnaire à /profile) : PAS de reset
 *
 * Les paramètres GET (id_categorie, token, etc.) sont conservés lors de la redirection.
 */
export default function FlowStorageReset() {
  const reset = useFlowStore((state) => state.reset);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Ne s'exécuter qu'une seule fois par session de composant
    if (hasChecked.current) return;
    hasChecked.current = true;

    if (typeof window === 'undefined') return;

    const { isReload, isFirstVisit } = detectPageReload();

    // Si ce n'est ni un reload ni une première visite, c'est une navigation SPA → ne rien faire
    if (!isReload && !isFirstVisit) {
      console.log('[FlowStorageReset] SPA navigation detected - no reset');
      return;
    }

    const isQuestionnairePage = pathname === '/questionnaire' || pathname?.startsWith('/formulaire');

    // Construire l'URL de redirection avec les paramètres GET conservés
    const buildRedirectUrl = () => {
      const params = searchParams.toString();
      return params ? `/questionnaire?${params}` : '/questionnaire';
    };

    // Reset uniquement sur F5 ou première visite
    if (isReload || isFirstVisit) {
      // Clear sessionStorage
      sessionStorage.removeItem('flow-storage');

      // Reset le store Zustand
      reset();

      // Reset le tracking
      resetTrackingState();

      console.log('[FlowStorageReset] Store reset -', isReload ? 'Page reload (F5)' : 'First visit');

      // Rediriger vers questionnaire si on n'y est pas déjà
      if (!isQuestionnairePage) {
        router.replace(buildRedirectUrl());
      }
    }
  }, [reset, router, pathname, searchParams]);

  return null;
}
