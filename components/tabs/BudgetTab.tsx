'use client';

/**
 * @file components/tabs/BudgetTab.tsx
 * @description Interactive Budget Breakdown tab with what-if guest count slider,
 * live severity alerts, SVG donut chart, and AI or rule-based budget trimming.
 */

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { type BudgetPlan, type BudgetItem, type CurrencyCode } from '@/lib/schemas';
import {
  formatCurrency,
  normalizeBudgetItems,
  updateBudgetItemAmount,
  rescaleBudgetByGuestCount,
  getBudgetSeverity,
} from '@/lib/budget-math';
import { useSectionRating } from '@/hooks/use-section-rating';
import { BudgetSeverityBanner } from './budget/BudgetSeverityBanner';
import { BudgetWhatIfSlider } from './budget/BudgetWhatIfSlider';
import { BudgetDonutChart } from './budget/BudgetDonutChart';
import { BudgetAllocationTable } from './budget/BudgetAllocationTable';

interface BudgetTabProps {
  budget: BudgetPlan;
  currency: CurrencyCode;
  guestCount?: number;
  onUpdateBudget: (updated: BudgetPlan) => void;
  onOpenRegenerate: () => void;
}

export function BudgetTab({
  budget,
  currency,
  guestCount = 100,
  onUpdateBudget,
  onOpenRegenerate,
}: BudgetTabProps) {
  const items = budget.items;
  const [activeItem, setActiveItem] = useState<BudgetItem | null>(null);
  const [simulatedGuests, setSimulatedGuests] = useState<number>(guestCount);
  const [isTrimming, setIsTrimming] = useState(false);
  const [trimFeedback, setTrimFeedback] = useState<string | null>(null);
  const [sectionRating, setSectionRating] = useSectionRating('rating_budget');

  const totalAllocated = Math.round(
    items.reduce((sum, item) => sum + item.allocatedAmount, 0) * 100
  ) / 100;

  const severityReport = getBudgetSeverity(totalAllocated, budget.totalBudget);

  const whatIfScenario = rescaleBudgetByGuestCount(
    items,
    guestCount,
    simulatedGuests,
    budget.totalBudget
  );

  const handleAmountChange = (id: string, newAmount: number): void => {
    const res = updateBudgetItemAmount(items, id, newAmount, budget.totalBudget);
    onUpdateBudget({
      ...budget,
      items: res.items,
    });
  };

  const handleAutoBalance = (): void => {
    const balanced = normalizeBudgetItems(items, budget.totalBudget);
    onUpdateBudget({
      ...budget,
      items: balanced,
    });
  };

  const handleApplyWhatIf = (): void => {
    onUpdateBudget({
      ...budget,
      items: whatIfScenario.items,
    });
  };

  const handleTrimBudget = (): void => {
    setIsTrimming(true);
    setTrimFeedback(null);
    try {
      const balanced = normalizeBudgetItems(items, budget.totalBudget);
      onUpdateBudget({
        ...budget,
        items: balanced,
      });
      setTrimFeedback(
        `Budget successfully trimmed and rebalanced to ${formatCurrency(budget.totalBudget, currency)} with contingency preserved.`
      );
    } catch {
      setTrimFeedback('Unable to auto-trim right now.');
    } finally {
      setIsTrimming(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Over/Under Severity Banner */}
      <BudgetSeverityBanner
        severityReport={severityReport}
        totalAllocated={totalAllocated}
        totalBudget={budget.totalBudget}
        currency={currency}
        isTrimming={isTrimming}
        trimFeedback={trimFeedback}
        onTrimBudget={handleTrimBudget}
        onAutoBalance={handleAutoBalance}
      />

      {/* What-If Guest Slider Tool */}
      <BudgetWhatIfSlider
        guestCount={guestCount}
        simulatedGuests={simulatedGuests}
        currency={currency}
        simulatedSpend={whatIfScenario.totalAllocated}
        perGuestCost={whatIfScenario.perGuestCost}
        onGuestsChange={setSimulatedGuests}
        onReset={() => setSimulatedGuests(guestCount)}
        onApplyScenario={handleApplyWhatIf}
      />

      {/* Main Grid: Donut Chart + Editable Line Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <BudgetDonutChart
          items={items}
          totalBudget={budget.totalBudget}
          contingencyAmount={budget.contingencyAmount}
          currency={currency}
          activeItem={activeItem}
          onActiveItemChange={setActiveItem}
        />

        <BudgetAllocationTable
          items={items}
          currency={currency}
          onAmountChange={handleAmountChange}
          onOpenRegenerate={onOpenRegenerate}
        />
      </div>

      {/* Was This Helpful? Section Feedback Control */}
      <div className="p-4 rounded-2xl royal-glass border border-[var(--royal)]/30 flex items-center justify-between text-xs text-[var(--muted)]">
        <span>Was this budget breakdown helpful for your planning?</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSectionRating('up')}
            className={`p-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              sectionRating === 'up'
                ? 'bg-[var(--cyan)] text-[#04121A] border-[var(--cyan)] font-bold'
                : 'bg-[var(--surface-2)] text-[var(--muted)] border-[var(--royal)]/30 hover:text-white'
            }`}
            aria-label="Thumbs up for budget section"
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
            aria-label="Thumbs down for budget section"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>Needs work</span>
          </button>
        </div>
      </div>
    </div>
  );
}
