/**
 * @file components/tabs/ideas/ActivitiesCard.tsx
 * @description Curated activities and icebreaker highlights tailored to the event format and guest demographics.
 */

import React from 'react';
import { PartyPopper } from 'lucide-react';
import { type IdeasPlan } from '@/lib/schemas';

interface ActivitiesCardProps {
  activities: IdeasPlan['activities'];
}

export const ActivitiesCard: React.FC<ActivitiesCardProps> = ({ activities }) => {
  return (
    <section
      aria-labelledby="ideas-activities-heading"
      className="royal-glass rounded-3xl p-6 sm:p-8 border border-[var(--royal)]/40 shadow-xl flex flex-col"
    >
      <div className="flex items-center gap-3 pb-4 mb-5 border-b border-[var(--royal)]/20">
        <div className="p-2.5 rounded-xl bg-[var(--royal)]/30 text-[var(--cyan)] border border-[var(--cyan)]/30">
          <PartyPopper className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h3 id="ideas-activities-heading" className="font-display font-bold text-sm sm:text-base text-white">
            Curated Activities & Icebreakers
          </h3>
          <p className="text-xs text-[var(--muted)]">Memorable moments designed for guest engagement</p>
        </div>
      </div>

      <div className="space-y-3.5">
        {activities.map((act, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-[var(--royal)]/30 hover:border-[var(--gold)]/40 transition-colors bg-[var(--surface-2)]/70"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="text-xs sm:text-sm font-bold text-white">
                {act.title}
              </h4>
              <span className="text-[10px] font-bold text-[var(--cyan)] bg-[var(--royal)]/30 px-2.5 py-0.5 rounded-full border border-[var(--cyan)]/30 shrink-0">
                {act.targetAudience}
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed mt-1">
              {act.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
