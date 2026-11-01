'use client';

/**
 * @file components/tabs/PersonalizedIdeasTab.tsx
 * @description Creative Curation & Tips tab displaying theme aesthetic vision,
 * custom menus, interactive icebreakers, and strategic money-saving hacks.
 */

import React from 'react';
import { Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import { type IdeasPlan } from '@/lib/schemas';
import { useSectionRating } from '@/hooks/use-section-rating';
import { ThemePaletteCard } from './ideas/ThemePaletteCard';
import { CustomMenuCard } from './ideas/CustomMenuCard';
import { ActivitiesCard } from './ideas/ActivitiesCard';
import { MoneySavingHacksCard } from './ideas/MoneySavingHacksCard';

interface PersonalizedIdeasTabProps {
  ideas: IdeasPlan;
  themeVibe: string;
  onOpenRegenerate: () => void;
}

export function PersonalizedIdeasTab({
  ideas,
  themeVibe,
  onOpenRegenerate,
}: PersonalizedIdeasTabProps) {
  const [sectionRating, setSectionRating] = useSectionRating('rating_ideas');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="royal-glass rounded-3xl p-5 sm:p-6 border border-[var(--royal)]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--surface-2)] px-3 py-1 rounded-full border border-[var(--gold)]/30">
              Creative Curation & Tips
            </span>
            <span className="text-xs font-semibold text-[var(--cyan)] bg-[var(--surface-2)] px-3 py-1 rounded-full border border-[var(--cyan)]/30">
              Vibe: {themeVibe}
            </span>
          </div>

          <p className="mt-2.5 text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
            Bespoke aesthetic palettes, signature menu ideas tailored to dietary preferences, crowd-pleasing activities, and actionable cost-saving hacks.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenRegenerate}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--royal)]/30 text-[var(--gold)] border border-[var(--gold)]/40 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--gold)] cursor-pointer ml-auto md:ml-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" aria-hidden="true" />
          <span>Regenerate Ideas</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ThemePaletteCard themeDetails={ideas.themeDetails} />
        <CustomMenuCard customMenu={ideas.customMenu} />
        <ActivitiesCard activities={ideas.activities} />
        <MoneySavingHacksCard moneySavingHacks={ideas.moneySavingHacks} />
      </div>

      {/* Was This Helpful? Local Feedback Control */}
      <div className="p-4 rounded-2xl royal-glass border border-[var(--royal)]/30 flex items-center justify-between text-xs text-[var(--muted)]">
        <span>Were these personalized concepts and hacks helpful?</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSectionRating('up')}
            className={`p-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              sectionRating === 'up'
                ? 'bg-[var(--cyan)] text-[#04121A] border-[var(--cyan)] font-bold'
                : 'bg-[var(--surface-2)] text-[var(--muted)] border-[var(--royal)]/30 hover:text-white'
            }`}
            aria-label="Thumbs up for ideas section"
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
            aria-label="Thumbs down for ideas section"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>Needs work</span>
          </button>
        </div>
      </div>
    </div>
  );
}
