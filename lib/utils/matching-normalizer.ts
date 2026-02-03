/**
 * Normalisation des données de matching vers le format Supplier pour l'affichage
 */

import type { Supplier, ProductSpec } from '@/types';
import type { CharacteristicsMap } from '@/types/characteristics';
import type { MatchingProduct, MatchingCharacteristic, ProductInfoItem } from '@/types/matching';
import type { ConsolidatedCharacteristic } from './equivalence-merger';

// =============================================================================
// CONSTANTS
// =============================================================================

const MATCHING_STATUS_LABELS: Record<number, string> = {
  1: 'Match',
  2: 'Partiel',
  3: 'Non-match',
  4: 'Absent',
};

/** Image placeholder pour les produits sans image */
const PLACEHOLDER_IMAGE = '/images/product-placeholder.jpg';

/** Placeholder pour le nom du fournisseur */
const PLACEHOLDER_SUPPLIER = 'Fournisseur';

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Récupère le label d'une caractéristique depuis la map
 */
function getCharacteristicLabel(
  characteristicsMap: CharacteristicsMap,
  idCaracteristique: number
): string {
  const char = characteristicsMap[idCaracteristique];
  return char?.nom || `Caractéristique ${idCaracteristique}`;
}

/**
 * Récupère les labels des valeurs depuis la map
 */
function getValueLabels(
  characteristicsMap: CharacteristicsMap,
  idCaracteristique: number,
  idValeurs: number[]
): string {
  const char = characteristicsMap[idCaracteristique];
  if (!char || !char.valeurs || idValeurs.length === 0) {
    return '-';
  }

  const labels = idValeurs
    .map((idVal) => {
      const valeur = char.valeurs.find((v) => v.id === idVal);
      return valeur?.valeur;
    })
    .filter(Boolean);

  return labels.length > 0 ? labels.join(', ') : '-';
}

/**
 * Récupère la valeur cible attendue par l'utilisateur pour une caractéristique
 */
function getExpectedValue(
  characteristicsMap: CharacteristicsMap,
  equivalences: ConsolidatedCharacteristic[],
  idCaracteristique: number
): string | undefined {
  const userCriteria = equivalences.find(
    (eq) => eq.id_caracteristique === idCaracteristique
  );

  if (!userCriteria) return undefined;

  const char = characteristicsMap[idCaracteristique];

  if (userCriteria.type_caracteristique === 'textuelle') {
    // Valeurs cibles textuelles
    const cibles = userCriteria.valeurs_cibles;
    if (Array.isArray(cibles) && cibles.length > 0 && char?.valeurs) {
      const labels = cibles
        .map((id) => char.valeurs.find((v) => v.id === id)?.valeur)
        .filter(Boolean);
      return labels.join(', ');
    }
  } else {
    // Valeurs cibles numériques
    const cibles = userCriteria.valeurs_cibles;
    if (cibles && !Array.isArray(cibles)) {
      const unite = userCriteria.unite || char?.unite || '';
      if (cibles.exact !== undefined) {
        return `${cibles.exact}${unite}`;
      }
      if (cibles.min !== undefined && cibles.max !== undefined) {
        return `${cibles.min} - ${cibles.max}${unite}`;
      }
      if (cibles.min !== undefined) {
        return `>= ${cibles.min}${unite}`;
      }
      if (cibles.max !== undefined) {
        return `<= ${cibles.max}${unite}`;
      }
    }
  }

  return undefined;
}

/**
 * Construit les specs d'un produit à partir des caractéristiques de matching
 */
function buildProductSpecs(
  matchingCharacteristics: MatchingCharacteristic[],
  characteristicsMap: CharacteristicsMap,
  equivalences: ConsolidatedCharacteristic[]
): ProductSpec[] {
  return matchingCharacteristics.map((mc) => {
    const label = getCharacteristicLabel(characteristicsMap, mc.id_caracteristique);
    const value = getValueLabels(characteristicsMap, mc.id_caracteristique, mc.id_valeur);
    const matches = mc.statut_matching === 1;
    const expected = !matches
      ? getExpectedValue(characteristicsMap, equivalences, mc.id_caracteristique)
      : undefined;

    // Vérifier si cette caractéristique était demandée par l'utilisateur
    const isRequested = equivalences.some(
      (eq) => eq.id_caracteristique === mc.id_caracteristique
    );

    return {
      label,
      value,
      matches,
      expected,
      isRequested,
    };
  });
}

/**
 * Construit les matchGaps (écarts de matching) pour un produit
 */
function buildMatchGaps(
  matchingCharacteristics: MatchingCharacteristic[],
  characteristicsMap: CharacteristicsMap,
  equivalences: ConsolidatedCharacteristic[]
): string[] {
  const gaps: string[] = [];

  for (const mc of matchingCharacteristics) {
    // Ignorer les matchs parfaits
    if (mc.statut_matching === 1) continue;

    const label = getCharacteristicLabel(characteristicsMap, mc.id_caracteristique);
    const value = getValueLabels(characteristicsMap, mc.id_caracteristique, mc.id_valeur);
    const expected = getExpectedValue(characteristicsMap, equivalences, mc.id_caracteristique);

    if (mc.statut_matching === 4) {
      // Caractéristique absente
      gaps.push(`${label} : non disponible`);
    } else if (expected) {
      // Non-match ou partiel avec valeur attendue
      gaps.push(`${label} : ${value} (demandé ${expected})`);
    } else {
      // Non-match sans valeur attendue connue
      gaps.push(`${label} : ${value}`);
    }
  }

  return gaps;
}

/**
 * Normalise un produit de matching vers le format Supplier
 */
function normalizeProduct(
  product: MatchingProduct,
  characteristicsMap: CharacteristicsMap,
  equivalences: ConsolidatedCharacteristic[]
): Supplier {
  const specs = buildProductSpecs(
    product.caracteristique,
    characteristicsMap,
    equivalences
  );

  const matchGaps = buildMatchGaps(
    product.caracteristique,
    characteristicsMap,
    equivalences
  );

  return {
    id: product.id_produit,
    // Placeholders - à enrichir avec l'API Produits
    productName: `Produit ${product.id_produit}`,
    supplierName: 'Fournisseur',
    rating: 0,
    distance: 0,
    // Score de matching (0-1 → 0-100)
    matchScore: Math.round(product.score * 100),
    // Images placeholder
    image: PLACEHOLDER_IMAGE,
    images: [PLACEHOLDER_IMAGE],
    // Recommandé si top_produit
    isRecommended: product.top_produit,
    isCertified: false,
    // Specs et gaps calculés
    specs,
    matchGaps,
    // Description placeholder
    description: '',
    // Supplier placeholder
    supplier: {
      name: 'Fournisseur',
      description: '',
      location: '',
      responseTime: '',
    },
  };
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export interface NormalizedMatchingResult {
  recommended: Supplier[];
  others: Supplier[];
}

/**
 * Normalise la réponse de l'API matching vers le format attendu par l'UI
 *
 * @param products - liste_produit de la réponse matching
 * @param characteristicsMap - Map des caractéristiques (id → définition)
 * @param equivalences - Critères utilisateur consolidés (equivalenceCaracteristique du store)
 * @returns { recommended: Supplier[], others: Supplier[] }
 */
export function normalizeMatchingToSuppliers(
  products: MatchingProduct[],
  characteristicsMap: CharacteristicsMap,
  equivalences: ConsolidatedCharacteristic[]
): NormalizedMatchingResult {
  const normalized = products.map((product) =>
    normalizeProduct(product, characteristicsMap, equivalences)
  );

  // Séparer recommended (top_produit=true) et others
  const recommended = normalized.filter((s) => s.isRecommended);
  const others = normalized.filter((s) => !s.isRecommended);

  // Trier par score décroissant
  recommended.sort((a, b) => b.matchScore - a.matchScore);
  others.sort((a, b) => b.matchScore - a.matchScore);

  return { recommended, others };
}

/**
 * Enrichit les Suppliers avec les informations produit de l'API get_info_produit
 *
 * @param suppliers - Liste de Suppliers à enrichir
 * @param productInfoMap - Map des infos produit (id → ProductInfoItem)
 * @returns Suppliers enrichis
 */
export function enrichSuppliersWithProductInfo(
  suppliers: Supplier[],
  productInfoMap: Record<string, ProductInfoItem>
): Supplier[] {
  return suppliers.map((supplier) => {
    const info = productInfoMap[supplier.id];
    if (!info) return supplier;

    const { produit, vendeur } = info;

    // Extraire le nom du fournisseur depuis le domaine
    const supplierName = vendeur.domaine
      ? vendeur.domaine.replace(/^www\./, '').split('.')[0].toUpperCase()
      : PLACEHOLDER_SUPPLIER;

    // Image du produit (peut être vide)
    const image = produit.image_produit || PLACEHOLDER_IMAGE;

    return {
      ...supplier,
      productName: produit.titre_produit || supplier.productName,
      supplierName,
      description: '', // On n'utilise pas la description HTML brute
      descriptionHtml: produit.description_produit || undefined,
      image,
      images: image !== PLACEHOLDER_IMAGE ? [image] : supplier.images,
      supplier: {
        ...supplier.supplier,
        name: supplierName,
        description: '',
      },
    };
  });
}
