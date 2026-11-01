'use client';

/**
 * @file components/ChatPlanner.tsx
 * @description Floating "Ask the Planner" interactive assistant grounded in the user's specific event plan.
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { type EventPlan } from '@/lib/schemas';
import { CrownIcon } from '@/components/CrownIcon';
import { ChatMessageBubble, type ChatMessage } from '@/components/chat/ChatMessageBubble';
import { SuggestedPrompts } from '@/components/chat/SuggestedPrompts';

interface ChatPlannerProps {
  plan: EventPlan;
}

const SAMPLE_QUESTIONS = [
  'How can I shave 10% off catering?',
  'What should I confirm 2 weeks before?',
  'Any DIY decor suggestions for this theme?',
] as const;

export function ChatPlanner({ plan }: ChatPlannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your dedicated EventCraft AI assistant for "${plan.intake.eventTitle}". Ask me anything about tailoring your budget, scheduling vendors, or negotiating quotes!`,
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageIdRef = useRef(1);

  const completedCount = plan.timeline.tasks.filter((t) => t.completed).length;

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string): Promise<void> => {
    const text = (textToSend ?? input).trim();
    if (!text || isStreaming) return;

    messageIdRef.current += 1;
    const userMsgId = `user-${messageIdRef.current}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    messageIdRef.current += 1;
    const assistantMsgId = `assistant-${messageIdRef.current}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantMsgId, role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch('/api/plan/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          planContext: {
            eventType: plan.intake.eventType,
            eventTitle: plan.intake.eventTitle,
            totalBudget: plan.budget.totalBudget,
            currency: plan.budget.currency,
            guestCount: plan.intake.guestCount,
            location: plan.intake.location,
            themeVibe: plan.intake.themeVibe,
            completedTasksCount: completedCount,
            totalTasksCount: plan.timeline.tasks.length,
          },
          history: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to get streaming response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: msg.content + chunk } : msg
            )
          );
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  'I apologize, but I ran into a connection issue. Please try asking again in a moment.',
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 print:hidden">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="btn-cyan px-5 py-3 text-xs sm:text-sm font-extrabold flex items-center gap-2.5 shadow-2xl cursor-pointer"
          aria-label="Open Ask the Planner chat assistant"
        >
          <CrownIcon size={18} className="text-[#04121A]" />
          <span>Ask the Planner</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#04121A] animate-pulse" />
        </button>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-labelledby="chat-planner-title"
          aria-modal="false"
          className="w-[90vw] sm:w-[420px] h-[540px] max-h-[82vh] royal-glass rounded-3xl shadow-2xl border border-[var(--gold)]/40 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="bg-[var(--surface-2)] p-4 flex items-center justify-between border-b border-[var(--royal)]/25">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--surface)] border border-[var(--gold)]/40 text-[var(--gold)] flex items-center justify-center">
                <CrownIcon size={18} className="text-[var(--gold)]" />
              </div>
              <div>
                <h3 id="chat-planner-title" className="text-sm font-display font-bold text-white">
                  Ask the Planner
                </h3>
                <p className="text-[11px] text-[var(--muted)] font-medium">
                  Grounded in your {plan.intake.eventType} plan
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-[var(--muted)] hover:text-white hover:bg-[var(--surface)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--gold)] cursor-pointer"
              aria-label="Close chat window"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Messages scroll area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[var(--surface)]/60 text-xs sm:text-sm">
            {messages.map((msg) => (
              <ChatMessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          <SuggestedPrompts
            questions={SAMPLE_QUESTIONS}
            disabled={isStreaming}
            onSelect={handleSendMessage}
          />

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSendMessage();
            }}
            className="p-3 bg-[var(--surface-2)] border-t border-[var(--royal)]/25 flex items-center gap-2"
          >
            <label htmlFor="chat-input-field" className="sr-only">
              Ask your event planner a question
            </label>
            <input
              id="chat-input-field"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about budget, timeline, vendors..."
              disabled={isStreaming}
              className="flex-1 px-3.5 py-2 rounded-xl border border-[var(--royal)]/40 text-xs sm:text-sm text-white bg-[var(--surface)] placeholder-[var(--muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40 focus:border-[var(--gold)]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="p-2 rounded-xl bg-[var(--cyan)] hover:bg-[#55EEFF] disabled:opacity-50 text-[#04121A] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--cyan)] cursor-pointer shadow-sm"
              aria-label="Send question"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
