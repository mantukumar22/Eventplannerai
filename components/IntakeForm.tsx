'use client';

/**
 * @file components/IntakeForm.tsx
 * @description Guided event intake form with event-specific intelligence,
 * bot defense (honeypot field), and WCAG 2.2 AA accessible error focus.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2, HeartHandshake, ShieldAlert } from 'lucide-react';
import {
  type IntakeFormData,
  IntakeFormSchema,
  type EventType,
} from '@/lib/schemas';
import { CrownIcon } from '@/components/CrownIcon';
import { ErrorSummary } from '@/components/intake/ErrorSummary';
import { EventTypeSelector } from '@/components/intake/EventTypeSelector';
import { EventBasicsFields } from '@/components/intake/EventBasicsFields';
import { EventSpecificFields } from '@/components/intake/EventSpecificFields';
import { ConstraintsFields } from '@/components/intake/ConstraintsFields';

interface IntakeFormProps {
  initialData?: IntakeFormData;
  onSubmit: (data: IntakeFormData) => void;
  isLoading: boolean;
}

const DEFAULT_FORM_DATA: IntakeFormData = {
  eventType: 'wedding',
  eventTitle: '',
  eventDate: '',
  guestCount: 100,
  totalBudget: 20000,
  currency: 'USD',
  location: '',
  themeVibe: '',
  culturalTraditions: '',
  mustHaves: '',
  dietaryRestrictions: '',
  accessibilityNeeds: '',
  venueSetting: 'indoor',
  isMultiDay: false,
  weddingCeremonies: '',
  birthdayAgeGroup: 'adults',
  celebrantAge: 30,
  communityFocus: ['permits', 'volunteers', 'accessibility'],
  honeypot: '',
};

type CommunityFocusItem = 'permits' | 'volunteers' | 'sponsors' | 'insurance' | 'accessibility';

export function IntakeForm({ initialData, onSubmit, isLoading }: IntakeFormProps) {
  const mountTimeRef = useRef<number>(0);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mountTimeRef.current = Date.now();
  }, []);

  const [formData, setFormData] = useState<IntakeFormData>(
    initialData ?? DEFAULT_FORM_DATA
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [botBlocked, setBotBlocked] = useState<boolean>(false);

  const handleChange = (field: keyof IntakeFormData, value: unknown): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleEventTypeChange = (type: EventType): void => {
    handleChange('eventType', type);
  };

  const handleCommunityFocusToggle = (focusItem: CommunityFocusItem): void => {
    const current = (formData.communityFocus ?? []) as CommunityFocusItem[];
    const exists = current.includes(focusItem);
    const updated = exists ? current.filter((item) => item !== focusItem) : [...current, focusItem];
    handleChange('communityFocus', updated);
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    // Bot honeypot defense
    if (formData.honeypot && formData.honeypot.trim().length > 0) {
      setBotBlocked(true);
      return;
    }

    const result = IntakeFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0] as string;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      setErrors(fieldErrors);

      // Focus error summary for screen readers & keyboard users
      setTimeout(() => {
        errorSummaryRef.current?.focus();
      }, 50);
      return;
    }

    setErrors({});
    setBotBlocked(false);
    onSubmit(result.data);
  };

  return (
    <form
      id="intake-form"
      onSubmit={handleSubmit}
      noValidate
      className="royal-glass rounded-3xl shadow-2xl p-6 sm:p-10 border border-[var(--royal)]/40 text-[var(--text)]"
      aria-labelledby="intake-form-heading"
    >
      {/* Bot Blocked Notice */}
      {botBlocked && (
        <div
          role="alert"
          className="p-4 mb-6 rounded-2xl border border-rose-500/80 bg-rose-950/60 text-rose-200 flex items-center gap-3"
        >
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <p className="text-xs font-semibold">
            Automated submission detected. Please take a moment to review your event vision and try again.
          </p>
        </div>
      )}

      {/* Accessible Error Summary */}
      <ErrorSummary errors={errors} summaryRef={errorSummaryRef} />

      {/* Form Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--royal)]/30 border border-[var(--gold)]/40 text-[var(--gold)] text-xs font-semibold mb-3">
          <CrownIcon size={14} className="text-[var(--gold)]" />
          <span>Step 1 of 2: Event Blueprint</span>
        </div>
        <h2 id="intake-form-heading" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Event Vision & Specifications
        </h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          Tell EventCraft AI about your celebration. We adapt budgets, timelines, and checklists specifically to your format.
        </p>
      </div>

      {/* Honeypot field for bot prevention */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website-honeypot">Leave blank</label>
        <input
          type="text"
          id="website-honeypot"
          name="honeypot"
          value={formData.honeypot ?? ''}
          onChange={(e) => handleChange('honeypot', e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="space-y-8">
        {/* Event Type Format Selector */}
        <EventTypeSelector
          selectedType={formData.eventType}
          onChange={handleEventTypeChange}
        />

        {/* Dynamic Event-Specific Intelligence */}
        <EventSpecificFields
          formData={formData}
          onChange={handleChange}
          onCommunityFocusToggle={handleCommunityFocusToggle}
        />

        {/* Core Event Parameters (Title, Date, Headcount, Budget, Location, Setting, Theme) */}
        <EventBasicsFields
          formData={formData}
          errors={errors}
          onChange={handleChange}
        />

        {/* Cultural & Constraint Details */}
        <ConstraintsFields
          formData={formData}
          onChange={handleChange}
        />
      </div>

      {/* Privacy Notice */}
      <div className="mt-8 pt-4 border-t border-[var(--royal)]/25 flex items-start gap-3 text-xs text-[var(--muted)] bg-[var(--surface-2)]/50 p-4 rounded-2xl border border-[var(--royal)]/20">
        <HeartHandshake className="w-4 h-4 text-[var(--gold)] shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          <strong className="text-white">Privacy Notice:</strong> We only use your event parameters to craft your custom plan and never sell or share your data. All calculations and personalizations are processed securely.
        </p>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-[var(--muted)] font-medium">
          <span className="text-[var(--cyan)] font-bold">*</span> Required fields
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-cyan w-full sm:w-auto px-9 py-4 text-sm font-extrabold flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#04121A]" aria-hidden="true" />
              <span>Generating Bespoke Plan...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#04121A]" aria-hidden="true" />
              <span>Craft Complete Event Plan</span>
            </>
          )}
        </button>
      </div>

      {/* Live Region for Screen Readers */}
      <div className="sr-only" aria-live="polite">
        {isLoading ? 'Generating your personalized event plan with AI, please wait.' : ''}
      </div>
    </form>
  );
}
