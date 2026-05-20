import { useMemo } from 'react';
import {
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
} from 'date-fns';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TEAMS, TEAM_KEYS } from '../../constants/teams';
import { applyFilters } from '../../lib/utils';
import type { Deployment, TeamKey } from '../../types';
import { Button } from '../ui/Button';
import { TimelineBar } from './TimelineBar';

const ROW_HEIGHT = 80;

export interface TimelineViewProps {
  onDeploymentClick: (d: Deployment) => void;
}

export function TimelineView({ onDeploymentClick }: TimelineViewProps) {
  const app = useApp();
  const { currentDate, setCurrentDate, deployments, filters } = app;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const totalDays = differenceInCalendarDays(monthEnd, monthStart) + 1;
  const days = useMemo(
    () => eachDayOfInterval({ start: monthStart, end: monthEnd }),
    [monthStart, monthEnd],
  );

  const filtered = useMemo(
    () => applyFilters(deployments.deployments, filters),
    [deployments.deployments, filters],
  );

  const monthDeployments = useMemo(
    () =>
      filtered.filter((d) => {
        const date = parseISO(d.deploy_date);
        return isSameMonth(date, currentDate);
      }),
    [filtered, currentDate],
  );

  const grouped = useMemo(() => {
    const map: Record<TeamKey, Deployment[]> = {
      IDM: [],
      DQA: [],
      RMT: [],
      PRT: [],
      CDP: [],
      MyConcerto: [],
      NEXUS: [],
    };
    for (const d of monthDeployments) map[d.team].push(d);
    for (const key of Object.keys(map) as TeamKey[]) {
      map[key].sort((a, b) => a.deploy_date.localeCompare(b.deploy_date));
    }
    return map;
  }, [monthDeployments]);

  // Stack bars within a team row to avoid overlap.
  const stacked = useMemo(() => {
    const result = new Map<string, number>();
    for (const team of TEAM_KEYS) {
      const list = grouped[team];
      const stacks: string[][] = [];
      for (const d of list) {
        let placed = false;
        for (let i = 0; i < stacks.length; i++) {
          const lastId = stacks[i][stacks[i].length - 1];
          const last = list.find((x) => x.id === lastId);
          if (last && last.deploy_date !== d.deploy_date) {
            stacks[i].push(d.id);
            result.set(d.id, i);
            placed = true;
            break;
          }
        }
        if (!placed) {
          stacks.push([d.id]);
          result.set(d.id, stacks.length - 1);
        }
      }
    }
    return result;
  }, [grouped]);

  const rowMaxStacks = useMemo(() => {
    const max: Record<TeamKey, number> = {
      IDM: 1, DQA: 1, RMT: 1, PRT: 1, CDP: 1, MyConcerto: 1, NEXUS: 1,
    };
    for (const team of TEAM_KEYS) {
      let highest = 0;
      for (const d of grouped[team]) {
        const s = stacked.get(d.id) ?? 0;
        if (s > highest) highest = s;
      }
      max[team] = highest + 1;
    }
    return max;
  }, [grouped, stacked]);

  return (
    <motion.div
      key={`timeline-${format(currentDate, 'yyyy-MM')}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {format(currentDate, 'MMMM yyyy')} — Timeline
        </h2>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, -1))} aria-label="Previous month">
            <ChevronLeft size={16} />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))} aria-label="Next month">
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Date axis */}
          <div className="sticky top-0 z-10 grid grid-cols-[120px_1fr] border-b border-slate-200 bg-surface-light-primary px-2 py-2 text-[10px] font-medium text-slate-500 dark:border-slate-800 dark:bg-surface-dark-secondary dark:text-slate-400">
            <div className="font-display text-xs font-semibold uppercase tracking-wide">Team</div>
            <div
              className="grid"
              style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(0, 1fr))` }}
            >
              {days.map((d) => (
                <div key={d.toString()} className="text-center">
                  {format(d, 'd')}
                </div>
              ))}
            </div>
          </div>

          {/* Team rows */}
          {TEAM_KEYS.map((team) => {
            const team_meta = TEAMS[team];
            const list = grouped[team];
            const stacks = rowMaxStacks[team];
            const rowHeight = Math.max(ROW_HEIGHT, stacks * 32 + 24);
            return (
              <div
                key={team}
                className="grid grid-cols-[120px_1fr] border-b border-slate-200 dark:border-slate-800"
                style={{ height: `${rowHeight}px` }}
              >
                <div className="flex items-center gap-2 border-r border-slate-200 px-3 dark:border-slate-800">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: team_meta.color }} />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {team_meta.label}
                  </span>
                </div>
                <div className="relative">
                  {/* faint grid */}
                  <div
                    className="absolute inset-0 grid"
                    style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(0, 1fr))` }}
                  >
                    {days.map((d) => (
                      <div
                        key={d.toString()}
                        className="border-r border-slate-100 last:border-r-0 dark:border-slate-800/60"
                      />
                    ))}
                  </div>
                  {list.map((d) => {
                    const dayIdx = differenceInCalendarDays(parseISO(d.deploy_date), monthStart);
                    const leftPct = (dayIdx / totalDays) * 100;
                    const widthPct = (1 / totalDays) * 100;
                    return (
                      <TimelineBar
                        key={d.id}
                        deployment={d}
                        leftPct={leftPct}
                        widthPct={widthPct}
                        onClick={onDeploymentClick}
                        stackIndex={stacked.get(d.id) ?? 0}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
