/**
 * @file components/tabs/budget/BudgetSeverityBanner.tsx
 * @description Dynamic over/under severity banner with quick trim action and auto-balance.
 */

import React from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Scissors,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { type CurrencyCode } from '@/lib/schemas';
import { formatCurrency, type BudgetSeverityReport } from '@/lib/budget-math';

interface BudgetSeverityBannerProps {
  severityReport: BudgetSeverityReport;
  totalAllocated: number;
  totalBudget: number;
  currency: CurrencyCode;
  isTrimming: boolean;
  trimFeedback: string | null;
  onTrimBudget: () => void;
  onAutoBalance: () => void;
}

export const BudgetSeverityBanner: React.FC<BudgetSeverityBannerProps> = ({
  severityReport,
  totalAllocated,
  totalBudget,
  currency,
  isTrimming,
  trimFeedback,
  onTrimBudget,
  onAutoBalance,
}) => {
  return (
    <div className="space-y-3">
      <div
        role="status"
        aria-live="polite"
        className={`p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-xl ${
          severityReport.severity === 'balanced'
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            : severityReport.severity === 'under'
            ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
            : severityReport.severity === 'caution'
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            : 'bg-rose-950/60 border-rose-500/60 text-rose-200'
        }`}
      >
        <div className="flex items-center gap-3">
          {severityReport.severity === 'balanced' && (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
          )}
          {severityReport.severity === 'under' && (
            <ShieldCheck className="w-5 h-5 text-[var(--cyan)] shrink-0" aria-hidden="true" />
          )}
          {(severityReport.severity === 'caution' || severityReport.severity === 'critical') && (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" aria-hidden="true" />
          )}
          <div>
            <h4 className="font-bold text-sm text-white">
              {severityReport.message}
            </h4>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Allocated: {formatCurrency(totalAllocated, currency)} / Target:{' '}
              {formatCurrency(totalBudget, currency)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {severityReport.severity !== 'balanced' && (
            <button
              type="button"
              onClick={onTrimBudget}
              disabled={isTrimming}
              className="btn-cyan px-4 py-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isTrimming ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Scissors className="w-3.5 h-3.5" />
              )}
              <span>Trim to My Budget</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAutoBalance}
            className="px-3.5 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--royal)]/40 text-white text-xs font-bold border border-[var(--royal)]/40 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Auto-Balance</span>
          </button>
        </div>
      </div>

      {trimFeedback && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300">
          {trimFeedback}
        </div>
      )}
    </div>
  );
};
