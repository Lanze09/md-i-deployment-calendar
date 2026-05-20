import { useMemo } from 'react';
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  applyFilters,
  detectConflicts,
  isDateFrozen,
  isSameISODate,
} from '../../lib/utils';
import type { Deployment } from '../../types';
import { CalendarDayCell } from './CalendarDayCell';
import { CalendarHeader } from './CalendarHeader';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface CalendarViewProps {
  onDeploymentClick: (d: Deployment) => void;
  onDeploymentContextMenu?: (d: Deployment, e: React.MouseEvent) => void;
}

export function CalendarView({
  onDeploymentClick,
  onDeploymentContextMenu,
}: CalendarViewProps) {
  const app = useApp();
  const { currentDate, setCurrentDate, deployments, freezePeriods, filters, selectedDate, setSelectedDate, openDeploymentModal } =
    app;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const days = useMemo(
    () => eachDayOfInterval({ start: gridStart, end: gridEnd }),
    [gridStart, gridEnd],
  );

  const filtered = useMemo(
    () => applyFilters(deployments.deployments, filters),
    [deployments.deployments, filters],
  );

  const filteredIds = useMemo(() => new Set(filtered.map((d) => d.id)), [filtered]);
  const dimmedIds = useMemo(() => {
    const dimmed = new Set<string>();
    for (const d of deployments.deployments) {
      if (!filteredIds.has(d.id)) dimmed.add(d.id);
    }
    return dimmed;
  }, [deployments.deployments, filteredIds]);

  const conflicts = useMemo(
    () => detectConflicts(deployments.deployments),
    [deployments.deployments],
  );
  const conflictByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of conflicts) {
      const existing = map.get(c.date) ?? 0;
      map.set(c.date, existing + 1);
    }
    return map;
  }, [conflicts]);

  const deploymentsByDate = useMemo(() => {
    const map = new Map<string, Deployment[]>();
    for (const d of deployments.deployments) {
      const list = map.get(d.deploy_date) ?? [];
      list.push(d);
      map.set(d.deploy_date, list);
    }
    return map;
  }, [deployments.deployments]);

  const handleSelect = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
  };

  const handleAdd = (date: Date) => {
    openDeploymentModal(null, format(date, 'yyyy-MM-dd'));
  };

  const prevMonth = () => setCurrentDate(addMonths(currentDate, -1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToday = () => setCurrentDate(new Date());

  return (
    <motion.div
      key={format(currentDate, 'yyyy-MM')}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-3"
      data-calendar-grid
    >
      <CalendarHeader
        currentDate={currentDate}
        onPrev={prevMonth}
        onNext={nextMonth}
        onToday={goToday}
      />

      <div className="grid grid-cols-7 gap-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-2 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, idx) => {
          const iso = format(day, 'yyyy-MM-dd');
          const inMonth = isSameMonth(day, currentDate);
          const deploymentsForDay = (deploymentsByDate.get(iso) ?? []).sort((a, b) =>
            (a.deploy_time_start ?? '99:99').localeCompare(b.deploy_time_start ?? '99:99'),
          );
          const freeze = isDateFrozen(iso, freezePeriods.freezePeriods);
          const conflictCount = conflictByDate.get(iso) ?? 0;
          const selected = selectedDate ? isSameISODate(selectedDate, day) : false;
          return (
            <CalendarDayCell
              key={iso}
              date={day}
              inCurrentMonth={inMonth}
              deployments={deploymentsForDay}
              dimmedIds={dimmedIds}
              freeze={freeze}
              conflictCount={conflictCount}
              selected={selected}
              index={idx}
              onSelect={handleSelect}
              onAdd={handleAdd}
              onDeploymentClick={onDeploymentClick}
              onDeploymentContextMenu={onDeploymentContextMenu}
            />
          );
        })}
      </div>

      {/* Print-only deployment list */}
      <div data-print-details>
        <h2 className="font-display text-base font-semibold">
          Deployments — {format(currentDate, 'MMMM yyyy')}
        </h2>
        <ul className="mt-2">
          {deployments.deployments
            .filter((d) => {
              const date = new Date(d.deploy_date);
              return isSameMonth(date, currentDate);
            })
            .sort((a, b) => a.deploy_date.localeCompare(b.deploy_date))
            .map((d) => (
              <li key={d.id}>
                <strong>{d.deploy_date}</strong> · {d.team} · {d.environment} ·{' '}
                {d.title} ({d.owner}) — {d.status}
              </li>
            ))}
        </ul>
      </div>

      {/* Subtly indicate end-of-grid for screen readers / debugging */}
      <span className="sr-only">
        Showing {format(addDays(gridStart, 0), 'MMM d')} through{' '}
        {format(gridEnd, 'MMM d, yyyy')}.
      </span>
    </motion.div>
  );
}
