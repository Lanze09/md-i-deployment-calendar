import { useEffect, useMemo, useState } from 'react';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { AlertTriangle, Clock4 } from 'lucide-react';
import { TEAMS } from '../../constants/teams';
import { STATUS_COLORS } from '../../constants/environments';
import {
  applyFilters,
  cx,
  daysUntil,
  detectConflicts,
} from '../../lib/utils';
import type { Deployment, DeploymentStatus, TeamKey } from '../../types';
import { useApp } from '../../context/AppContext';

const STATUS_BUCKETS: DeploymentStatus[] = ['Scheduled', 'In Progress', 'Completed', 'Failed'];

export function StatsBar() {
  const app = useApp();
  const { deployments, filters, currentDate } = app;

  const filtered = useMemo(
    () => applyFilters(deployments.deployments, filters, app.selectedTool),
    [deployments.deployments, filters, app.selectedTool],
  );

  const monthDeployments = useMemo(() => {
    const ms = format(startOfMonth(currentDate), 'yyyy-MM-dd');
    const me = format(endOfMonth(currentDate), 'yyyy-MM-dd');
    return filtered.filter((d) => d.deploy_date <= me && d.deploy_end_date >= ms);
  }, [filtered, currentDate]);

  const statusCounts = useMemo(() => {
    const counts: Record<DeploymentStatus, number> = {
      Scheduled: 0,
      'In Progress': 0,
      Completed: 0,
      Failed: 0,
      Cancelled: 0,
      'Rolled Back': 0,
    };
    for (const d of monthDeployments) counts[d.status]++;
    return counts;
  }, [monthDeployments]);

  const conflictCount = useMemo(
    () => {
      const ms = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const me = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      return detectConflicts(filtered).filter((c) => c.date >= ms && c.date <= me).length;
    },
    [filtered, currentDate],
  );

  const teamCounts = useMemo(() => {
    const counts: Partial<Record<TeamKey, number>> = {};
    for (const d of monthDeployments) {
      counts[d.team] = (counts[d.team] ?? 0) + 1;
    }
    return counts;
  }, [monthDeployments]);

  const mostActive = useMemo(() => {
    let top: TeamKey | null = null;
    let topN = 0;
    for (const [team, n] of Object.entries(teamCounts) as Array<[TeamKey, number]>) {
      if (n > topN) {
        topN = n;
        top = team;
      }
    }
    return { team: top, count: topN };
  }, [teamCounts]);

  const nextUp = useMemo<Deployment | null>(() => {
    const upcoming = filtered
      .filter((d) => d.status === 'Scheduled' || d.status === 'In Progress')
      .filter((d) => daysUntil(d.deploy_date) >= 0)
      .sort((a, b) => a.deploy_date.localeCompare(b.deploy_date));
    return upcoming[0] ?? null;
  }, [filtered]);

  return (
    <div
      data-print-hide
      className="grid grid-cols-2 gap-2 px-4 py-3 sm:grid-cols-3 lg:grid-cols-5"
    >
      <StatTile label="Total this month" value={<CountUp value={monthDeployments.length} />}>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {STATUS_BUCKETS.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 text-[10px] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s] }} />
              {statusCounts[s]}
            </span>
          ))}
        </div>
      </StatTile>

      <StatTile
        label="Conflicts"
        value={<CountUp value={conflictCount} />}
        valueClass={conflictCount > 0 ? 'text-status-danger' : ''}
        icon={conflictCount > 0 ? <AlertTriangle size={16} className="text-status-danger" /> : undefined}
      />

      <StatTile
        label="Most active team"
        value={
          mostActive.team ? (
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: TEAMS[mostActive.team].color }} />
              <span style={{ color: TEAMS[mostActive.team].color }}>{TEAMS[mostActive.team].label}</span>
              <span className="ml-1 text-xs text-slate-500">·  {mostActive.count}</span>
            </span>
          ) : (
            <span className="text-slate-400">—</span>
          )
        }
      />

      <StatTile
        label="Next deployment"
        value={
          nextUp ? (
            <span className="block truncate text-base">{nextUp.title}</span>
          ) : (
            <span className="text-slate-400">No upcoming</span>
          )
        }
      >
        {nextUp && (
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <Clock4 size={12} />
            <span>
              {nextUp.owner} ·{' '}
              {(() => {
                const n = daysUntil(nextUp.deploy_date);
                if (n === 0) return 'today';
                if (n === 1) return 'tomorrow';
                return `in ${n} days`;
              })()}
            </span>
          </div>
        )}
      </StatTile>

      <StatTile label="Filtered" value={<CountUp value={filtered.length} />}>
        <div className="mt-1 text-[10px] text-slate-500">
          of {deployments.deployments.length} total
        </div>
      </StatTile>
    </div>
  );
}

function StatTile({
  label,
  value,
  children,
  icon,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="card flex flex-col px-3 py-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
          {label}
        </span>
        {icon}
      </div>
      <div className={cx('mt-0.5 font-display text-xl font-semibold text-slate-900 dark:text-slate-100', valueClass)}>
        {value}
      </div>
      {children}
    </div>
  );
}

function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const steps = 18;
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      const next = Math.round(start + (diff * i) / steps);
      setDisplay(next);
      if (i >= steps) {
        setDisplay(value);
        window.clearInterval(id);
      }
    }, 18);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{display}</>;
}
