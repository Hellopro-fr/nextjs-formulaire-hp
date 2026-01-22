'use client';

import { useEffect, useRef } from 'react';
import { useFlowStore } from '@/lib/stores/flow-store';

/**
 * Composant qui vide le store Zustand (sessionStorage) à chaque chargement de page.
 * Cela garantit que l'utilisateur recommence toujours un funnel vierge après un F5.
 *
 * Note: On utilise un flag pour éviter les doubles resets en StrictMode
 * et on vide le sessionStorage AVANT l'hydratation de Zustand.
 */
export default function FlowStorageReset() {
  const hasReset = useRef(false);
  const reset = useFlowStore((state) => state.reset);

  // Vider le sessionStorage immédiatement (avant hydratation Zustand)
  useEffect(() => {
    if (hasReset.current) return;
    hasReset.current = true;

    // Supprimer directement la clé du sessionStorage pour éviter la réhydratation
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('flow-storage');
    }

    // Puis reset le store Zustand
    reset();
  }, [reset]);

  return null;
}
