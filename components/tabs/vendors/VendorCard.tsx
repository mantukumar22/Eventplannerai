/**
 * @file components/tabs/vendors/VendorCard.tsx
 * @description Single vendor card with booking toggle, quote comparison criteria, and key questions.
 */

import React from 'react';
import { HelpCircle, Scale, ChevronDown, ChevronUp } from 'lucide-react';
import { type VendorItem } from '@/lib/schemas';

interface VendorCardProps {
  vendor: VendorItem;
  isExpanded: boolean;
  onToggleBooked: (id: string) => void;
  onToggleExpand: (id: string) => void;
}

export const VendorCard: React.FC<VendorCardProps> = ({
  vendor,
  isExpanded,
  onToggleBooked,
  onToggleExpand,
}) => {
  return (
    <div
      className={`rounded-3xl royal-glass border transition-all ${
        vendor.booked
          ? 'border-emerald-500/30 bg-emerald-950/10'
          : 'border-[var(--royal)]/30 hover:border-[var(--royal-light)] shadow-lg'
      }`}
    >
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <input
            type="checkbox"
            id={`booked-${vendor.id}`}
            checked={vendor.booked}
            onChange={() => onToggleBooked(vendor.id)}
            className="w-5 h-5 mt-1 rounded text-[var(--cyan)] border-[var(--royal)]/40 bg-[var(--surface)] focus:ring-[var(--cyan)] cursor-pointer"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor={`booked-${vendor.id}`}
                className={`font-bold text-base cursor-pointer ${
                  vendor.booked ? 'line-through text-[var(--muted)]' : 'text-white'
                }`}
              >
                {vendor.category}
              </label>
              {vendor.booked && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Booked & Confirmed
                </span>
              )}
            </div>
            <div className="text-xs text-[var(--gold)] font-semibold mt-1">
              Estimated Cost: {vendor.estimatedCostRange}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            type="button"
            onClick={() => onToggleExpand(vendor.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--surface-2)] text-xs font-semibold text-[var(--cyan)] border border-[var(--royal)]/40 hover:border-[var(--cyan)] transition-colors cursor-pointer"
            aria-expanded={isExpanded}
            aria-controls={`vendor-details-${vendor.id}`}
          >
            <span>{isExpanded ? 'Hide Details' : 'View Criteria & Questions'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div
          id={`vendor-details-${vendor.id}`}
          className="px-6 pb-6 pt-2 border-t border-[var(--royal)]/20 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Questions to ask */}
          <div className="p-4 rounded-2xl bg-[var(--surface-2)]/70 border border-[var(--gold)]/30">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] flex items-center gap-1.5 mb-2.5">
              <HelpCircle className="w-4 h-4 text-[var(--gold)]" aria-hidden="true" />
              <span>Essential Questions to Ask</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-[var(--text)] list-disc list-inside">
              {vendor.questionsToAsk.map((q, i) => (
                <li key={i} className="leading-relaxed">
                  {q}
                </li>
              ))}
            </ul>
          </div>

          {/* Comparison Criteria */}
          <div className="p-4 rounded-2xl bg-[var(--surface-2)]/70 border border-[var(--cyan)]/30">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--cyan)] flex items-center gap-1.5 mb-2.5">
              <Scale className="w-4 h-4 text-[var(--cyan)]" aria-hidden="true" />
              <span>What to Compare in Quotes</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-[var(--text)] list-disc list-inside">
              {vendor.comparisonCriteria.map((c, i) => (
                <li key={i} className="leading-relaxed">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
