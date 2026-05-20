import { useMemo } from 'react';
import {
  addWeeks,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfWeek,
} from 'date-fns';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { applyFilters, cx } from '../../lib/utils';
import { DeploymentBadge } from '../calendar/DeploymentBadge';
import type { Deployment } from '../../types';
import { Button } from '../ui/Button';
import { WeekTimeSlot } from './WeekTimeSlot';

const START_HOUR = 6;
const END_HOUR = 22;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

function timeToPct(time: string): number {
  const [h, m] = time.split(':').map(Number);
  const totalMins = (h - START_HOUR) * 60 + (m ?? 0);
  return (totalMins / ((END_HOUR - START_HOUR + 1) * 60)) * 100;
}

export interface WeekViewProps {
  onDeploymentClick: (d: Deployment) => void;
}

function assignLanes(items: Deployment[]): {
  lanes: Map<string, number>;
  laneCount: number;
} {
  // Items must have time. Group overlapping items into lanes.
  const sorted = [...items].sort((a, b) =>
    (a.deploy_time_start ?? '').localeCompare(b.deploy_time_start ?? ''),
  );
  const laneEnds: string[] = [];
  const lanes = new Map<string, number>();
  for (const item of sorted) {
    const start = item.deploy_time_start ?? '00:00';
    const end = item.deploy_time_end ?? start;
    let placed = false;
    for (let i = 0; i < laneEnds.length; i++) {
      if (laneEnds[i] <= start) {
        laneEnds[i] = end;
        lanes.set(item.id, i);
        placed = true;
        break;
      }
    }
    if (!placed) {
      laneEnds.push(end);
      lanes.set(item.id, laneEnds.length - 1);
    }
  }
  return { lanes, laneCount: Math.max(1, laneEnds.length) };
}

export function WeekView({ onDeploymentClick }: WeekViewProps) {
  const app = useApp();
  const { currentDate, setCurrentDate, deployments, filters } = app;

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [weekStart],
  );

  const filtered = useMemo(
    () => applyFilters(deployments.deployments, filters),
    [deployments.deployments, filters],
  );

  const dayBuckets = useMemo(() => {
    return days.map((day) => {
      const items = filtered.filter((d) => isSameDay(parseISO(d.deploy_date), day));
      const allDay = items.filter((d) => !d.deploy_time_start);
      const timed = items.filter((d) => d.deploy_time_start);
      const { lanes, laneCount } = assignLanes(timed);
      return { day, allDay, timed, lanes, laneCount };
    });
  }, [days, filtered]);

  return (
    <motion.div
      key={`week-${format(weekStart, 'yyyy-MM-dd')}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Week of {format(weekStart, 'MMM d')} — {format(weekEnd, 'MMM d, yyyy')}
        </h2>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
            This week
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setCurrentDate(addWeeks(currentDate, -1))} aria-label="Previous week">
            <ChevronLeft size={16} />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setCurrentDate(addWeeks(currentDate, 1))} aria-label="Next week">
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <div />
          {days.map((d) => (
            <div
              key={d.toString()}
              className={cx(
                'px-2 py-2 text-center',
                isSameDay(d, new Date()) && 'text-accenture-400',
              )}
            >
              <div>{format(d, 'EEE')}</div>
              <div className="font-display text-lg text-slate-800 dark:text-slate-100">
                {format(d, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* All-day row */}
        <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b border-slate-200 dark:border-slate-800">
          <div className="px-2 py-1 text-[10px] font-medium uppercase text-slate-400">All-day</div>
          {dayBuckets.map((b) => (
            <div key={`allday-${b.day.toString()}`} className="flex min-h-[32px] flex-col gap-0.5 border-l border-slate-200 px-1 py-1 dark:border-slate-800">
              {b.allDay.map((d) => (
                <DeploymentBadge key={d.id} deployment={d} onClick={onDeploymentClick} showEnv />
              ))}
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="relative grid grid-cols-[60px_repeat(7,minmax(0,1fr))]">
          {/* Hour gutter */}
          <div className="border-r border-slate-200 dark:border-slate-800">
            {HOURS.map((h) => (
              <div key={h} className="h-12 px-2 pt-1 text-[10px] font-mono text-slate-400">
                {h.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {dayBuckets.map((b) => (
            <div
              key={`col-${b.day.toString()}`}
              className="relative border-l border-slate-200 dark:border-slate-800"
              style={{ height: `${HOURS.length * 48}px` }}
            >
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="h-12 border-b border-slate-100 dark:border-slate-800/60"
                />
              ))}
              {b.timed.map((d) => {
                const top = timeToPct(d.deploy_time_start as string);
                const endTime = d.deploy_time_end ?? d.deploy_time_start ?? '00:00';
                const bottom = timeToPct(endTime);
                const height = Math.max(2, bottom - top);
                const lane = b.lanes.get(d.id) ?? 0;
                return (
                  <WeekTimeSlot
                    key={d.id}
                    deployment={d}
                    topPct={top}
                    heightPct={height}
                    onClick={onDeploymentClick}
                    laneIndex={lane}
                    lanesInColumn={b.laneCount}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
