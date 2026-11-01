/**
 * @file app/api/plan/chat/route.ts
 * @description Single responsibility: Thin route handler delegating streaming chat orchestration to chat-service.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { ChatRequestSchema, type ApiResponse } from '@/lib/schemas';
import { globalRateLimiter, getClientIp } from '@/lib/rate-limiter';
import { streamChatResponse } from '@/lib/services/chat-service';

export const runtime = 'nodejs';

/**
 * Handles streaming chat requests with rate limiting and schema validation.
 */
export async function POST(req: NextRequest): Promise<Response> {
  const clientIp = getClientIp(req);
  const rateLimitCheck = globalRateLimiter.check(clientIp);

  if (!rateLimitCheck.allowed) {
    return NextResponse.json<ApiResponse<never>>(
      { ok: false, error: 'Too many messages sent. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(rateLimitCheck.resetSeconds) } }
    );
  }

  const rawBody = await req.json().catch(() => null);
  const parseResult = ChatRequestSchema.safeParse(rawBody);

  if (!parseResult.success) {
    return NextResponse.json<ApiResponse<never>>(
      { ok: false, error: 'Invalid chat message format', details: parseResult.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  return streamChatResponse(parseResult.data);
}
