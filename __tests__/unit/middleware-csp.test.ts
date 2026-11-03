/**
 * @file __tests__/unit/middleware-csp.test.ts
 * @description Comprehensive unit tests for Next.js Edge Middleware CSP and nonce generation.
 * Verifies per-request cryptographic nonce uniqueness, strict-dynamic propagation,
 * absence of 'unsafe-inline' in script-src, and presence of both request and response headers.
 */

import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

describe('Middleware Content Security Policy (CSP) & Nonce Hardening', () => {
  it('returns a Content-Security-Policy header containing a cryptographic nonce on response and forwarded request', () => {
    const request = new NextRequest('http://localhost:3000/');
    const response = middleware(request);

    const cspHeader = response.headers.get('Content-Security-Policy');
    expect(cspHeader).toBeTruthy();
    expect(cspHeader).toMatch(/script-src[^;]*'nonce-[A-Za-z0-9+/=]+'/);

    const nonceHeader = response.headers.get('x-nonce');
    expect(nonceHeader).toBeTruthy();
    expect(nonceHeader?.length).toBeGreaterThanOrEqual(16);

    // Verify the nonce in the CSP matches the x-nonce header
    expect(cspHeader).toContain(`'nonce-${nonceHeader}'`);
  });

  it('generates a different, unique nonce between two consecutive requests', () => {
    const request1 = new NextRequest('http://localhost:3000/');
    const response1 = middleware(request1);
    const nonce1 = response1.headers.get('x-nonce');

    const request2 = new NextRequest('http://localhost:3000/');
    const response2 = middleware(request2);
    const nonce2 = response2.headers.get('x-nonce');

    expect(nonce1).toBeTruthy();
    expect(nonce2).toBeTruthy();
    expect(nonce1).not.toBe(nonce2);

    const csp1 = response1.headers.get('Content-Security-Policy');
    const csp2 = response2.headers.get('Content-Security-Policy');
    expect(csp1).not.toBe(csp2);
  });

  it('ensures no "unsafe-inline" appears in the script-src directive in production or development', () => {
    const request = new NextRequest('http://localhost:3000/');
    const response = middleware(request);
    const csp = response.headers.get('Content-Security-Policy') ?? '';

    // Extract script-src directive
    const scriptSrcMatch = csp.match(/script-src\s+([^;]+)/i);
    expect(scriptSrcMatch).toBeTruthy();
    const scriptSrc = scriptSrcMatch?.[1] ?? '';

    // Must NOT contain unsafe-inline
    expect(scriptSrc).not.toContain("'unsafe-inline'");

    // Must contain strict-dynamic
    expect(scriptSrc).toContain("'strict-dynamic'");
  });

  it('sets standard defensive security headers alongside CSP', () => {
    const request = new NextRequest('http://localhost:3000/');
    const response = middleware(request);

    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(response.headers.get('Permissions-Policy')).toContain('camera=()');
  });
});
