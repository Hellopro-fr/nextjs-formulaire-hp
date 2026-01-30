import { useState } from 'react';
import { useFlowStore } from '@/lib/stores/flow-store';
import type { ProfileData } from '@/types';
import { fetchSuppliers } from '@/lib/api/services/suppliers.service';
import { useQuery } from '@tanstack/react-query';

import { basePath } from '@/lib/utils';

// Toujours utiliser le proxy Next.js pour éviter les problèmes CORS
const getApiBasePath = () => {
  return basePath || '';
};

function normalizeSupplier(SupplierData: any) {
  return {};
}

export function useProcessMatchingLogic() {
  const [showLoader, setShowLoader] = useState(false);
  const {
    categoryId,
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

    return useQuery({
      queryKey: ['suppliers'],
      queryFn: async () => {
        

        const metadonnee_utilisateurs = {
            "pays": "France",
            "typologie": "1"
        } ;

        const formData = new FormData();
        formData.append('id_categorie', categoryId?.toString() || '');
        formData.append('top_k', '12');
        formData.append('metadonnee_utilisateurs', JSON.stringify(metadonnee_utilisateurs));
        formData.append('liste_caracteristique', JSON.stringify(cleanedEquivalences));

        const apiBase = getApiBasePath();
        const apiUrl = `${apiBase}/api/matching`;
        
        const res = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Failed to fetch Q1');

        let apiData = await res.json();
        apiData = apiData.response;

        const dataReturn = {
          entryQuestion: normalizeSupplier(apiData),
        };

        //TODO
        //setMatchingResults

        return dataReturn;
      },
    });
  
  };

  return {
    showLoader,
    submitProfile,
  };
}