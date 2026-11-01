/**
 * @file components/chat/SuggestedPrompts.tsx
 * @description Quick prompt chips for common event planning questions.
 */

import React from 'react';

interface SuggestedPromptsProps {
  questions: readonly string[];
  disabled: boolean;
  onSelect: (question: string) => void;
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({
  questions,
  disabled,
  onSelect,
}) => {
  return (
    <div className="p-2.5 bg-[var(--surface-2)]/60 border-t border-[var(--royal)]/20 flex items-center gap-2 overflow-x-auto no-scrollbar text-[11px]">
      <span className="text-[var(--gold)] font-bold px-1 shrink-0">Try:</span>
      {questions.map((q, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSelect(q)}
          disabled={disabled}
          className="whitespace-nowrap px-3 py-1 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--royal)]/40 text-[var(--muted)] hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--gold)] cursor-pointer disabled:opacity-50"
        >
          {q}
        </button>
      ))}
    </div>
  );
};
