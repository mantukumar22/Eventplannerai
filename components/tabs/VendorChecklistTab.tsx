'use client';

/**
 * @file components/tabs/VendorChecklistTab.tsx
 * @description Interactive Vendor Checklist tab with criteria comparisons,
 * booking progress tracking, and local section feedback.
 */

import React, { useState } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import { type VendorPlan } from '@/lib/schemas';
import { useSectionRating } from '@/hooks/use-section-rating';
import { VendorTipsBanner } from './vendors/VendorTipsBanner';
import { VendorCard } from './vendors/VendorCard';

interface VendorChecklistTabProps {
  vendors: VendorPlan;
  onUpdateVendors: (updated: VendorPlan) => void;
  onOpenRegenerate: () => void;
}

export function VendorChecklistTab({
  vendors,
  onUpdateVendors,
  onOpenRegenerate,
}: VendorChecklistTabProps) {
  const items = vendors.vendors;
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(vendors.vendors.slice(0, 2).map((v) => v.id))
  );
  const [sectionRating, setSectionRating] = useSectionRating('rating_vendors');

  const bookedCount = items.filter((v) => v.booked).length;
  const totalCount = items.length;

  const handleToggleBooked = (id: string): void => {
    const updated = items.map((v) => {
      if (v.id === id) {
        return { ...v, booked: !v.booked };
      }
      return v;
    });

    onUpdateVendors({
      ...vendors,
      vendors: updated,
    });
  };

  const toggleExpand = (id: string): void => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="royal-glass rounded-3xl p-5 sm:p-6 border border-[var(--royal)]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--surface-2)] px-3 py-1 rounded-full border border-[var(--gold)]/30">
              Vendor Sourcing Roadmap
            </span>
            <span className="text-xs font-semibold text-emerald-400 bg-[var(--surface-2)] px-3 py-1 rounded-full border border-emerald-500/30">
              {bookedCount} of {totalCount} Booked
            </span>
          </div>

          <p className="mt-2.5 text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
            Interview questions and contract comparison criteria curated specifically for your event scale and vibe.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenRegenerate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--royal)]/30 text-[var(--gold)] border border-[var(--gold)]/40 text-xs font-bold transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Regenerate Vendors</span>
        </button>
      </div>

      {/* General Sourcing Tips */}
      <VendorTipsBanner tips={vendors.tips ?? []} />

      {/* Vendors List */}
      <div className="space-y-4">
        {items.map((vendor) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            isExpanded={expandedIds.has(vendor.id)}
            onToggleBooked={handleToggleBooked}
            onToggleExpand={toggleExpand}
          />
        ))}
      </div>

      {/* Was This Helpful? Local Feedback Control */}
      <div className="p-4 rounded-2xl royal-glass border border-[var(--royal)]/30 flex items-center justify-between text-xs text-[var(--muted)]">
        <span>Was this vendor checklist helpful?</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSectionRating('up')}
            className={`p-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              sectionRating === 'up'
                ? 'bg-[var(--cyan)] text-[#04121A] border-[var(--cyan)] font-bold'
                : 'bg-[var(--surface-2)] text-[var(--muted)] border-[var(--royal)]/30 hover:text-white'
            }`}
            aria-label="Thumbs up for vendor checklist section"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Yes</span>
          </button>
          <button
            type="button"
            onClick={() => setSectionRating('down')}
            className={`p-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              sectionRating === 'down'
                ? 'bg-rose-500 text-white border-rose-500 font-bold'
                : 'bg-[var(--surface-2)] text-[var(--muted)] border-[var(--royal)]/30 hover:text-white'
            }`}
            aria-label="Thumbs down for vendor checklist section"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>Needs work</span>
          </button>
        </div>
      </div>
    </div>
  );
}
