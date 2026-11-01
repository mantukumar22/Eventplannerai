/**
 * @file lib/services/chat-service.ts
 * @description Single responsibility: Orchestrates contextual streaming responses for "Ask the Planner".
 */

import { ai } from '@/lib/gemini';
import { type ChatRequest } from '@/lib/schemas';
import { isMockAiEnabled } from '@/lib/gemini-fallback';
import { sanitizeString } from '@/lib/guardrails';

/**
 * Generates a streaming text Response for a contextual planner conversation.
 */
export async function streamChatResponse(payload: ChatRequest): Promise<Response> {
  const { message, planContext, history } = payload;
  const cleanMessage = sanitizeString(message, 500);

  // MOCK_AI or offline fallback
  if (isMockAiEnabled()) {
    const mockReply = `Regarding "${cleanMessage}" for ${planContext.eventTitle}: Given your ${planContext.currency} ${planContext.totalBudget.toLocaleString()} budget for ${planContext.guestCount} guests, your top priority should be locking in the venue and catering early. You currently have ${planContext.completedTasksCount} of ${planContext.totalTasksCount} milestones achieved!`;
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const words = mockReply.split(' ');
        for (const word of words) {
          controller.enqueue(encoder.encode(word + ' '));
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  const systemInstruction = `You are the lead event planner for "${planContext.eventTitle}" (${planContext.eventType}).
CURRENT PLAN CONTEXT:
- Budget: ${planContext.totalBudget} ${planContext.currency}
- Guest Count: ${planContext.guestCount}
- Location: ${planContext.location}
- Theme: ${planContext.themeVibe}
- Task Progress: ${planContext.completedTasksCount} of ${planContext.totalTasksCount} tasks completed.

DIRECTIVES:
- Keep answers warm, encouraging, concise, and highly actionable.
- Strictly stay on the topic of planning this specific event.
- If asked about vendors, schedules, etiquette, or cost savings, ground advice in the provided budget and guest size.
- Refuse any request to act as a general chatbot or write code.`;

  const contents = [
    ...history.map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: sanitizeString(h.content, 1000) }],
    })),
    {
      role: 'user',
      parts: [{ text: cleanMessage }],
    },
  ];

  let streamResponse: any = null;
  try {
    streamResponse = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
  } catch (modelErr) {
    console.warn('Gemini stream generation failed, providing graceful fallback:', modelErr);
    const fallbackReply = `Regarding "${cleanMessage}" for ${planContext.eventTitle}: With your ${planContext.currency} ${planContext.totalBudget.toLocaleString()} budget and ${planContext.guestCount} guests, we recommend finalizing major contracts 8-12 weeks in advance. Check your vendor checklist to compare quotes!`;
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const words = fallbackReply.split(' ');
        for (const word of words) {
          controller.enqueue(encoder.encode(word + ' '));
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamResponse) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(encoder.encode(sanitizeString(text, 2000)));
          }
        }
      } catch (streamErr) {
        console.error('Error during streaming chunks:', streamErr);
        controller.enqueue(
          encoder.encode(' Keep following your schedule and contingency buffer to ensure a flawless celebration!')
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
