import { useMemo } from 'react';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  applyFilters,
  detectConflicts,
} from '../../lib/utils';
import type { Deployment } from '../../types';
import { CalendarHeader } from './CalendarHeader';
import { CalendarWeekRow, rangeIntersectsWeek } from './CalendarWeekRow';

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
  const {
    currentDate,
    setCurrentDate,
    deployments,
    freezePeriods,
    filters,
    selectedDate,
    setSelectedDate,
    openDeploymentModal,
  } = app;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);

  const weekStarts = useMemo(() => {
    const out: Date[] = [];
    let cursor = gridStart;
    while (cursor <= gridEnd) {
      out.push(cursor);
      cursor = addDays(cursor, 7);
    }
    return out;
  }, [gridStart, gridEnd]);

  const filtered = useMemo(
    () => applyFilters(deployments.deployments, filters, app.selectedTool),
    [deployments.deployments, filters, app.selectedTool],
  );

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

  const handleSelect = (date: Date) =>
    setSelectedDate(format(date, 'yyyy-MM-dd'));

  const handleAdd = (date: Date) =>
    openDeploymentModal(null, format(date, 'yyyy-MM-dd'));

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

      <div className="flex flex-col gap-1.5">
        {weekStarts.map((ws, idx) => {
          const we = endOfWeek(ws);
          const weekDeployments = filtered.filter((d) => rangeIntersectsWeek(d, ws, we));
          return (
            <CalendarWeekRow
              key={format(ws, 'yyyy-MM-dd')}
              weekStart={ws}
              monthStart={monthStart}
              monthEnd={monthEnd}
              weekDeployments={weekDeployments}
              conflictByDate={conflictByDate}
              freezePeriods={freezePeriods.freezePeriods}
              selectedDate={selectedDate}
              selectedTool={app.selectedTool}
              weekIndex={idx}
              onSelectDay={handleSelect}
              onAddDay={handleAdd}
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
              const start = parseISO(d.deploy_date);
              const end = parseISO(d.deploy_end_date);
              return (
                isSameMonth(start, currentDate) || isSameMonth(end, currentDate)
              );
            })
            .sort((a, b) => a.deploy_date.localeCompare(b.deploy_date))
            .map((d) => (
              <li key={d.id}>
                <strong>
                  {d.deploy_date}
                  {d.deploy_date !== d.deploy_end_date ? ` → ${d.deploy_end_date}` : ''}
                </strong>{' '}
                · {d.team} · {d.environment} · {d.title} ({d.owner}) — {d.status}
              </li>
            ))}
        </ul>
      </div>
    </motion.div>
  );
}
