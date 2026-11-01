/**
 * @file components/tabs/budget/BudgetWhatIfSlider.tsx
 * @description Interactive what-if guest count rescaler tool for budget simulation.
 */

import React from 'react';
import { Users } from 'lucide-react';
import { type CurrencyCode, type BudgetItem } from '@/lib/schemas';
import { formatCurrency } from '@/lib/budget-math';

interface BudgetWhatIfSliderProps {
  guestCount: number;
  simulatedGuests: number;
  currency: CurrencyCode;
  simulatedSpend: number;
  perGuestCost: number;
  onGuestsChange: (count: number) => void;
  onReset: () => void;
  onApplyScenario: () => void;
}

export const BudgetWhatIfSlider: React.FC<BudgetWhatIfSliderProps> = ({
  guestCount,
  simulatedGuests,
  currency,
  simulatedSpend,
  perGuestCost,
  onGuestsChange,
  onReset,
  onApplyScenario,
}) => {
  return (
    <div className="royal-glass rounded-3xl p-5 sm:p-6 border border-[var(--cyan)]/30 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[var(--cyan)]" />
          <h3 className="text-sm font-bold text-white">
            What-If Tool: Live Guest Count Rescaler
          </h3>
        </div>
        <div className="text-xs text-[var(--muted)]">
          Per-guest categories (Catering, Bar, Favors) adjust proportionally
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[var(--muted)]">Simulated Attendees:</span>
          <span className="text-white text-sm bg-[var(--surface-2)] px-3 py-1 rounded-full border border-[var(--cyan)]/40">
            {simulatedGuests} guests (Baseline: {guestCount})
          </span>
        </div>
        <input
          type="range"
          min={Math.max(5, Math.floor(guestCount * 0.25))}
          max={Math.max(50, Math.ceil(guestCount * 2.5))}
          step={5}
          value={simulatedGuests}
          onChange={(e) => onGuestsChange(parseInt(e.target.value, 10))}
          className="w-full accent-[var(--cyan)] cursor-pointer"
          aria-label="Guest count what-if slider"
        />
      </div>

      {simulatedGuests !== guestCount && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-[var(--royal)]/20">
          <div className="text-[var(--muted)]">
            Simulated Spend:{' '}
            <strong className="text-white">
              {formatCurrency(simulatedSpend, currency)}
            </strong>{' '}
            (~{formatCurrency(perGuestCost, currency)}/guest)
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReset}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--muted)] hover:text-white cursor-pointer"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onApplyScenario}
              className="btn-cyan px-3 py-1.5 text-xs font-bold cursor-pointer"
            >
              Apply This Scenario
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
