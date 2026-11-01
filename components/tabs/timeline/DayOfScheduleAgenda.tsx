/**
 * @file components/tabs/timeline/DayOfScheduleAgenda.tsx
 * @description Hour-by-hour run-of-show timeline for event day coordination.
 */

import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { type DayOfScheduleItem } from '@/lib/schemas';

interface DayOfScheduleAgendaProps {
  dayOfItems: readonly DayOfScheduleItem[];
  onExportSchedule: () => void;
}

const DEFAULT_AGENDA: readonly DayOfScheduleItem[] = [
  {
    time: '08:00 AM',
    activity: 'Vendor Load-In & Technical Walkthrough',
    leadRole: 'Lead Coordinator / Production',
    location: 'Main Ballroom / Loading Bay',
    notes: 'Stage, sound check, and lighting programming begin.',
  },
  {
    time: '11:00 AM',
    activity: 'Floral, Decor & Table Installations',
    leadRole: 'Florist & Styling Team',
    location: 'Reception & Ceremony Spaces',
    notes: 'Floral arches, signage, and place cards arranged.',
  },
  {
    time: '02:00 PM',
    activity: 'Catering Prep & Bar Setup',
    leadRole: 'Head Chef & Bar Lead',
    location: 'Kitchen & Beverage Stations',
    notes: 'Ice delivery, appetizers staged, glassware polished.',
  },
  {
    time: '04:30 PM',
    activity: 'Guest Arrival & Welcome Cocktails',
    leadRole: 'Hospitality Staff / Host',
    location: 'Welcome Lounge',
    notes: 'Signature drinks passed, background soundtrack active.',
  },
  {
    time: '05:30 PM',
    activity: 'Main Ceremony / Formal Opening',
    leadRole: 'Officiant / MC',
    location: 'Grand Stage',
    notes: 'Main program spotlight and vows / keynote address.',
  },
  {
    time: '07:00 PM',
    activity: 'Seated Dinner & Speeches',
    leadRole: 'Catering Captain / MC',
    location: 'Dining Hall',
    notes: 'Multi-course service with designated speech breaks.',
  },
  {
    time: '09:00 PM',
    activity: 'Dance Floor & Nightlife Experience',
    leadRole: 'DJ / Live Band',
    location: 'Dance Floor & Lounge',
    notes: 'High-energy royal Gen Z nightlife beats until close.',
  },
  {
    time: '11:30 PM',
    activity: 'Late-Night Snacks & Grand Sparkler Send-Off',
    leadRole: 'Coordinator & Security',
    location: 'Grand Exit',
    notes: 'Tacos / sliders served, transportation buses staged.',
  },
] as const;

export const DayOfScheduleAgenda: React.FC<DayOfScheduleAgendaProps> = ({
  dayOfItems,
  onExportSchedule,
}) => {
  const items = dayOfItems.length > 0 ? dayOfItems : DEFAULT_AGENDA;

  return (
    <div className="royal-glass rounded-3xl p-6 border border-[var(--cyan)]/30 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--royal)]/20 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--cyan)]" />
            <span>Day-of Event Run-of-Show Agenda</span>
          </h3>
          <p className="text-xs text-[var(--muted)] mt-1">
            Precision hour-by-hour timeline for vendors, wedding party, and event coordinators.
          </p>
        </div>
        <button
          type="button"
          onClick={onExportSchedule}
          className="btn-cyan px-4 py-2 text-xs font-bold cursor-pointer"
        >
          Export Schedule to Calendar
        </button>
      </div>

      <div className="relative pl-6 border-l-2 border-[var(--royal)]/40 space-y-6">
        {items.map((item, idx) => (
          <div key={`${item.time}-${idx}`} className="relative group">
            {/* Dot marker */}
            <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-[var(--cyan)] border-4 border-[#0A0612] group-hover:scale-125 transition-transform" />

            <div className="p-4 rounded-2xl bg-[var(--surface-2)]/80 border border-[var(--royal)]/30 space-y-1.5 hover:border-[var(--cyan)]/40 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-display font-extrabold text-sm text-[var(--gold)]">
                  {item.time}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--surface)] text-[var(--cyan)] border border-[var(--cyan)]/30">
                  Lead: {item.leadRole ?? item.owner ?? 'Coordinator'}
                </span>
              </div>

              <h4 className="font-bold text-sm text-white">{item.activity}</h4>

              {item.location && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                  <MapPin className="w-3 h-3 text-[var(--magenta)]" />
                  <span>{item.location}</span>
                </div>
              )}

              {item.notes && (
                <p className="text-xs text-[var(--muted)] pt-1 border-t border-[var(--royal)]/20 leading-relaxed">
                  {item.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
