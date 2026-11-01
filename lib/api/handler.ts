/**
 * @file lib/api/handler.ts
 * @description Single responsibility: Reusable higher-order API Route Handler wrapper with rate-limiting,
 * Zod validation, structured AppError translation, and standardized JSON response formatting.
 */

import { NextRequest, NextResponse } from 'next/server';
import { type ZodType } from 'zod';
import { globalRateLimiter, getClientIp } from '@/lib/rate-limiter';
import { AppError, RateLimitError, ValidationError } from '@/lib/errors/app-error';
import { type ApiResponse } from '@/lib/schemas';

export interface RouteHandlerOptions<TInput, TOutput> {
  schema: ZodType<TInput>;
  handler: (validatedData: TInput, req: NextRequest) => Promise<TOutput>;
  successStatus?: number;
}

/**
 * Wraps a Next.js App Router POST Route Handler with standard rate limiting,
 * body parsing, Zod schema validation, and structured error handling.
 */
export function createApiHandler<TInput, TOutput>(
  options: RouteHandlerOptions<TInput, TOutput>
): (req: NextRequest) => Promise<NextResponse<ApiResponse<TOutput>>> {
  return async (req: NextRequest): Promise<NextResponse<ApiResponse<TOutput>>> => {
    try {
      // 1. Rate limiting
      const clientIp = getClientIp(req);
      const rateLimitCheck = globalRateLimiter.check(clientIp);

      if (!rateLimitCheck.allowed) {
        throw new RateLimitError('Rate limit exceeded. Please wait a moment.', rateLimitCheck.resetSeconds);
      }

      // 2. Parse request body
      const rawBody = await req.json().catch(() => null);
      if (rawBody === null || rawBody === undefined) {
        throw new ValidationError('Missing or invalid JSON request body.');
      }

      // 3. Validate with Zod
      const parseResult = options.schema.safeParse(rawBody);
      if (!parseResult.success) {
        const flattened = parseResult.error.flatten();
        throw new ValidationError('Validation failed for request parameters.', flattened.fieldErrors);
      }

      // 4. Execute Service Logic
      const serviceResult = await options.handler(parseResult.data, req);

      return NextResponse.json<ApiResponse<TOutput>>(
        { ok: true, data: serviceResult },
        { status: options.successStatus ?? 200 }
      );
    } catch (caughtError: unknown) {
      if (caughtError instanceof AppError) {
        const headers: Record<string, string> = {};
        if (caughtError instanceof RateLimitError) {
          headers['Retry-After'] = String(caughtError.retryAfterSeconds);
        }

        return NextResponse.json<ApiResponse<TOutput>>(
          {
            ok: false,
            error: caughtError.message,
            ...(caughtError.details !== undefined ? { details: caughtError.details } : {}),
          },
          { status: caughtError.statusCode, headers }
        );
      }

      console.error('[API Handler Uncaught Error]', caughtError);
      return NextResponse.json<ApiResponse<TOutput>>(
        {
          ok: false,
          error: 'An unexpected server error occurred. Please try again.',
        },
        { status: 500 }
      );
    }
  };
}
