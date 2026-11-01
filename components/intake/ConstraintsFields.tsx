/**
 * @file components/intake/ConstraintsFields.tsx
 * @description Accessible inputs for cultural traditions, must-haves, dietary restrictions, and accessibility needs.
 */

import React from 'react';
import { type IntakeFormData } from '@/lib/schemas';

interface ConstraintsFieldsProps {
  formData: IntakeFormData;
  onChange: (field: keyof IntakeFormData, value: unknown) => void;
}

export const ConstraintsFields: React.FC<ConstraintsFieldsProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="space-y-5">
      {/* Cultural Traditions & Must Haves */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="culturalTraditions"
            className="block text-sm font-bold text-white mb-1.5"
          >
            Cultural or Family Traditions <span className="text-xs font-normal text-[var(--muted)]">(Optional)</span>
          </label>
          <textarea
            id="culturalTraditions"
            name="culturalTraditions"
            rows={2}
            value={formData.culturalTraditions ?? ''}
            onChange={(e) => onChange('culturalTraditions', e.target.value)}
            placeholder="e.g. Sangeet evening, Polish bridal dance, tea ceremony"
            aria-describedby="culturalTraditions-help"
            className="w-full px-4 py-3 rounded-xl border border-[var(--royal)]/40 text-sm text-white bg-[var(--surface-2)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] placeholder-[var(--muted)]/50 resize-y overflow-y-auto"
          />
          <p id="culturalTraditions-help" className="text-xs text-[var(--muted)] mt-1.5">
            Customs you want woven into the schedule and decor.
          </p>
        </div>

        <div>
          <label
            htmlFor="mustHaves"
            className="block text-sm font-bold text-white mb-1.5"
          >
            Non-Negotiable Must-Haves <span className="text-xs font-normal text-[var(--muted)]">(Optional)</span>
          </label>
          <textarea
            id="mustHaves"
            name="mustHaves"
            rows={2}
            value={formData.mustHaves ?? ''}
            onChange={(e) => onChange('mustHaves', e.target.value)}
            placeholder="e.g. Live DJ, photo booth, espresso cart, late-night taco truck"
            aria-describedby="mustHaves-help"
            className="w-full px-4 py-3 rounded-xl border border-[var(--royal)]/40 text-sm text-white bg-[var(--surface-2)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] placeholder-[var(--muted)]/50 resize-y overflow-y-auto"
          />
          <p id="mustHaves-help" className="text-xs text-[var(--muted)] mt-1.5">
            Prioritized in the budget and vendor allocation.
          </p>
        </div>
      </div>

      {/* Dietary & Accessibility Constraints */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="dietaryRestrictions"
            className="block text-sm font-bold text-white mb-1.5"
          >
            Dietary Restrictions & Allergies <span className="text-xs font-normal text-[var(--muted)]">(Optional)</span>
          </label>
          <input
            type="text"
            id="dietaryRestrictions"
            name="dietaryRestrictions"
            value={formData.dietaryRestrictions ?? ''}
            onChange={(e) => onChange('dietaryRestrictions', e.target.value)}
            placeholder="e.g. Vegan, Gluten-Free, Halal, Nut-free"
            aria-describedby="dietaryRestrictions-help"
            className="w-full px-4 py-3 rounded-xl border border-[var(--royal)]/40 text-sm text-white bg-[var(--surface-2)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] placeholder-[var(--muted)]/50"
          />
          <p id="dietaryRestrictions-help" className="text-xs text-[var(--muted)] mt-1.5">
            Integrated into the custom menu and catering checklist.
          </p>
        </div>

        <div>
          <label
            htmlFor="accessibilityNeeds"
            className="block text-sm font-bold text-white mb-1.5"
          >
            Accessibility & Guest Care <span className="text-xs font-normal text-[var(--muted)]">(Optional)</span>
          </label>
          <input
            type="text"
            id="accessibilityNeeds"
            name="accessibilityNeeds"
            value={formData.accessibilityNeeds ?? ''}
            onChange={(e) => onChange('accessibilityNeeds', e.target.value)}
            placeholder="e.g. Wheelchair ramp, quiet sensory room, shaded seating"
            aria-describedby="accessibilityNeeds-help"
            className="w-full px-4 py-3 rounded-xl border border-[var(--royal)]/40 text-sm text-white bg-[var(--surface-2)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] placeholder-[var(--muted)]/50"
          />
          <p id="accessibilityNeeds-help" className="text-xs text-[var(--muted)] mt-1.5">
            Ensures inclusive venue and logistics questions.
          </p>
        </div>
      </div>
    </div>
  );
};
