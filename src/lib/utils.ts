import {
  differenceInCalendarDays,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
} from 'date-fns';
import Papa from 'papaparse';
import type {
  Conflict,
  Deployment,
  FilterState,
  FreezePeriod,
} from '../types';

export const DATE_FMT = 'yyyy-MM-dd';

export const formatDate = (date: Date, fmt = DATE_FMT): string => format(date, fmt);

export const toDate = (iso: string): Date => parseISO(iso);

export const isSameISODate = (iso: string, date: Date): boolean =>
  iso === format(date, DATE_FMT);

export const daysUntil = (iso: string): number =>
  differenceInCalendarDays(parseISO(iso), startOfDay(new Date()));

// ---------------------------------------------------------------------
// Conflict detection — same env + same date for 2+ different teams
// ---------------------------------------------------------------------
export function detectConflicts(deployments: Deployment[]): Conflict[] {
  const grouped = new Map<string, Deployment[]>();
  for (const d of deployments) {
    if (d.status === 'Cancelled') continue;
    const key = `${d.deploy_date}|${d.environment}`;
    const list = grouped.get(key) ?? [];
    list.push(d);
    grouped.set(key, list);
  }
  const conflicts: Conflict[] = [];
  for (const [key, list] of grouped) {
    const distinctTeams = new Set(list.map((d) => d.team));
    if (distinctTeams.size >= 2) {
      const [date, environment] = key.split('|');
      conflicts.push({
        date,
        environment: environment as Conflict['environment'],
        deployments: list,
      });
    }
  }
  return conflicts;
}

export function deploymentConflicts(
  deployment: Deployment,
  allDeployments: Deployment[],
): Deployment[] {
  return allDeployments.filter(
    (d) =>
      d.id !== deployment.id &&
      d.status !== 'Cancelled' &&
      d.deploy_date === deployment.deploy_date &&
      d.environment === deployment.environment &&
      d.team !== deployment.team,
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
  deployment: Pick<Deployment, 'deploy_date' | 'environment'>,
  freezePeriods: FreezePeriod[],
): FreezePeriod | null {
  const frozen = isDateFrozen(deployment.deploy_date, freezePeriods);
  if (!frozen) return null;
  if (
    frozen.affected_environments.length === 0 ||
    frozen.affected_environments.includes(deployment.environment)
  ) {
    return frozen;
  }
  return null;
}

// ---------------------------------------------------------------------
// Filter application
// ---------------------------------------------------------------------
export function applyFilters(
  deployments: Deployment[],
  filters: FilterState,
): Deployment[] {
  const search = filters.search.trim().toLowerCase();
  return deployments.filter((d) => {
    if (filters.teams.length && !filters.teams.includes(d.team)) return false;
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

export function activeFilterCount(filters: FilterState): number {
  return (
    filters.teams.length +
    filters.environments.length +
    filters.statuses.length +
    filters.riskLevels.length +
    (filters.search.trim() ? 1 : 0)
  );
}

// ---------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------
export function exportToCSV(deployments: Deployment[], filename: string): void {
  const rows = deployments.map((d) => ({
    Date: d.deploy_date,
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
