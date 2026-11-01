/**
 * @file components/chat/ChatMessageBubble.tsx
 * @description Accessible chat message bubble supporting user and AI assistant styling.
 */

import React from 'react';
import { Bot, User, Loader2 } from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-[var(--royal)]/30 text-[var(--gold)] border border-[var(--gold)]/30 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="w-3.5 h-3.5" aria-hidden="true" />
        </div>
      )}

      <div
        className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
          isUser
            ? 'bg-[var(--cyan)] text-[#04121A] font-bold rounded-tr-xs shadow-md'
            : 'bg-[var(--surface-2)]/90 border border-[var(--royal)]/30 text-[var(--text)] shadow-xs rounded-tl-xs whitespace-pre-wrap'
        }`}
      >
        {message.content || (
          <span className="flex items-center gap-1.5 text-[var(--muted)] italic">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--gold)]" aria-hidden="true" />
            Thinking...
          </span>
        )}
      </div>

      {isUser && (
        <div className="w-6 h-6 rounded-full bg-[var(--surface-2)] text-[var(--cyan)] border border-[var(--cyan)]/30 flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5" aria-hidden="true" />
        </div>
      )}
    </div>
  );
};
