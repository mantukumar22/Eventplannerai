/**
 * @file components/tabs/timeline/TimelineProgressHeader.tsx
 * @description Milestone progress bar, view switcher (Milestones vs Run-of-Show), and action triggers.
 */

import React from 'react';
import { CalendarPlus, Sparkles } from 'lucide-react';

interface TimelineProgressHeaderProps {
  eventDate: string;
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  activeView: 'milestones' | 'runOfShow';
  dayOfItemCount: number;
  onViewChange: (view: 'milestones' | 'runOfShow') => void;
  onExportIcs: () => void;
  onOpenRegenerate: () => void;
}

export const TimelineProgressHeader: React.FC<TimelineProgressHeaderProps> = ({
  eventDate,
  completedCount,
  totalCount,
  progressPercent,
  activeView,
  dayOfItemCount,
  onViewChange,
  onExportIcs,
  onOpenRegenerate,
}) => {
  return (
    <div className="royal-glass rounded-3xl p-5 sm:p-6 border border-[var(--royal)]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="w-full md:w-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--surface-2)] px-3 py-1 rounded-full border border-[var(--gold)]/30">
            Schedule & Run-of-Show
          </span>
          <span className="text-xs font-semibold text-[var(--cyan)] bg-[var(--surface-2)] px-3 py-1 rounded-full border border-[var(--cyan)]/30">
            Target: {eventDate || 'Upcoming'}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-4">
          <div className="flex-1 min-w-[200px] max-w-xs">
            <div className="flex justify-between text-xs text-[var(--muted)] font-semibold mb-1">
              <span>Milestone Progress</span>
              <span className="text-[var(--gold)] font-bold">{progressPercent}%</span>
            </div>
            <div
              className="w-full h-2.5 bg-[var(--surface-2)] rounded-full overflow-hidden border border-[var(--royal)]/30"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Milestone progress: ${completedCount} of ${totalCount} completed`}
            >
              <div
                className="h-full bg-gradient-to-r from-[var(--royal-light)] via-[var(--magenta)] to-[var(--gold)] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-[var(--muted)] whitespace-nowrap">
            {completedCount}/{totalCount} Completed
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
        {/* View Toggle */}
        <div className="flex rounded-xl bg-[var(--surface-2)] p-1 border border-[var(--royal)]/40">
          <button
            type="button"
            onClick={() => onViewChange('milestones')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'milestones'
                ? 'bg-[var(--cyan)] text-[#04121A]'
                : 'text-[var(--muted)] hover:text-white'
            }`}
          >
            Countdown Milestones
          </button>
          <button
            type="button"
            onClick={() => onViewChange('runOfShow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'runOfShow'
                ? 'bg-[var(--cyan)] text-[#04121A]'
                : 'text-[var(--muted)] hover:text-white'
            }`}
          >
            Day-of Run of Show ({dayOfItemCount || 7})
          </button>
        </div>

        <button
          type="button"
          onClick={onExportIcs}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--royal)]/40 text-[var(--cyan)] border border-[var(--cyan)]/40 text-xs font-bold transition-all cursor-pointer"
          title="Download Apple / Google Calendar .ics file"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
          <span>Export .ics</span>
        </button>

        <button
          type="button"
          onClick={onOpenRegenerate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--royal)]/30 text-[var(--gold)] border border-[var(--gold)]/40 text-xs font-bold transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Regenerate Timeline</span>
        </button>
      </div>
    </div>
  );
};
