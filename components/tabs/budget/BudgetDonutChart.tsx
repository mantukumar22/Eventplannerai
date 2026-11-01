/**
 * @file components/tabs/budget/BudgetDonutChart.tsx
 * @description Accessible SVG donut chart visualization with active category hover/focus callouts and legend.
 */

import React from 'react';
import { PieChart } from 'lucide-react';
import { type BudgetItem, type CurrencyCode } from '@/lib/schemas';
import { formatCurrency, formatPercentage } from '@/lib/budget-math';
import { COLOR_SWATCHES } from '@/lib/constants';

interface BudgetDonutChartProps {
  items: readonly BudgetItem[];
  totalBudget: number;
  contingencyAmount: number;
  currency: CurrencyCode;
  activeItem: BudgetItem | null;
  onActiveItemChange: (item: BudgetItem | null) => void;
}

function calculateChartSegments(
  items: readonly BudgetItem[],
  totalBudget: number,
  circumference: number
) {
  let runningAngle = 0;
  return items.map((item, idx) => {
    const percentage = totalBudget > 0 ? (item.allocatedAmount / totalBudget) * 100 : 0;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((runningAngle / 100) * circumference);
    runningAngle += percentage;

    return {
      item,
      percentage,
      strokeDasharray,
      strokeDashoffset,
      color: item.color ?? COLOR_SWATCHES[idx % COLOR_SWATCHES.length] ?? '#6D28D9',
    };
  });
}

export const BudgetDonutChart: React.FC<BudgetDonutChartProps> = ({
  items,
  totalBudget,
  contingencyAmount,
  currency,
  activeItem,
  onActiveItemChange,
}) => {
  const radius = 80;
  const strokeWidth = 30;
  const circumference = 2 * Math.PI * radius;
  const chartSegments = calculateChartSegments(items, totalBudget, circumference);

  return (
    <div className="lg:col-span-5 royal-glass rounded-3xl p-6 border border-[var(--royal)]/40 shadow-xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between border-b border-[var(--royal)]/20 pb-3 mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <PieChart className="w-4 h-4 text-[var(--cyan)]" aria-hidden="true" />
          <span>Allocation Breakdown</span>
        </h3>
        <span className="text-xs text-[var(--gold)] font-bold">
          {contingencyAmount > 0
            ? `${formatCurrency(contingencyAmount, currency)} Reserved`
            : 'Safety Buffer Active'}
        </span>
      </div>

      {/* SVG Donut */}
      <div className="relative w-64 h-64 my-2 flex items-center justify-center">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 200 200"
          role="img"
          aria-label={`Donut chart showing budget allocation for total of ${formatCurrency(
            totalBudget,
            currency
          )} across ${items.length} categories`}
        >
          {/* Background ring */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#1D1033"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Data Segments */}
          {chartSegments.map((seg) => (
            <circle
              key={seg.item.id}
              cx="100"
              cy="100"
              r={radius}
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              fill="none"
              className="transition-all duration-300 hover:opacity-80 cursor-pointer focus:outline-none"
              tabIndex={0}
              role="graphics-symbol"
              aria-label={`${seg.item.category}: ${formatCurrency(
                seg.item.allocatedAmount,
                currency
              )} (${formatPercentage(seg.percentage)})`}
              onMouseEnter={() => onActiveItemChange(seg.item)}
              onMouseLeave={() => onActiveItemChange(null)}
              onFocus={() => onActiveItemChange(seg.item)}
              onBlur={() => onActiveItemChange(null)}
            />
          ))}
        </svg>

        {/* Center Callout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          {activeItem ? (
            <>
              <span className="text-[11px] font-bold text-[var(--gold)] uppercase tracking-wider truncate max-w-[130px]">
                {activeItem.category}
              </span>
              <span className="text-xl font-display font-black text-white">
                {formatCurrency(activeItem.allocatedAmount, currency)}
              </span>
              <span className="text-xs font-bold text-[var(--cyan)]">
                {formatPercentage(activeItem.percentage)}
              </span>
            </>
          ) : (
            <>
              <span className="text-xs font-semibold text-[var(--muted)]">Total Budget</span>
              <span className="text-xl font-display font-black text-white">
                {formatCurrency(totalBudget, currency)}
              </span>
              <span className="text-xs text-[var(--gold)] font-medium">
                {items.length} Categories
              </span>
            </>
          )}
        </div>
      </div>

      {/* Interactive Legend */}
      <div className="w-full mt-4 space-y-2 border-t border-[var(--royal)]/20 pt-4">
        <h4 className="text-xs font-bold text-[var(--gold)] uppercase tracking-wider mb-2">
          Category Legend
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {items.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onMouseEnter={() => onActiveItemChange(item)}
              onMouseLeave={() => onActiveItemChange(null)}
              onFocus={() => onActiveItemChange(item)}
              onBlur={() => onActiveItemChange(null)}
              className={`flex items-center gap-2 p-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                activeItem?.id === item.id ? 'bg-[var(--royal)]/40' : 'hover:bg-[var(--surface-2)]'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color || COLOR_SWATCHES[idx % COLOR_SWATCHES.length] }}
                aria-hidden="true"
              />
              <span className="truncate text-[var(--muted)] hover:text-white font-medium">
                {item.category}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
