/**
 * @file components/intake/EventSpecificFields.tsx
 * @description Dynamic event-specific fields for weddings (multi-day, ceremonies),
 * birthdays (age group, celebrant age), and community events (permits, sponsors, volunteers).
 */

import React from 'react';
import { CrownIcon } from '@/components/CrownIcon';
import { Sparkles, CalendarCheck } from 'lucide-react';
import { type IntakeFormData, type BirthdayAgeGroup } from '@/lib/schemas';

interface EventSpecificFieldsProps {
  formData: IntakeFormData;
  onChange: (field: keyof IntakeFormData, value: unknown) => void;
  onCommunityFocusToggle: (
    item: 'permits' | 'volunteers' | 'sponsors' | 'insurance' | 'accessibility'
  ) => void;
}

const COMMUNITY_CHECKLIST = [
  { id: 'permits' as const, label: 'City & Park Permits' },
  { id: 'volunteers' as const, label: 'Volunteer Rostering' },
  { id: 'sponsors' as const, label: 'Sponsor Outreach' },
  { id: 'insurance' as const, label: 'Liability Insurance' },
  { id: 'accessibility' as const, label: 'ADA Accessibility' },
] as const;

const BIRTHDAY_GROUPS: readonly BirthdayAgeGroup[] = [
  'kids',
  'teens',
  'adults',
  'milestone',
] as const;

export const EventSpecificFields: React.FC<EventSpecificFieldsProps> = ({
  formData,
  onChange,
  onCommunityFocusToggle,
}) => {
  if (formData.eventType === 'wedding') {
    return (
      <div className="p-5 rounded-2xl bg-[var(--surface-2)]/70 border border-[var(--gold)]/30 space-y-4">
        <div className="flex items-center gap-2">
          <CrownIcon size={16} className="text-[var(--gold)]" />
          <h3 className="text-sm font-bold text-white">Wedding Intelligence & Ceremonies</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isMultiDay"
              checked={formData.isMultiDay ?? false}
              onChange={(e) => onChange('isMultiDay', e.target.checked)}
              className="w-4 h-4 rounded border-[var(--royal)]/40 text-[var(--cyan)] focus:ring-[var(--cyan)]"
            />
            <label htmlFor="isMultiDay" className="text-sm font-semibold text-white cursor-pointer">
              Multi-day or Weekend Event (e.g., Welcome Party, Day-After Brunch)
            </label>
          </div>

          <div>
            <label htmlFor="weddingCeremonies" className="block text-xs font-bold text-white mb-1">
              Specific Ceremonies or Traditions
            </label>
            <input
              type="text"
              id="weddingCeremonies"
              value={formData.weddingCeremonies ?? ''}
              onChange={(e) => onChange('weddingCeremonies', e.target.value)}
              placeholder="e.g. Sangeet, Tea Ceremony, Chuppah, Catholic Mass"
              className="w-full px-3 py-2 rounded-xl border border-[var(--royal)]/40 text-xs text-white bg-[var(--surface)] focus:ring-2 focus:ring-[var(--gold)]/30"
            />
          </div>
        </div>
      </div>
    );
  }

  if (formData.eventType === 'birthday') {
    return (
      <div className="p-5 rounded-2xl bg-[var(--surface-2)]/70 border border-[var(--magenta)]/30 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--magenta)]" />
          <h3 className="text-sm font-bold text-white">Birthday Age-Group & Dynamics</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="block text-xs font-bold text-white mb-1.5">Age Group</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BIRTHDAY_GROUPS.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => onChange('birthdayAgeGroup', group)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                    formData.birthdayAgeGroup === group
                      ? 'bg-[var(--cyan)] text-[#04121A] border-[var(--cyan)]'
                      : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--royal)]/30 hover:border-white'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="celebrantAge" className="block text-xs font-bold text-white mb-1">
              Celebrant Age (e.g., 1st, 18th, 21st, 30th, 50th)
            </label>
            <input
              type="number"
              id="celebrantAge"
              min="1"
              max="120"
              value={formData.celebrantAge ?? ''}
              onChange={(e) => onChange('celebrantAge', parseInt(e.target.value, 10) || undefined)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--royal)]/40 text-xs text-white bg-[var(--surface)] focus:ring-2 focus:ring-[var(--cyan)]"
            />
          </div>
        </div>
      </div>
    );
  }

  if (formData.eventType === 'community') {
    return (
      <div className="p-5 rounded-2xl bg-[var(--surface-2)]/70 border border-[var(--cyan)]/30 space-y-4">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-[var(--cyan)]" />
          <h3 className="text-sm font-bold text-white">Community Logistics & Compliance Checklist</h3>
        </div>
        <p className="text-xs text-[var(--muted)]">
          Select mandatory focus areas to embed into your timeline and vendor requests:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {COMMUNITY_CHECKLIST.map(({ id, label }) => {
            const checked = (formData.communityFocus ?? []).includes(id);
            return (
              <label
                key={id}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer font-medium transition-all ${
                  checked
                    ? 'border-[var(--cyan)] bg-[var(--cyan)]/10 text-white'
                    : 'border-[var(--royal)]/30 bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--royal-light)]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onCommunityFocusToggle(id)}
                  className="w-4 h-4 rounded text-[var(--cyan)] border-[var(--royal)]/40 focus:ring-[var(--cyan)]"
                />
                <span>{label}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};
