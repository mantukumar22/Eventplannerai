/**
 * @file components/tabs/timeline/TimelineMilestoneList.tsx
 * @description Accessible milestone task cards with phase grouping, owner attribution, and completion toggle.
 */

import React from 'react';
import { Clock, User, CalendarDays } from 'lucide-react';
import { type TimelineTask, type Priority } from '@/lib/schemas';

interface TimelineMilestoneListProps {
  tasks: readonly TimelineTask[];
  onToggleTask: (taskId: string) => void;
  onClearFilters: () => void;
}

const PRIORITY_STYLES: Record<Priority, { bg: string; text: string; border: string }> = {
  High: { bg: 'bg-rose-950/60', text: 'text-rose-300', border: 'border-rose-500/40' },
  Medium: { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-500/40' },
  Low: { bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-500/40' },
};

export const TimelineMilestoneList: React.FC<TimelineMilestoneListProps> = ({
  tasks,
  onToggleTask,
  onClearFilters,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="p-12 text-center royal-glass rounded-3xl border border-[var(--royal)]/30 text-[var(--muted)]">
        <CalendarDays className="w-8 h-8 text-[var(--cyan)] mx-auto mb-2 opacity-50" />
        <p className="text-sm font-semibold">No milestone tasks match your filters.</p>
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-3 text-xs font-bold text-[var(--cyan)] underline cursor-pointer"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const priorityStyle = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.Medium;
        return (
          <div
            key={task.id}
            className={`p-4 sm:p-5 rounded-3xl royal-glass border transition-all ${
              task.completed
                ? 'border-emerald-500/30 bg-emerald-950/10 opacity-70'
                : 'border-[var(--royal)]/30 hover:border-[var(--royal-light)] shadow-lg'
            }`}
          >
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                id={`task-${task.id}`}
                checked={task.completed}
                onChange={() => onToggleTask(task.id)}
                className="w-5 h-5 mt-1 rounded text-[var(--cyan)] border-[var(--royal)]/40 bg-[var(--surface)] focus:ring-[var(--cyan)] cursor-pointer"
              />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor={`task-${task.id}`}
                    className={`font-bold text-sm sm:text-base cursor-pointer ${
                      task.completed ? 'line-through text-[var(--muted)]' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </label>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
                    >
                      {task.priority} Priority
                    </span>
                    <span className="text-xs font-semibold text-[var(--cyan)] bg-[var(--surface-2)] px-2.5 py-0.5 rounded-full border border-[var(--cyan)]/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.timeOffset}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">
                  {task.description}
                </p>

                <div className="mt-3 flex items-center gap-3 text-xs text-[var(--muted)]">
                  <span className="font-semibold text-[var(--gold)]">
                    Phase: {task.phase}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Owner: <strong className="text-white">{task.owner}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
