import {
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  isWithinInterval,
  max as maxDate,
  min as minDate,
  parseISO,
  startOfDay,
} from 'date-fns';
import Papa from 'papaparse';
import { TEAMS } from '../constants/teams';
import type {
  Conflict,
  Deployment,
  FilterState,
  FreezePeriod,
  ToolSelection,
} from '../types';

export const DATE_FMT = 'yyyy-MM-dd';

export const formatDate = (date: Date, fmt = DATE_FMT): string => format(date, fmt);

export const toDate = (iso: string): Date => parseISO(iso);

export const isSameISODate = (iso: string, date: Date): boolean =>
  iso === format(date, DATE_FMT);

export const daysUntil = (iso: string): number =>
  differenceInCalendarDays(parseISO(iso), startOfDay(new Date()));

// ---------------------------------------------------------------------
// Range helpers
// ---------------------------------------------------------------------
export function deploymentRange(
  d: Pick<Deployment, 'deploy_date' | 'deploy_end_date'>,
): { start: Date; end: Date } {
  const start = parseISO(d.deploy_date);
  const end = parseISO(d.deploy_end_date);
  return { start, end: end < start ? start : end };
}

export function deploymentSpanDays(
  d: Pick<Deployment, 'deploy_date' | 'deploy_end_date'>,
): number {
  const { start, end } = deploymentRange(d);
  return differenceInCalendarDays(end, start) + 1;
}

export function deploymentContainsDate(
  d: Pick<Deployment, 'deploy_date' | 'deploy_end_date'>,
  iso: string,
): boolean {
  return d.deploy_date <= iso && iso <= d.deploy_end_date;
}

export function rangesOverlap(
  a: Pick<Deployment, 'deploy_date' | 'deploy_end_date'>,
  b: Pick<Deployment, 'deploy_date' | 'deploy_end_date'>,
): boolean {
  return a.deploy_date <= b.deploy_end_date && b.deploy_date <= a.deploy_end_date;
}

// ---------------------------------------------------------------------
// Conflict detection — same env + overlapping range across 2+ teams
// ---------------------------------------------------------------------
export function detectConflicts(deployments: Deployment[]): Conflict[] {
  const active = deployments.filter((d) => d.status !== 'Cancelled');
  const byEnv = new Map<string, Deployment[]>();
  for (const d of active) {
    const list = byEnv.get(d.environment) ?? [];
    list.push(d);
    byEnv.set(d.environment, list);
  }
  const out = new Map<string, Conflict>();
  for (const [env, list] of byEnv) {
    list.sort((a, b) => a.deploy_date.localeCompare(b.deploy_date));
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        if (a.deploy_end_date < b.deploy_date) break;
        if (!rangesOverlap(a, b)) continue;
        if (a.team === b.team) continue;
        const overlapStart = a.deploy_date > b.deploy_date ? a.deploy_date : b.deploy_date;
        const overlapEnd = a.deploy_end_date < b.deploy_end_date ? a.deploy_end_date : b.deploy_end_date;
        for (const iso of eachDayInRange(overlapStart, overlapEnd)) {
          const key = `${iso}|${env}`;
          const existing = out.get(key);
          if (existing) {
            if (!existing.deployments.includes(a)) existing.deployments.push(a);
            if (!existing.deployments.includes(b)) existing.deployments.push(b);
          } else {
            out.set(key, {
              date: iso,
              environment: env as Conflict['environment'],
              deployments: [a, b],
            });
          }
        }
      }
    }
  }
  return Array.from(out.values());
}

function eachDayInRange(startIso: string, endIso: string): string[] {
  const days = eachDayOfInterval({ start: parseISO(startIso), end: parseISO(endIso) });
  return days.map((d) => format(d, DATE_FMT));
}

export function deploymentConflicts(
  deployment: Deployment,
  allDeployments: Deployment[],
): Deployment[] {
  return allDeployments.filter(
    (d) =>
      d.id !== deployment.id &&
      d.status !== 'Cancelled' &&
      d.environment === deployment.environment &&
      d.team !== deployment.team &&
      rangesOverlap(d, deployment),
  );
}

// ---------------------------------------------------------------------
// Freeze period helpers
// ---------------------------------------------------------------------
export function isDateFrozen(
  iso: string,
  freezePeriods: FreezePeriod[],
): FreezePeriod | null {
  const date = parseISO(iso);
  for (const f of freezePeriods) {
    const start = parseISO(f.start_date);
    const end = parseISO(f.end_date);
    if (isWithinInterval(date, { start, end })) return f;
  }
  return null;
}

export function deploymentIsFrozen(
  deployment: Pick<Deployment, 'deploy_date' | 'deploy_end_date' | 'environment'>,
  freezePeriods: FreezePeriod[],
): FreezePeriod | null {
  for (const f of freezePeriods) {
    if (f.start_date > deployment.deploy_end_date) continue;
    if (f.end_date < deployment.deploy_date) continue;
    if (
      f.affected_environments.length === 0 ||
      f.affected_environments.includes(deployment.environment)
    ) {
      return f;
    }
  }
  return null;
}

/** Clip a deployment's range to the visible window [windowStart, windowEnd] (both ISO strings). Returns null if outside. */
export function clipRangeToWindow(
  d: Pick<Deployment, 'deploy_date' | 'deploy_end_date'>,
  windowStart: Date,
  windowEnd: Date,
): { start: Date; end: Date } | null {
  const { start, end } = deploymentRange(d);
  if (end < windowStart || start > windowEnd) return null;
  return { start: maxDate([start, windowStart]), end: minDate([end, windowEnd]) };
}

// ---------------------------------------------------------------------
// Filter application
// ---------------------------------------------------------------------
export function applyFilters(
  deployments: Deployment[],
  filters: FilterState,
  selectedTool: ToolSelection = 'all',
): Deployment[] {
  const search = filters.search.trim().toLowerCase();
  const enhancementFilterActive = selectedTool !== 'all' && filters.enhancements.length > 0;
  return deployments.filter((d) => {
    if (selectedTool !== 'all' && d.team !== selectedTool) return false;
    if (enhancementFilterActive && !filters.enhancements.includes(d.id)) return false;
    if (filters.environments.length && !filters.environments.includes(d.environment))
      return false;
    if (filters.statuses.length && !filters.statuses.includes(d.status)) return false;
    if (filters.riskLevels.length && !filters.riskLevels.includes(d.risk_level)) return false;
    if (search) {
      const hay = `${d.title} ${d.owner} ${d.description ?? ''}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}

export function activeFilterCount(
  filters: FilterState,
  selectedTool: ToolSelection = 'all',
): number {
  return (
    filters.environments.length +
    filters.statuses.length +
    filters.riskLevels.length +
    (selectedTool !== 'all' ? filters.enhancements.length : 0) +
    (filters.search.trim() ? 1 : 0)
  );
}

/**
 * Resolve the colour to use for a deployment's bar:
 * - **All-tools** view → always the tool's signature colour (so bars group visually by tool).
 * - **Single-tool focus** → the per-enhancement custom colour if set, otherwise the tool's colour.
 */
export function effectiveColor(
  d: Pick<Deployment, 'team' | 'color'>,
  selectedTool: ToolSelection,
): string {
  if (selectedTool === 'all') return TEAMS[d.team].color;
  return d.color ?? TEAMS[d.team].color;
}

// ---------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------
export function exportToCSV(deployments: Deployment[], filename: string): void {
  const rows = deployments.map((d) => ({
    'Start Date': d.deploy_date,
    'End Date': d.deploy_end_date,
    Team: d.team,
    Environment: d.environment,
    Title: d.title,
    Owner: d.owner,
    Status: d.status,
    'Risk Level': d.risk_level,
    'Start Time': d.deploy_time_start ?? '',
    'End Time': d.deploy_time_end ?? '',
    Description: d.description ?? '',
  }));
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function defaultExportFilename(date: Date): string {
  return `deployments-${format(date, 'MMMM-yyyy').toLowerCase()}.csv`;
}

// ---------------------------------------------------------------------
// Class name helper
// ---------------------------------------------------------------------
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
