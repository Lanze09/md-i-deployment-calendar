import { useMemo } from 'react';
import {
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
} from 'date-fns';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TEAMS, TEAM_KEYS } from '../../constants/teams';
import { applyFilters, effectiveColor } from '../../lib/utils';
import type { Deployment, TeamKey } from '../../types';
import { Button } from '../ui/Button';
import { TimelineBar } from './TimelineBar';

const ROW_HEIGHT_TEAM = 80;
const ROW_HEIGHT_DEPLOY = 44;

export interface TimelineViewProps {
  onDeploymentClick: (d: Deployment) => void;
}

export function TimelineView({ onDeploymentClick }: TimelineViewProps) {
  const app = useApp();
  const { currentDate, setCurrentDate, deployments, filters, selectedTool } = app;
  const singleTool = selectedTool !== 'all';

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const totalDays = differenceInCalendarDays(monthEnd, monthStart) + 1;
  const days = useMemo(
    () => eachDayOfInterval({ start: monthStart, end: monthEnd }),
    [monthStart, monthEnd],
  );

  const filtered = useMemo(
    () => applyFilters(deployments.deployments, filters, selectedTool),
    [deployments.deployments, filters, selectedTool],
  );

  const monthDeployments = useMemo(
    () =>
      filtered.filter(
        (d) =>
          d.deploy_date <= format(monthEnd, 'yyyy-MM-dd') &&
          d.deploy_end_date >= format(monthStart, 'yyyy-MM-dd'),
      ),
    [filtered, monthStart, monthEnd],
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

  // Lane assignment for the per-team view (only relevant in All-tools mode).
  const stackedByTeam = useMemo(() => {
    const result = new Map<string, number>();
    for (const team of TEAM_KEYS) {
      const list = [...grouped[team]];
      const laneEnds: string[] = [];
      for (const d of list) {
        let placed = false;
        for (let i = 0; i < laneEnds.length; i++) {
          if (laneEnds[i] < d.deploy_date) {
            laneEnds[i] = d.deploy_end_date;
            result.set(d.id, i);
            placed = true;
            break;
          }
        }
        if (!placed) {
          laneEnds.push(d.deploy_end_date);
          result.set(d.id, laneEnds.length - 1);
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
        const s = stackedByTeam.get(d.id) ?? 0;
        if (s > highest) highest = s;
      }
      max[team] = highest + 1;
    }
    return max;
  }, [grouped, stackedByTeam]);

  // For single-tool mode: a flat list of deployments belonging to the chosen tool, sorted.
  const toolDeployments = useMemo(() => {
    if (!singleTool) return [];
    return [...monthDeployments].sort(
      (a, b) => a.deploy_date.localeCompare(b.deploy_date) || a.title.localeCompare(b.title),
    );
  }, [monthDeployments, singleTool]);

  const positionOf = (d: Deployment): { leftPct: number; widthPct: number } => {
    const start = parseISO(d.deploy_date);
    const end = parseISO(d.deploy_end_date);
    const clippedStart = start < monthStart ? monthStart : start;
    const clippedEnd = end > monthEnd ? monthEnd : end;
    const startIdx = differenceInCalendarDays(clippedStart, monthStart);
    const spanDays = differenceInCalendarDays(clippedEnd, clippedStart) + 1;
    return {
      leftPct: (startIdx / totalDays) * 100,
      widthPct: (spanDays / totalDays) * 100,
    };
  };

  return (
    <motion.div
      key={`timeline-${format(currentDate, 'yyyy-MM')}-${selectedTool}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {format(currentDate, 'MMMM yyyy')} — Timeline
          {singleTool && (
            <span className="ml-2 align-middle text-base font-normal text-slate-500 dark:text-slate-400">
              · {selectedTool}
            </span>
          )}
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
          <div className="sticky top-0 z-10 grid grid-cols-[220px_1fr] border-b border-slate-200 bg-surface-light-primary px-2 py-2 text-[10px] font-medium text-slate-500 dark:border-slate-800 dark:bg-surface-dark-secondary dark:text-slate-400">
            <div className="font-display text-xs font-semibold uppercase tracking-wide">
              {singleTool ? 'Deployment' : 'Tool'}
            </div>
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

          {singleTool
            ? // ---------- Per-deployment rows ----------
              (toolDeployments.length === 0 ? (
                <div className="grid grid-cols-[220px_1fr]">
                  <div className="px-3 py-6 text-sm text-slate-400">No deployments</div>
                  <div />
                </div>
              ) : (
                toolDeployments.map((d) => {
                  const { leftPct, widthPct } = positionOf(d);
                  const color = effectiveColor(d, selectedTool);
                  return (
                    <div
                      key={d.id}
                      className="grid grid-cols-[220px_1fr] border-b border-slate-200 dark:border-slate-800"
                      style={{ height: `${ROW_HEIGHT_DEPLOY}px` }}
                    >
                      <button
                        type="button"
                        onClick={() => onDeploymentClick(d)}
                        className="flex min-w-0 items-center gap-2 border-r border-slate-200 px-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-surface-dark-tertiary"
                      >
                        <span
                          className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="min-w-0 truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                          {d.title}
                        </span>
                        <span className="ml-auto truncate text-[10px] uppercase tracking-wide text-slate-400">
                          {d.environment}
                        </span>
                      </button>
                      <div className="relative">
                        <div
                          className="absolute inset-0 grid"
                          style={{
                            gridTemplateColumns: `repeat(${totalDays}, minmax(0, 1fr))`,
                          }}
                        >
                          {days.map((dd) => (
                            <div
                              key={dd.toString()}
                              className="border-r border-slate-100 last:border-r-0 dark:border-slate-800/60"
                            />
                          ))}
                        </div>
                        <TimelineBar
                          deployment={d}
                          color={color}
                          leftPct={leftPct}
                          widthPct={widthPct}
                          onClick={onDeploymentClick}
                          stackIndex={0}
                        />
                      </div>
                    </div>
                  );
                })
              ))
            : // ---------- Per-tool rows ----------
              TEAM_KEYS.map((team) => {
                const team_meta = TEAMS[team];
                const list = grouped[team];
                const stacks = rowMaxStacks[team];
                const rowHeight = Math.max(ROW_HEIGHT_TEAM, stacks * 32 + 24);
                return (
                  <div
                    key={team}
                    className="grid grid-cols-[220px_1fr] border-b border-slate-200 dark:border-slate-800"
                    style={{ height: `${rowHeight}px` }}
                  >
                    <div className="flex items-center gap-2 border-r border-slate-200 px-3 dark:border-slate-800">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: team_meta.color }}
                      />
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {team_meta.label}
                      </span>
                    </div>
                    <div className="relative">
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
                        const { leftPct, widthPct } = positionOf(d);
                        return (
                          <TimelineBar
                            key={d.id}
                            deployment={d}
                            color={effectiveColor(d, selectedTool)}
                            leftPct={leftPct}
                            widthPct={widthPct}
                            onClick={onDeploymentClick}
                            stackIndex={stackedByTeam.get(d.id) ?? 0}
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
