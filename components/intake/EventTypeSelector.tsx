/**
 * @file components/intake/EventTypeSelector.tsx
 * @description Single responsibility: Accessible radio group for selecting wedding, birthday, or community event format.
 */

import React from 'react';
import { type EventType } from '@/lib/schemas';

interface EventTypeSelectorProps {
  selectedType: EventType;
  onChange: (type: EventType) => void;
}

const EVENT_TYPE_OPTIONS: readonly {
  type: EventType;
  label: string;
  desc: string;
}[] = [
  { type: 'wedding', label: 'Wedding', desc: 'Ceremonies, reception & vows' },
  { type: 'birthday', label: 'Birthday', desc: 'Milestone, kids, or adult gala' },
  { type: 'community', label: 'Community', desc: 'Permits, sponsors & volunteers' },
] as const;

export const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({
  selectedType,
  onChange,
}) => {
  return (
    <div>
      <fieldset>
        <legend className="text-sm font-bold text-white mb-3">
          Select Event Type <span className="text-[var(--cyan)]" aria-hidden="true">*</span>
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {EVENT_TYPE_OPTIONS.map(({ type, label, desc }) => {
            const isSelected = selectedType === type;
            return (
              <label
                key={type}
                className={`relative flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[var(--cyan)] bg-[var(--royal)]/25 ring-2 ring-[var(--cyan)]/40 shadow-lg shadow-[var(--cyan)]/10'
                    : 'border-[var(--royal)]/30 bg-[var(--surface-2)]/60 hover:border-[var(--royal-light)] hover:bg-[var(--surface-2)]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display font-bold text-base text-white">{label}</span>
                  <input
                    type="radio"
                    name="eventType"
                    value={type}
                    checked={isSelected}
                    onChange={() => onChange(type)}
                    className="w-4 h-4 text-[var(--cyan)] focus:ring-[var(--cyan)] bg-[var(--surface)] border-[var(--royal)]/40"
                  />
                </div>
                <p className="text-xs text-[var(--muted)]">{desc}</p>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
};
