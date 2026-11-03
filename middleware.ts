/**
 * @file middleware.ts
 * @description Next.js Edge Middleware enforcing per-request nonce generation and strict CSP.
 * Pass both x-nonce and Content-Security-Policy to request headers so Next.js stamps its framework scripts.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest): NextResponse {
  // Generate cryptographically secure nonce using Edge-compatible Web Crypto API
  const nonce = btoa(crypto.randomUUID());

  const isDev = process.env.NODE_ENV !== 'production';

  // Build strict Content Security Policy directives
  // In dev: include 'unsafe-eval' for hot compilation. In prod: strict-dynamic with https: fallback.
  // Note: 'unsafe-inline' is NEVER included in script-src.
  const scriptSrcDirective = isDev
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:`;

  // Support embedding in AI Studio preview iframe during development/container environments,
  // while enforcing 'none' on production deployments such as Vercel.
  const frameAncestorsDirective =
    isDev || (process.env.DISABLE_HMR === 'true' && !process.env.VERCEL)
      ? "frame-ancestors 'self' *"
      : "frame-ancestors 'none'";

  const cspDirectives = [
    "default-src 'self'",
    scriptSrcDirective,
    // style-src permits 'unsafe-inline' for Next.js runtime styling and dynamic styles
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://picsum.photos https://images.unsplash.com https:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    frameAncestorsDirective,
    'upgrade-insecure-requests',
  ];

  const cspHeader = cspDirectives.join('; ');

  // Set BOTH x-nonce and Content-Security-Policy on the forwarded request headers
  // Next.js reads the nonce from request headers to stamp framework scripts
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Also set Content-Security-Policy and security headers on the HTTP response
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('x-nonce', nonce);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico|woff2)$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
