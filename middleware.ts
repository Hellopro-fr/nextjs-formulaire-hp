import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// =============================================================================
// CONFIGURATION
// =============================================================================

// Mapping des routes tokenisées vers les routes réelles
const ROUTE_MAPPING: Record<string, string> = {
  '/questionnaire': '/',                    // /questionnaire/TOKEN → / (page d'accueil avec questionnaire)
  '/selection': '/selection',               // /selection/TOKEN → /selection
  '/formulaire': '/contact-simple',         // /formulaire/TOKEN → /contact-simple
  '/something-to-add': '/selection',        // /something-to-add/TOKEN → /selection (redirection par défaut)
};

// Routes qui nécessitent un token de catégorie valide
const PROTECTED_ROUTES = Object.keys(ROUTE_MAPPING);

// URL de redirection pour les tokens invalides (page catégorie externe)
// TODO: Remplacer par l'URL de la page catégorie réelle
const INVALID_TOKEN_REDIRECT = process.env.INVALID_TOKEN_REDIRECT_URL || 'https://www.hellopro.fr/categories';

// =============================================================================
// TOKEN VALIDATION (inline pour éviter les imports dans Edge Runtime)
// =============================================================================

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4;
  if (padding) {
    base64 += '='.repeat(4 - padding);
  }
  return atob(base64);
}

function isDateValid(dateStr: string): boolean {
  const tokenDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 1);

  return tokenDate >= yesterday && tokenDate < maxDate;
}

async function validateTokenInMiddleware(
  token: string,
  secret: string
): Promise<{ valid: boolean; categoryId?: number; error?: string }> {
  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'invalid_format' };
  }

  const [encodedPayload, providedSignature] = parts;

  let payloadStr: string;
  let payload: { c: number; d: string; n: string };

  try {
    payloadStr = base64UrlDecode(encodedPayload);
    payload = JSON.parse(payloadStr);
  } catch {
    return { valid: false, error: 'invalid_payload' };
  }

  // Vérifier la signature avec Web Crypto API (disponible dans Edge Runtime)
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payloadStr)
  );

  const signatureArray = new Uint8Array(signatureBuffer);
  const expectedSignature = Array.from(signatureArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 16);

  if (providedSignature !== expectedSignature) {
    return { valid: false, error: 'invalid_signature' };
  }

  if (!isDateValid(payload.d)) {
    return { valid: false, error: 'expired' };
  }

  if (typeof payload.c !== 'number' || payload.c <= 0) {
    return { valid: false, error: 'invalid_payload' };
  }

  return { valid: true, categoryId: payload.c };
}

// =============================================================================
// MIDDLEWARE
// =============================================================================

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // TODO: SUPPRIMER AVANT MISE EN PROD - Bypass pour tests avec ?id_categorie=123
  const devCategoryId = searchParams.get('id_categorie');
  if (devCategoryId) {
    // En mode dev, réécrire vers la route réelle correspondante
    const routePrefix = '/' + pathname.split('/').filter(Boolean)[0];
    const targetRoute = ROUTE_MAPPING[routePrefix] || '/';

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = targetRoute;
    // Garder id_categorie pour que les pages puissent l'utiliser
    return NextResponse.rewrite(rewriteUrl);
  }

  // TODO: SUPPRIMER AVANT MISE EN PROD - Bypass complet en dev pour navigation interne
  // Laisser passer les requêtes RSC (React Server Components) et navigation interne
  const isRscRequest = searchParams.has('_rsc');
  const hasNoToken = pathname.split('/').filter(Boolean).length === 1; // ex: /selection sans token
  if (isRscRequest || hasNoToken) {
    return NextResponse.next();
  }

  // Vérifier si la route est protégée
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Extraire le token du path (ex: /questionnaire/abc123 → abc123)
  const pathParts = pathname.split('/').filter(Boolean);

  // Si pas de token dans l'URL, rediriger vers page catégorie
  if (pathParts.length < 2) {
    return NextResponse.redirect(INVALID_TOKEN_REDIRECT);
  }

  const token = pathParts[1];
  const secret = process.env.CATEGORY_TOKEN_SECRET || 'hellofr2k26';

  // Valider le token
  const result = await validateTokenInMiddleware(token, secret);

  if (!result.valid) {
    // Token invalide/expiré → rediriger vers page catégorie
    return NextResponse.redirect(INVALID_TOKEN_REDIRECT);
  }

  // Token valide - réécrire vers la route réelle
  const routePrefix = '/' + pathParts[0]; // ex: /questionnaire
  const targetRoute = ROUTE_MAPPING[routePrefix] || '/';

  // Créer l'URL de réécriture avec categoryId en query param
  // On clone l'URL originale et on modifie le pathname
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = targetRoute;
  rewriteUrl.searchParams.set('categoryId', String(result.categoryId));
  rewriteUrl.searchParams.set('token', token);

  // Réécrire vers la route cible (l'URL dans le navigateur ne change pas)
  return NextResponse.rewrite(rewriteUrl);
}

// =============================================================================
// MATCHER - Appliquer uniquement sur les routes protégées
// =============================================================================

export const config = {
  matcher: [
    '/questionnaire/:token*',
    '/selection/:token*',
    '/formulaire/:token*',
    '/something-to-add/:token*',
  ],
};
