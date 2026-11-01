/**
 * @file components/intake/EventBasicsFields.tsx
 * @description Accessible input controls for core event parameters: Title, Date, Guest Count, Budget, Location, Theme, and Venue.
 */

import React from 'react';
import { Users, MapPin, Sparkles } from 'lucide-react';
import { type IntakeFormData, type CurrencyCode, type VenueSetting } from '@/lib/schemas';
import { CURRENCY_SYMBOLS } from '@/lib/constants';

interface EventBasicsFieldsProps {
  formData: IntakeFormData;
  errors: Record<string, string>;
  onChange: (field: keyof IntakeFormData, value: unknown) => void;
}

export const EventBasicsFields: React.FC<EventBasicsFieldsProps> = ({
  formData,
  errors,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Event Title & Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="eventTitle" className="block text-sm font-bold text-white mb-1.5">
            Event Title <span className="text-[var(--cyan)]" aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            id="eventTitle"
            name="eventTitle"
            value={formData.eventTitle}
            onChange={(e) => onChange('eventTitle', e.target.value)}
            placeholder="e.g. Maya & Alex’s Royal Celebration"
            aria-describedby={errors.eventTitle ? 'eventTitle-error' : 'eventTitle-help'}
            aria-invalid={Boolean(errors.eventTitle)}
            className={`w-full px-4 py-3 rounded-xl border text-sm text-white bg-[var(--surface-2)]/80 placeholder-[var(--muted)]/50 transition-all focus:outline-none focus:ring-2 ${
              errors.eventTitle
                ? 'border-rose-500 focus:ring-rose-500 bg-rose-950/20'
                : 'border-[var(--royal)]/40 focus:border-[var(--gold)] focus:ring-[var(--gold)]/30'
            }`}
          />
          {errors.eventTitle ? (
            <p id="eventTitle-error" className="text-xs text-rose-400 mt-1.5 font-semibold" role="alert">
              {errors.eventTitle}
            </p>
          ) : (
            <p id="eventTitle-help" className="text-xs text-[var(--muted)] mt-1.5">
              Give your event a memorable title.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="eventDate" className="block text-sm font-bold text-white mb-1.5">
            Target Event Date <span className="text-[var(--cyan)]" aria-hidden="true">*</span>
          </label>
          <input
            type="date"
            id="eventDate"
            name="eventDate"
            value={formData.eventDate}
            onChange={(e) => onChange('eventDate', e.target.value)}
            aria-describedby={errors.eventDate ? 'eventDate-error' : 'eventDate-help'}
            aria-invalid={Boolean(errors.eventDate)}
            className={`w-full px-4 py-3 rounded-xl border text-sm text-white bg-[var(--surface-2)]/80 transition-all focus:outline-none focus:ring-2 ${
              errors.eventDate
                ? 'border-rose-500 focus:ring-rose-500 bg-rose-950/20'
                : 'border-[var(--royal)]/40 focus:border-[var(--gold)] focus:ring-[var(--gold)]/30'
            }`}
          />
          {errors.eventDate ? (
            <p id="eventDate-error" className="text-xs text-rose-400 mt-1.5 font-semibold" role="alert">
              {errors.eventDate}
            </p>
          ) : (
            <p id="eventDate-help" className="text-xs text-[var(--muted)] mt-1.5">
              Used to calculate timeline countdown intervals.
            </p>
          )}
        </div>
      </div>

      {/* Guests, Budget & Currency */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label htmlFor="guestCount" className="block text-sm font-bold text-white mb-1.5">
            Guest Count <span className="text-[var(--cyan)]" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              id="guestCount"
              name="guestCount"
              min="5"
              max="10000"
              value={formData.guestCount || ''}
              onChange={(e) => onChange('guestCount', parseInt(e.target.value, 10) || 0)}
              aria-describedby={errors.guestCount ? 'guestCount-error' : 'guestCount-help'}
              aria-invalid={Boolean(errors.guestCount)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-white bg-[var(--surface-2)]/80 transition-all focus:outline-none focus:ring-2 ${
                errors.guestCount
                  ? 'border-rose-500 focus:ring-rose-500'
                  : 'border-[var(--royal)]/40 focus:border-[var(--gold)] focus:ring-[var(--gold)]/30'
              }`}
            />
            <Users
              className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-3.5 pointer-events-none"
              aria-hidden="true"
            />
          </div>
          {errors.guestCount ? (
            <p id="guestCount-error" className="text-xs text-rose-400 mt-1.5 font-semibold" role="alert">
              {errors.guestCount}
            </p>
          ) : (
            <p id="guestCount-help" className="text-xs text-[var(--muted)] mt-1.5">
              Total estimated attendees.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="totalBudget" className="block text-sm font-bold text-white mb-1.5">
            Total Budget <span className="text-[var(--cyan)]" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <span
              className="absolute left-3.5 top-3.5 text-sm font-black text-[var(--gold)] pointer-events-none"
              aria-hidden="true"
            >
              {CURRENCY_SYMBOLS[formData.currency]}
            </span>
            <input
              type="number"
              id="totalBudget"
              name="totalBudget"
              min="100"
              max="10000000"
              step="100"
              value={formData.totalBudget || ''}
              onChange={(e) => onChange('totalBudget', parseInt(e.target.value, 10) || 0)}
              aria-describedby={errors.totalBudget ? 'totalBudget-error' : 'totalBudget-help'}
              aria-invalid={Boolean(errors.totalBudget)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-white bg-[var(--surface-2)]/80 transition-all focus:outline-none focus:ring-2 ${
                errors.totalBudget
                  ? 'border-rose-500 focus:ring-rose-500'
                  : 'border-[var(--royal)]/40 focus:border-[var(--gold)] focus:ring-[var(--gold)]/30'
              }`}
            />
          </div>
          {errors.totalBudget ? (
            <p id="totalBudget-error" className="text-xs text-rose-400 mt-1.5 font-semibold" role="alert">
              {errors.totalBudget}
            </p>
          ) : (
            <p id="totalBudget-help" className="text-xs text-[var(--muted)] mt-1.5">
              Allocated across all event categories.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-bold text-white mb-1.5">
            Currency <span className="text-[var(--cyan)]" aria-hidden="true">*</span>
          </label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={(e) => onChange('currency', e.target.value as CurrencyCode)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--royal)]/40 text-sm text-white bg-[var(--surface-2)]/80 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)] cursor-pointer"
          >
            <option value="USD" className="bg-[#140B24] text-white">USD ($) - US Dollar</option>
            <option value="EUR" className="bg-[#140B24] text-white">EUR (€) - Euro</option>
            <option value="GBP" className="bg-[#140B24] text-white">GBP (£) - British Pound</option>
            <option value="CAD" className="bg-[#140B24] text-white">CAD ($) - Canadian Dollar</option>
            <option value="AUD" className="bg-[#140B24] text-white">AUD ($) - Australian Dollar</option>
            <option value="INR" className="bg-[#140B24] text-white">INR (₹) - Indian Rupee</option>
          </select>
        </div>
      </div>

      {/* Location & Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="location" className="block text-sm font-bold text-white mb-1.5">
            Location / City <span className="text-[var(--cyan)]" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={(e) => onChange('location', e.target.value)}
              placeholder="e.g. Austin, TX or London, UK"
              aria-describedby={errors.location ? 'location-error' : 'location-help'}
              aria-invalid={Boolean(errors.location)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-white bg-[var(--surface-2)]/80 placeholder-[var(--muted)]/50 transition-all focus:outline-none focus:ring-2 ${
                errors.location
                  ? 'border-rose-500 focus:ring-rose-500'
                  : 'border-[var(--royal)]/40 focus:border-[var(--gold)] focus:ring-[var(--gold)]/30'
              }`}
            />
            <MapPin
              className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-3.5 pointer-events-none"
              aria-hidden="true"
            />
          </div>
          {errors.location ? (
            <p id="location-error" className="text-xs text-rose-400 mt-1.5 font-semibold" role="alert">
              {errors.location}
            </p>
          ) : (
            <p id="location-help" className="text-xs text-[var(--muted)] mt-1.5">
              City, region, or destination for localized pricing.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="themeVibe" className="block text-sm font-bold text-white mb-1.5">
            Theme or Aesthetic Vibe <span className="text-[var(--cyan)]" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="themeVibe"
              name="themeVibe"
              value={formData.themeVibe}
              onChange={(e) => onChange('themeVibe', e.target.value)}
              placeholder="e.g. Dark Royal Gen Z, Moody Botanical, Neon Chic"
              aria-describedby={errors.themeVibe ? 'themeVibe-error' : 'themeVibe-help'}
              aria-invalid={Boolean(errors.themeVibe)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-white bg-[var(--surface-2)]/80 placeholder-[var(--muted)]/50 transition-all focus:outline-none focus:ring-2 ${
                errors.themeVibe
                  ? 'border-rose-500 focus:ring-rose-500'
                  : 'border-[var(--royal)]/40 focus:border-[var(--gold)] focus:ring-[var(--gold)]/30'
              }`}
            />
            <Sparkles
              className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-3.5 pointer-events-none"
              aria-hidden="true"
            />
          </div>
          {errors.themeVibe ? (
            <p id="themeVibe-error" className="text-xs text-rose-400 mt-1.5 font-semibold" role="alert">
              {errors.themeVibe}
            </p>
          ) : (
            <p id="themeVibe-help" className="text-xs text-[var(--muted)] mt-1.5">
              Guiding concept for decor, music, and lighting.
            </p>
          )}
        </div>
      </div>

      {/* Venue Setting */}
      <div>
        <fieldset>
          <legend className="text-sm font-bold text-white mb-3">
            Venue Setting <span className="text-[var(--cyan)]" aria-hidden="true">*</span>
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { setting: 'indoor' as const, label: 'Indoor', sub: 'Ballroom, loft, hall' },
              { setting: 'outdoor' as const, label: 'Outdoor', sub: 'Garden, beach, rooftop' },
              { setting: 'hybrid' as const, label: 'Hybrid / Both', sub: 'Indoor reception + outdoor vows' },
            ].map(({ setting, label, sub }) => (
              <label
                key={setting}
                className={`flex flex-col p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  formData.venueSetting === setting
                    ? 'border-[var(--gold)] bg-[var(--royal)]/25 ring-1 ring-[var(--gold)]/40'
                    : 'border-[var(--royal)]/30 bg-[var(--surface-2)]/60 hover:border-[var(--royal-light)]'
                }`}
              >
                <input
                  type="radio"
                  name="venueSetting"
                  value={setting}
                  checked={formData.venueSetting === setting}
                  onChange={() => onChange('venueSetting', setting as VenueSetting)}
                  className="sr-only"
                />
                <span className="font-bold text-sm text-white">{label}</span>
                <span className="text-[11px] text-[var(--muted)] mt-0.5">{sub}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
};
