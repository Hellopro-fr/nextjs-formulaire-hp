import { createHmac } from 'crypto';

// =============================================================================
// CONFIGURATION
// =============================================================================

const TOKEN_SECRET = process.env.CATEGORY_TOKEN_SECRET || 'dev-secret-change-in-production';
const TOKEN_VALIDITY_DAYS = 2; // Aujourd'hui + hier (tolérance minuit)

// =============================================================================
// TYPES
// =============================================================================

interface TokenPayload {
  c: number;    // id_categorie
  d: string;    // date (YYYY-MM-DD)
  n: string;    // nonce (unicité)
}

interface TokenValidationResult {
  valid: boolean;
  categoryId?: number;
  error?: 'invalid_format' | 'invalid_signature' | 'expired' | 'invalid_payload';
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Génère un nonce aléatoire pour l'unicité des tokens
 */
function generateNonce(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Encode en Base64 URL-safe (sans padding)
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Décode depuis Base64 URL-safe
 */
function base64UrlDecode(str: string): string {
  // Restaurer les caractères Base64 standard
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

  // Ajouter le padding si nécessaire
  const padding = base64.length % 4;
  if (padding) {
    base64 += '='.repeat(4 - padding);
  }

  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Génère une signature HMAC-SHA256
 */
function sign(payload: string): string {
  return createHmac('sha256', TOKEN_SECRET)
    .update(payload)
    .digest('hex')
    .substring(0, 16); // Tronquer pour des URLs plus courtes
}

/**
 * Obtient la date du jour au format YYYY-MM-DD
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Vérifie si une date est valide (aujourd'hui ou hier)
 */
function isDateValid(dateStr: string): boolean {
  const tokenDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 1); // Fin de journée

  return tokenDate >= yesterday && tokenDate < maxDate;
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Génère un token sécurisé pour une catégorie
 *
 * @param categoryId - L'ID de la catégorie à encoder
 * @returns Le token URL-safe
 *
 * @example
 * const token = generateCategoryToken(123);
 * // → "eyJjIjoxMjMsImQiOiIyMDI1LTAxLTIzIiwibiI6ImFiYzEyMyJ9.a1b2c3d4"
 */
export function generateCategoryToken(categoryId: number): string {
  const payload: TokenPayload = {
    c: categoryId,
    d: getTodayDate(),
    n: generateNonce(),
  };

  const payloadStr = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(payloadStr);
  const signature = sign(payloadStr);

  return `${encodedPayload}.${signature}`;
}

/**
 * Valide un token et extrait l'ID de catégorie
 *
 * @param token - Le token à valider
 * @returns Résultat de validation avec categoryId si valide
 *
 * @example
 * const result = validateCategoryToken("eyJjIjoxMjMsImQiOiIyMDI1LTAxLTIzIiwibiI6ImFiYzEyMyJ9.a1b2c3d4");
 * if (result.valid) {
 *   console.log(result.categoryId); // 123
 * }
 */
export function validateCategoryToken(token: string): TokenValidationResult {
  // Vérifier le format (payload.signature)
  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'invalid_format' };
  }

  const [encodedPayload, providedSignature] = parts;

  // Décoder le payload
  let payloadStr: string;
  let payload: TokenPayload;

  try {
    payloadStr = base64UrlDecode(encodedPayload);
    payload = JSON.parse(payloadStr);
  } catch {
    return { valid: false, error: 'invalid_payload' };
  }

  // Vérifier la signature
  const expectedSignature = sign(payloadStr);
  if (providedSignature !== expectedSignature) {
    return { valid: false, error: 'invalid_signature' };
  }

  // Vérifier la validité de la date (aujourd'hui ou hier)
  if (!isDateValid(payload.d)) {
    return { valid: false, error: 'expired' };
  }

  // Vérifier que categoryId est un nombre valide
  if (typeof payload.c !== 'number' || payload.c <= 0) {
    return { valid: false, error: 'invalid_payload' };
  }

  return {
    valid: true,
    categoryId: payload.c,
  };
}

/**
 * Extrait l'ID de catégorie d'un token sans validation complète
 * Utile pour le logging/debug uniquement
 */
export function extractCategoryIdUnsafe(token: string): number | null {
  try {
    const [encodedPayload] = token.split('.');
    const payloadStr = base64UrlDecode(encodedPayload);
    const payload: TokenPayload = JSON.parse(payloadStr);
    return payload.c;
  } catch {
    return null;
  }
}
