import { useState } from 'react';
import { useFlowStore } from '@/lib/stores/flow-store';
import { consolidateEquivalences } from '@/lib/utils/equivalence-merger';
import { normalizeMatchingToSuppliers, enrichSuppliersWithProductInfo } from '@/lib/utils/matching-normalizer';
import type { ProfileData } from '@/types';
import type { MatchingResponse, ProductInfoResponse } from '@/types/matching';

import { basePath } from '@/lib/utils';

/**
 * Récupère les informations produits depuis l'API
 */
async function fetchProductInfo(
  productIds: string[],
  categoryId: number | null,
  apiBase: string
): Promise<ProductInfoResponse | null> {
  if (productIds.length === 0) return null;

  try {
    const res = await fetch(`${apiBase}/api/produits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_categorie: categoryId?.toString() || '',
        id_produits: productIds,
      }),
    });

    if (!res.ok) {
      console.error('Failed to fetch product info:', res.status);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching product info:', error);
    return null;
  }
}

// Toujours utiliser le proxy Next.js pour éviter les problèmes CORS
const getApiBasePath = () => {
  return basePath || '';
};

const type_typologie = {
  "pro_france": "1",
  "pro_foreign": "2",
  "particulier": "3",
  "creation": "4",
};

export function useProcessMatchingLogic() {
  const [showLoader, setShowLoader] = useState(false);
  const {
    categoryId,
    profileData,
    dynamicEquivalences,
    characteristicsMap,
    setEquivalenceCaracteristique,
    setMatchingResults
  } = useFlowStore();

  /**
   * Logique de consolidation des équivalences :
   * 1. Collecter toutes les équivalences avec poids_question
   * 2. Regrouper par id_caracteristique
   * 3. Poids final : critique > secondaire, puis poids_question le plus élevé
   * 4. Fusionner valeurs cibles / bloquantes
   */
  const processEquivalences = () => {
    return consolidateEquivalences(dynamicEquivalences);
  };

  /**
   * Action principale de soumission
   */
  const submitProfile = async (data: ProfileData) => {
    const consolidatedEquivalences = processEquivalences();
    setEquivalenceCaracteristique(consolidatedEquivalences);

    setShowLoader(true);

    try {

      const typologie = data?.type;
      const typologieValue = type_typologie[typologie as keyof typeof type_typologie] || "1";

      const metadonnee_utilisateurs = {
          "pays":  data?.country || '',
          "typologie": typologieValue
      } ;

      const formData = new FormData();
      formData.append('id_categorie', categoryId?.toString() || '');
      formData.append('top_k', '12');
      formData.append('metadonnee_utilisateurs', JSON.stringify(metadonnee_utilisateurs));
      formData.append('liste_caracteristique', JSON.stringify(consolidatedEquivalences));

      const apiBase = getApiBasePath();
      const apiUrl = `${apiBase}/api/matching`;
      
      const res = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to fetch matching');

      const apiData: MatchingResponse = await res.json();

      // Normaliser les données de matching vers le format Supplier
      const { recommended, others } = normalizeMatchingToSuppliers(
        apiData.liste_produit,
        characteristicsMap,
        consolidatedEquivalences
      );

      // ==========================================================================
      // TODO: SUPPRIMER CE BLOC DE TEST - Début du mode test avec IDs fixes
      // ==========================================================================
      const TEST_MODE = true; // TODO: Mettre à false pour la production

      let finalRecommended = recommended;
      let finalOthers = others;

      if (TEST_MODE) {
        // TODO: Supprimer - Créer des suppliers de test avec les IDs 97 et 98
        const testSuppliers = [
          {
            id: '97',
            productName: 'Produit 97',
            supplierName: 'Fournisseur Test',
            image: '/images/product-placeholder.jpg',
            images: ['/images/product-placeholder.jpg'],
            description: '',
            matchScore: 88,
            matchGaps: [],
            specs: [],
            isRecommended: true,
            rating: 0,
            distance: 0,
            supplier: { name: '', description: '', location: '', responseTime: '' }
          },
          {
            id: '98',
            productName: 'Produit 98',
            supplierName: 'Fournisseur Test',
            image: '/images/product-placeholder.jpg',
            images: ['/images/product-placeholder.jpg'],
            description: '',
            matchScore: 75,
            matchGaps: [],
            specs: [],
            isRecommended: true,
            rating: 0,
            distance: 0,
            supplier: { name: '', description: '', location: '', responseTime: '' }
          },
        ];
        finalRecommended = testSuppliers as typeof recommended;
        finalOthers = [];
      }
      // ==========================================================================
      // TODO: SUPPRIMER CE BLOC DE TEST - Fin du mode test
      // ==========================================================================

      // Stocker les résultats initiaux (avec placeholders)
      setMatchingResults({ recommended: finalRecommended, others: finalOthers });

      // Enrichir les recommandés avec les infos produit (prioritaire)
      const recommendedIds = finalRecommended.map((s) => s.id);
      if (recommendedIds.length > 0) {
        const productInfo = await fetchProductInfo(recommendedIds, categoryId, apiBase);
        if (productInfo?.items) {
          const enrichedRecommended = enrichSuppliersWithProductInfo(finalRecommended, productInfo.items);
          setMatchingResults({ recommended: enrichedRecommended, others: finalOthers });

          // Ensuite enrichir les "others" en background
          const othersIds = finalOthers.map((s) => s.id);
          if (othersIds.length > 0) {
            fetchProductInfo(othersIds, categoryId, apiBase).then((othersInfo) => {
              if (othersInfo?.items) {
                const enrichedOthers = enrichSuppliersWithProductInfo(finalOthers, othersInfo.items);
                setMatchingResults({ recommended: enrichedRecommended, others: enrichedOthers });
              }
            });
          }
        }
      }

    } catch (error) {
      console.error('Matching process error:', error);
    }
  
  };

  return {
    showLoader,
    submitProfile,
  };
}
