/**
 * @file components/tabs/ideas/CustomMenuCard.tsx
 * @description Custom dining menu concepts, signature cocktail/mocktail, and allergy accommodations.
 */

import React from 'react';
import { Utensils, GlassWater } from 'lucide-react';
import { type IdeasPlan } from '@/lib/schemas';

interface CustomMenuCardProps {
  customMenu: IdeasPlan['customMenu'];
}

export const CustomMenuCard: React.FC<CustomMenuCardProps> = ({ customMenu }) => {
  return (
    <section
      aria-labelledby="ideas-menu-heading"
      className="royal-glass rounded-3xl p-6 sm:p-8 border border-[var(--royal)]/40 shadow-xl flex flex-col"
    >
      <div className="flex items-center gap-3 pb-4 mb-5 border-b border-[var(--royal)]/20">
        <div className="p-2.5 rounded-xl bg-[var(--surface-2)] text-[var(--gold)] border border-[var(--gold)]/30">
          <Utensils className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h3 id="ideas-menu-heading" className="font-display font-bold text-sm sm:text-base text-white">
            Custom Menu & Beverage Concepts
          </h3>
          <p className="text-xs text-[var(--muted)]">Dietary-conscious tasting roadmap</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Signature Drink */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[var(--royal)]/40 via-[var(--surface-2)] to-[var(--magenta)]/30 border border-[var(--magenta)]/40">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--gold)] uppercase tracking-wider mb-1">
            <GlassWater className="w-4 h-4 text-[var(--cyan)]" aria-hidden="true" />
            <span>Signature Cocktail / Mocktail</span>
          </div>
          <p className="text-sm sm:text-base font-extrabold text-white">
            {customMenu.signatureCocktailMocktail}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-[var(--surface-2)]/80 rounded-2xl border border-[var(--royal)]/25">
            <h4 className="font-bold uppercase tracking-wider text-[var(--cyan)] mb-2">
              Appetizers & Starters
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-[var(--text)]">
              {customMenu.appetizers.map((app, i) => (
                <li key={i}>{app}</li>
              ))}
            </ul>
          </div>

          <div className="p-3.5 bg-[var(--surface-2)]/80 rounded-2xl border border-[var(--royal)]/25">
            <h4 className="font-bold uppercase tracking-wider text-[var(--magenta)] mb-2">
              Mains & Entrees
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-[var(--text)]">
              {customMenu.mains.map((main, i) => (
                <li key={i}>{main}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-xs sm:text-sm bg-[var(--surface-2)]/80 p-3.5 rounded-2xl border border-[var(--royal)]/25 flex items-start gap-2">
          <span className="font-bold text-[var(--gold)] shrink-0">Dessert:</span>
          <span className="text-[var(--text)]">{customMenu.dessert}</span>
        </div>

        {customMenu.dietaryNotes && (
          <div className="text-xs bg-emerald-950/60 text-emerald-300 p-3 rounded-2xl border border-emerald-500/30">
            <strong className="text-emerald-200">Dietary & Allergy Accommodations:</strong> {customMenu.dietaryNotes}
          </div>
        )}
      </div>
    </section>
  );
};
