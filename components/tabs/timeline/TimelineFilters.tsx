/**
 * @file components/tabs/timeline/TimelineFilters.tsx
 * @description Accessible dropdown filters for milestone phase, priority, and completion status.
 */

import React from 'react';
import { Filter } from 'lucide-react';

interface TimelineFiltersProps {
  totalTasksCount: number;
  allPhases: readonly string[];
  selectedPhase: string;
  selectedPriority: string;
  filterCompleted: 'all' | 'pending' | 'completed';
  onPhaseChange: (phase: string) => void;
  onPriorityChange: (priority: string) => void;
  onStatusChange: (status: 'all' | 'pending' | 'completed') => void;
}

export const TimelineFilters: React.FC<TimelineFiltersProps> = ({
  totalTasksCount,
  allPhases,
  selectedPhase,
  selectedPriority,
  filterCompleted,
  onPhaseChange,
  onPriorityChange,
  onStatusChange,
}) => {
  return (
    <div className="royal-glass rounded-2xl p-4 border border-[var(--royal)]/30 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-xs font-bold text-white">
        <Filter className="w-4 h-4 text-[var(--cyan)]" aria-hidden="true" />
        <span>Filter Milestones:</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Phase Filter */}
        <div>
          <label htmlFor="filter-phase" className="sr-only">
            Filter by Phase
          </label>
          <select
            id="filter-phase"
            value={selectedPhase}
            onChange={(e) => onPhaseChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[var(--royal)]/40 text-xs text-white bg-[var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] cursor-pointer"
          >
            <option value="all">All Phases ({totalTasksCount})</option>
            {allPhases.map((phase) => (
              <option key={phase} value={phase}>
                {phase}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label htmlFor="filter-priority" className="sr-only">
            Filter by Priority
          </label>
          <select
            id="filter-priority"
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[var(--royal)]/40 text-xs text-white bg-[var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="filter-status" className="sr-only">
            Filter by Status
          </label>
          <select
            id="filter-status"
            value={filterCompleted}
            onChange={(e) => onStatusChange(e.target.value as 'all' | 'pending' | 'completed')}
            className="px-3 py-1.5 rounded-xl border border-[var(--royal)]/40 text-xs text-white bg-[var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Only</option>
            <option value="completed">Completed Only</option>
          </select>
        </div>
      </div>
    </div>
  );
};
