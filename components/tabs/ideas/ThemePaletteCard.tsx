/**
 * @file components/tabs/ideas/ThemePaletteCard.tsx
 * @description Theme concept, dynamic color swatches, and atmospheric styling elements.
 */

import React from 'react';
import { Palette, Check } from 'lucide-react';
import { type IdeasPlan } from '@/lib/schemas';

interface ThemePaletteCardProps {
  themeDetails: IdeasPlan['themeDetails'];
}

const DEFAULT_SWATCHES = ['#6D28D9', '#E879F9', '#F5C451', '#22E5FF', '#A78BFA'] as const;

export const ThemePaletteCard: React.FC<ThemePaletteCardProps> = ({ themeDetails }) => {
  return (
    <section
      aria-labelledby="ideas-theme-heading"
      className="royal-glass rounded-3xl p-6 sm:p-8 border border-[var(--royal)]/40 shadow-xl flex flex-col"
    >
      <div className="flex items-center gap-3 pb-4 mb-5 border-b border-[var(--royal)]/20">
        <div className="p-2.5 rounded-xl bg-[var(--royal)]/30 text-[var(--magenta)] border border-[var(--magenta)]/30">
          <Palette className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h3 id="ideas-theme-heading" className="font-display font-bold text-sm sm:text-base text-white">
            Aesthetic Vision & Color Palette
          </h3>
          <p className="text-xs text-[var(--muted)]">Cohesive motifs and atmosphere styling</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] mb-1.5">
            Concept & Atmosphere
          </h4>
          <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed bg-[var(--surface-2)]/80 p-4 rounded-2xl border border-[var(--royal)]/25">
            {themeDetails.concept}
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] mb-2.5">
            Recommended Color Palette
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {themeDetails.colorPalette.map((color, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--royal)]/30 text-xs font-bold text-white"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shadow-md border border-white/20 shrink-0"
                  style={{
                    backgroundColor: color.startsWith('#')
                      ? color
                      : DEFAULT_SWATCHES[i % DEFAULT_SWATCHES.length],
                  }}
                  aria-hidden="true"
                />
                <span>{color}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] mb-2.5">
            Key Decor & Atmospheric Elements
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-[var(--text)]">
            {themeDetails.decorElements.map((elem, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[var(--cyan)] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{elem}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
