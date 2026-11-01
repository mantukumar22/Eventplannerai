'use client';

/**
 * @file components/tabs/TimelineTab.tsx
 * @description Interactive Timeline tab featuring Countdown Milestones,
 * Day-of Run-of-Show (hour-by-hour agenda), direct .ics export, and local feedback.
 */

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { type TimelinePlan, type DayOfScheduleItem } from '@/lib/schemas';
import { downloadIcsFile } from '@/lib/ics-export';
import { useSectionRating } from '@/hooks/use-section-rating';
import { TimelineProgressHeader } from './timeline/TimelineProgressHeader';
import { TimelineFilters } from './timeline/TimelineFilters';
import { TimelineMilestoneList } from './timeline/TimelineMilestoneList';
import { DayOfScheduleAgenda } from './timeline/DayOfScheduleAgenda';

interface TimelineTabProps {
  timeline: TimelinePlan;
  eventDate: string;
  eventTitle?: string;
  onUpdateTimeline: (updated: TimelinePlan) => void;
  onOpenRegenerate: () => void;
}

export function TimelineTab({
  timeline,
  eventDate,
  eventTitle = 'Event',
  onUpdateTimeline,
  onOpenRegenerate,
}: TimelineTabProps) {
  const tasks = timeline.tasks;
  const dayOfItems: DayOfScheduleItem[] = timeline.dayOfSchedule ?? [];

  const [activeView, setActiveView] = useState<'milestones' | 'runOfShow'>('milestones');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [filterCompleted, setFilterCompleted] = useState<'all' | 'pending' | 'completed'>('all');
  const [lastToggledTask, setLastToggledTask] = useState<string | null>(null);
  const [sectionRating, setSectionRating] = useSectionRating('rating_timeline');

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggleTask = (taskId: string): void => {
    const updated = tasks.map((task) => {
      if (task.id === taskId) {
        const nextState = !task.completed;
        setLastToggledTask(`Task "${task.title}" marked as ${nextState ? 'completed' : 'pending'}`);
        return { ...task, completed: nextState };
      }
      return task;
    });

    onUpdateTimeline({
      ...timeline,
      tasks: updated,
    });
  };

  const handleExportIcs = (): void => {
    downloadIcsFile({
      createdAt: new Date().toISOString(),
      intake: {
        eventType: 'wedding',
        eventTitle,
        eventDate,
        guestCount: 100,
        totalBudget: 10000,
        currency: 'USD',
        location: 'Venue',
        themeVibe: 'Celebration',
        venueSetting: 'indoor',
      },
      executiveSummary: '',
      budget: {
        totalBudget: 10000,
        currency: 'USD',
        contingencyAmount: 1000,
        items: [],
        summary: '',
      },
      timeline,
      vendors: { vendors: [], tips: [] },
      ideas: {
        themeDetails: { concept: 'Celebration', colorPalette: ['#6D28D9'], decorElements: [] },
        activities: [],
        customMenu: { signatureCocktailMocktail: '', appetizers: [], mains: [], dessert: '', dietaryNotes: '' },
        moneySavingHacks: [],
      },
    });
  };

  const filteredTasks = tasks.filter((task) => {
    if (selectedPhase !== 'all' && task.phase !== selectedPhase) return false;
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
    if (filterCompleted === 'pending' && task.completed) return false;
    if (filterCompleted === 'completed' && !task.completed) return false;
    return true;
  });

  const allPhases =
    timeline.phases.length > 0
      ? timeline.phases
      : Array.from(new Set(tasks.map((t) => t.phase)));

  return (
    <div className="space-y-6">
      {/* Top Banner & View Switcher */}
      <TimelineProgressHeader
        eventDate={eventDate}
        completedCount={completedCount}
        totalCount={totalCount}
        progressPercent={progressPercent}
        activeView={activeView}
        dayOfItemCount={dayOfItems.length}
        onViewChange={setActiveView}
        onExportIcs={handleExportIcs}
        onOpenRegenerate={onOpenRegenerate}
      />

      {/* Screen Reader Live Announcement */}
      <div className="sr-only" aria-live="polite">
        {lastToggledTask}
      </div>

      {activeView === 'milestones' ? (
        <>
          <TimelineFilters
            totalTasksCount={tasks.length}
            allPhases={allPhases}
            selectedPhase={selectedPhase}
            selectedPriority={selectedPriority}
            filterCompleted={filterCompleted}
            onPhaseChange={setSelectedPhase}
            onPriorityChange={setSelectedPriority}
            onStatusChange={setFilterCompleted}
          />

          <TimelineMilestoneList
            tasks={filteredTasks}
            onToggleTask={handleToggleTask}
            onClearFilters={() => {
              setSelectedPhase('all');
              setSelectedPriority('all');
              setFilterCompleted('all');
            }}
          />
        </>
      ) : (
        <DayOfScheduleAgenda
          dayOfItems={dayOfItems}
          onExportSchedule={handleExportIcs}
        />
      )}

      {/* Was This Helpful? Local Feedback Control */}
      <div className="p-4 rounded-2xl royal-glass border border-[var(--royal)]/30 flex items-center justify-between text-xs text-[var(--muted)]">
        <span>Was this schedule breakdown helpful?</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSectionRating('up')}
            className={`p-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              sectionRating === 'up'
                ? 'bg-[var(--cyan)] text-[#04121A] border-[var(--cyan)] font-bold'
                : 'bg-[var(--surface-2)] text-[var(--muted)] border-[var(--royal)]/30 hover:text-white'
            }`}
            aria-label="Thumbs up for timeline section"
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
            aria-label="Thumbs down for timeline section"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>Needs work</span>
          </button>
        </div>
      </div>
    </div>
  );
}
