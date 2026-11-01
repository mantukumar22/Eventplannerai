/**
 * @file components/tabs/budget/BudgetAllocationTable.tsx
 * @description Editable budget line items table with category percentages, notes, and regenerate trigger.
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { type BudgetItem, type CurrencyCode } from '@/lib/schemas';
import { formatPercentage } from '@/lib/budget-math';
import { COLOR_SWATCHES } from '@/lib/constants';

interface BudgetAllocationTableProps {
  items: readonly BudgetItem[];
  currency: CurrencyCode;
  onAmountChange: (id: string, amount: number) => void;
  onOpenRegenerate: () => void;
}

export const BudgetAllocationTable: React.FC<BudgetAllocationTableProps> = ({
  items,
  currency,
  onAmountChange,
  onOpenRegenerate,
}) => {
  return (
    <div className="lg:col-span-7 royal-glass rounded-3xl p-6 border border-[var(--royal)]/40 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--royal)]/20 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white">Interactive Category Allocation</h3>
          <p className="text-xs text-[var(--muted)]">
            Directly edit amounts below to instantly recalculate percentages
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenRegenerate}
          className="text-xs font-bold text-[var(--gold)] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Regenerate Budget</span>
        </button>
      </div>

      <div className="overflow-x-auto max-h-[460px] pr-1">
        <table
          className="w-full text-left text-xs border-collapse"
          aria-label="Editable budget category allocation table"
        >
          <thead>
            <tr className="border-b border-[var(--royal)]/30 text-[var(--muted)] font-semibold">
              <th scope="col" className="pb-2.5 pl-2">Category</th>
              <th scope="col" className="pb-2.5 text-right">Share</th>
              <th scope="col" className="pb-2.5 pr-2 text-right">Allocated ({currency})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--royal)]/20">
            {items.map((item, idx) => {
              const isContingency = item.category.toLowerCase().includes('contingency');
              return (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    isContingency
                      ? 'bg-[var(--gold)]/10 hover:bg-[var(--gold)]/15'
                      : 'hover:bg-[var(--surface-2)]/60'
                  }`}
                >
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            item.color || COLOR_SWATCHES[idx % COLOR_SWATCHES.length],
                        }}
                        aria-hidden="true"
                      />
                      <span className="font-bold text-white text-sm">
                        {item.category}
                      </span>
                      {isContingency && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-[var(--gold)]/20 text-[var(--gold)] px-2 py-0.5 rounded-full border border-[var(--gold)]/40 ml-1">
                          Buffer
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-[11px] text-[var(--muted)] mt-1 pl-4.5">
                        {item.notes}
                      </p>
                    )}
                  </td>
                  <td className="py-3 text-right font-bold text-[var(--cyan)]">
                    {formatPercentage(item.percentage)}
                  </td>
                  <td className="py-3 pr-2 text-right">
                    <div className="inline-flex items-center justify-end">
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-xs text-[var(--muted)] pointer-events-none">
                          {currency}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="50"
                          value={item.allocatedAmount}
                          onChange={(e) =>
                            onAmountChange(item.id, parseFloat(e.target.value) || 0)
                          }
                          aria-label={`Allocated amount for ${item.category}`}
                          className="w-28 pl-10 pr-2.5 py-1.5 text-xs font-bold rounded-xl bg-[var(--surface)] text-white border border-[var(--royal)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
