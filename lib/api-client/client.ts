/**
 * @file lib/api-client/client.ts
 * @description Single responsibility: Lightweight, strongly-typed HTTP client with configurable timeout,
 * AbortController lifecycle management, and unified error unwrapping.
 */

import { type ApiResponse } from '@/lib/schemas';
import { AppError } from '@/lib/errors/app-error';

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Executes a typed JSON POST request and unwraps the ApiResponse payload.
 */
export async function apiPost<TInput, TOutput>(
  endpoint: string,
  payload: TInput,
  options: RequestOptions = {}
): Promise<TOutput> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutTimer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutTimer);

    const jsonResult: ApiResponse<TOutput> = await response.json().catch(() => ({
      ok: false,
      error: `Invalid server response (${response.status})`,
    }));

    if (!response.ok || !jsonResult.ok) {
      const errorMessage = !jsonResult.ok ? jsonResult.error : `HTTP Error ${response.status}`;
      const details = !jsonResult.ok && 'details' in jsonResult ? jsonResult.details : undefined;
      throw new AppError(errorMessage, response.status, 'BAD_REQUEST', details);
    }

    return jsonResult.data;
  } catch (error: unknown) {
    clearTimeout(timeoutTimer);

    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new AppError(
        `Request to ${endpoint} timed out after ${Math.round(timeoutMs / 1000)} seconds.`,
        408,
        'UPSTREAM_AI_ERROR'
      );
    }

    const message = error instanceof Error ? error.message : 'Network request failed';
    throw new AppError(message, 500, 'INTERNAL_ERROR');
  }
}
