// ========================================
// MATCHING API TYPES
// ========================================

/**
 * Caractéristique d'un produit dans la réponse matching
 */
export interface MatchingCharacteristic {
  /** Statut du matching: 1=match, 2=partiel, 3=non-match, 4=absent */
  statut_matching: 1 | 2 | 3 | 4;
  /** ID de la caractéristique */
  id_caracteristique: number;
  /** IDs des valeurs matchées */
  id_valeur: number[];
  /** Poids de la caractéristique dans le score */
  poids: number;
}

/**
 * Produit retourné par l'API matching
 */
export interface MatchingProduct {
  /** Position dans le classement */
  rang: number;
  /** Identifiant du produit */
  id_produit: string;
  /** Score de matching (0 à 1) */
  score: number;
  /** Détails du matching par caractéristique */
  caracteristique: MatchingCharacteristic[];
  /** true si produit recommandé */
  top_produit: boolean;
}

/**
 * Réponse complète de l'API matching
 */
export interface MatchingResponse {
  /** Liste des produits matchés */
  liste_produit: MatchingProduct[];
  /** Temps de traitement en secondes */
  temps_de_traitement: number;
  /** Matchings alternatifs */
  alternative_matching: unknown[];
}

/**
 * Statuts de matching avec leur signification
 */
export const MATCHING_STATUS = {
  MATCH: 1,
  PARTIAL: 2,
  NO_MATCH: 3,
  ABSENT: 4,
} as const;

export type MatchingStatus = typeof MATCHING_STATUS[keyof typeof MATCHING_STATUS];

// =============================================================================
// PRODUCT INFO API TYPES (get_info_produit)
// =============================================================================

/**
 * Informations produit retournées par l'API get_info_produit
 */
export interface ProductInfoData {
  id_produit: string;
  titre_produit: string;
  description_produit: string;
  prix_produit: string;
  url_produit: string;
  image_produit: string;
  livraison_produit: string;
  stock_produit: string;
  categorie_produit: string;
  date_scrapping: string;
}

/**
 * Informations catégorie du produit
 */
export interface ProductCategoryInfo {
  id_categorie: string;
  nom_categorie: string | null;
}

/**
 * Informations vendeur du produit
 */
export interface ProductVendorInfo {
  domaine: string;
  etat_societe: string | null;
  id_type_contrat: string | null;
}

/**
 * Item produit complet avec produit, catégorie et vendeur
 */
export interface ProductInfoItem {
  produit: ProductInfoData;
  categorie: ProductCategoryInfo;
  vendeur: ProductVendorInfo;
}

/**
 * Réponse de l'API get_info_produit
 */
export interface ProductInfoResponse {
  items: Record<string, ProductInfoItem>;
}
