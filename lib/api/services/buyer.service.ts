import type { ApiResponse } from '../types';

// Détecte automatiquement si on peut appeler directement hellopro.fr ou utiliser un proxy
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Dev local: utilise le proxy Next.js
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '';
    }

    // Prod sur hellopro.fr ou ses sous-domaines: appel direct (pas de CORS)
    if (hostname === 'hellopro.fr' || hostname.endsWith('.hellopro.fr')) {
      return 'https://www.hellopro.fr';
    }
  }

  // Autres cas (domaine différent): utilise le proxy Next.js
  return '';
};

export interface BuyerCheckParams {
  email: string;
  rubriqueId?: string;
  urlPage?: string;
}

export interface BuyerCheckResult {
  isKnown: boolean;
  isDuplicate: boolean;
  message?: string;
}

/**
 * Vérifier si un acheteur est connu (doublon DI)
 * Compatible avec l'API Legacy: https://www.hellopro.fr/annuaire_hp/ajax/demande_information/verif_doublon_di.php
 */
export async function checkBuyerExists(
  params: BuyerCheckParams
): Promise<ApiResponse<BuyerCheckResult>> {
  try {
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!params.email || !emailRegex.test(params.email.trim())) {
      return {
        data: null,
        error: 'Email invalide',
      };
    }

    // Construction du body FormData pour l'API Legacy
    const formData = new FormData();
    formData.append('email', params.email.trim());
    if (params.rubriqueId) {
      formData.append('id_rubrique', params.rubriqueId);
    }
    if (params.urlPage) {
      formData.append('url_page', encodeURIComponent(params.urlPage));
    }

    const baseUrl = getBaseUrl();
    const apiUrl = baseUrl
      ? `${baseUrl}/annuaire_hp/ajax/demande_information/verif_doublon_di.php`
      : '/api/buyer/check'; // Proxy Next.js en dev

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.text();

    // L'API Legacy retourne '' si pas de doublon, 'notifier' si doublon
    const isDuplicate = result.trim() === 'notifier';
    const isKnown = result.trim() !== '';

    return {
      data: {
        isKnown,
        isDuplicate,
        message: isDuplicate
          ? 'Vous avez déjà effectué une demande dans cette même catégorie, elle est en cours de traitement.'
          : undefined,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error checking buyer:', error);

    // En cas d'erreur API, on considère l'acheteur comme inconnu (pas de blocage)
    return {
      data: {
        isKnown: false,
        isDuplicate: false,
      },
      error: null, // Pas d'erreur côté utilisateur, juste un log
    };
  }
}

/**
 * Récupérer les informations d'un acheteur connu
 * (si l'API Legacy fournit ces données)
 */
export interface KnownBuyerInfo {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
}

export async function getKnownBuyerInfo(
  email: string
): Promise<ApiResponse<KnownBuyerInfo>> {
  try {
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return {
        data: null,
        error: 'Email invalide',
      };
    }

    // TODO: Implémenter l'endpoint Legacy si disponible
    // Pour l'instant, l'API Legacy ne fournit pas directement les infos acheteur
    return {
      data: null,
      error: 'Endpoint non disponible dans l\'API Legacy',
    };
  } catch (error) {
    console.error('Error getting buyer info:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Erreur lors de la récupération',
    };
  }
}
