/**
 * @file components/tabs/ideas/MoneySavingHacksCard.tsx
 * @description Strategic budget savings and high-impact cost reduction tips.
 */

import React from 'react';
import { PiggyBank } from 'lucide-react';
import { type IdeasPlan } from '@/lib/schemas';

interface MoneySavingHacksCardProps {
  moneySavingHacks: IdeasPlan['moneySavingHacks'];
}

export const MoneySavingHacksCard: React.FC<MoneySavingHacksCardProps> = ({
  moneySavingHacks,
}) => {
  return (
    <section
      aria-labelledby="ideas-hacks-heading"
      className="royal-glass rounded-3xl p-6 sm:p-8 border border-[var(--royal)]/40 shadow-xl flex flex-col"
    >
      <div className="flex items-center gap-3 pb-4 mb-5 border-b border-[var(--royal)]/20">
        <div className="p-2.5 rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
          <PiggyBank className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h3 id="ideas-hacks-heading" className="font-display font-bold text-sm sm:text-base text-white">
            Strategic Money-Saving Hacks
          </h3>
          <p className="text-xs text-[var(--muted)]">High impact savings without sacrificing guest experience</p>
        </div>
      </div>

      <div className="space-y-3.5">
        {moneySavingHacks.map((hack, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="text-xs sm:text-sm font-bold text-white">
                {hack.tip}
              </h4>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-0.5 rounded-full border border-emerald-500/40 shrink-0">
                Save {hack.estimatedSavings}
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed mt-1">
              {hack.implementation}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
