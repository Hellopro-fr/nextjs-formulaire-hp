import { useQuery, useMutation } from '@tanstack/react-query';
import {
  searchCompanyBySiret,
  selectCompany,
  type SiretSearchParams,
  type SelectCompanyParams,
  type SiretCompanyData,
} from '@/lib/api/services/siret.service';

/**
 * Hook pour rechercher une entreprise par SIRET
 * Ne lance la recherche que si les paramètres sont valides
 */
export function useSiretSearch(params: SiretSearchParams, enabled = true) {
  return useQuery({
    queryKey: ['siret', 'search', params.companyName, params.postalCode],
    queryFn: async () => {
      const response = await searchCompanyBySiret(params);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled:
      enabled &&
      !!params.companyName &&
      params.companyName.trim().length > 0 &&
      !!params.postalCode &&
      /^[0-9]{5}$/.test(params.postalCode.trim()),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook pour sélectionner une entreprise dans les résultats
 */
export function useSelectCompany() {
  return useMutation({
    mutationFn: async (params: SelectCompanyParams) => {
      const response = await selectCompany(params);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });
}

/**
 * Hook combiné pour la gestion complète du SIRET
 * Retourne les fonctions de recherche et sélection
 */
export function useSiretManagement() {
  return {
    useSearch: useSiretSearch,
    useSelect: useSelectCompany,
  };
}
