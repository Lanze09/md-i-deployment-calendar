import { useMemo } from 'react';
import {
  addDays,
  differenceInCalendarDays,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
} from 'date-fns';
import { clipRangeToWindow, effectiveColor, isDateFrozen, isSameISODate } from '../../lib/utils';
import type { Deployment, FreezePeriod, ToolSelection } from '../../types';
import { CalendarDayCell } from './CalendarDayCell';
import {
  SpanningBar,
  SPANNING_BAR_LANE_GAP,
  SPANNING_BAR_LANE_HEIGHT,
} from './SpanningBar';

const TOP_PADDING = 22; // room above the lane stack for the date number
const MAX_VISIBLE_LANES = 3;

export interface CalendarWeekRowProps {
  weekStart: Date;
  monthStart: Date;
  monthEnd: Date;
  /** Filtered deployments whose range overlaps this week */
  weekDeployments: Deployment[];
  /** Map ISO date → count of cross-team conflicts on that day */
  conflictByDate: Map<string, number>;
  freezePeriods: FreezePeriod[];
  selectedDate: string | null;
  selectedTool: ToolSelection;
  weekIndex: number;
  onSelectDay: (date: Date) => void;
  onAddDay: (date: Date) => void;
  onDeploymentClick: (d: Deployment) => void;
  onDeploymentContextMenu?: (d: Deployment, e: React.MouseEvent) => void;
}

interface Segment {
  deployment: Deployment;
  startCol: number;
  span: number;
  isStart: boolean;
  isEnd: boolean;
  /** Assigned lane index */
  lane?: number;
}

export function CalendarWeekRow({
  weekStart,
  monthStart,
  monthEnd,
  weekDeployments,
  conflictByDate,
  freezePeriods,
  selectedDate,
  selectedTool,
  weekIndex,
  onSelectDay,
  onAddDay,
  onDeploymentClick,
  onDeploymentContextMenu,
}: CalendarWeekRowProps) {
  const weekEnd = endOfWeek(weekStart);
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  // Build segments — one per filtered deployment-in-this-week.
  const segments = useMemo<Segment[]>(() => {
    const segs: Segment[] = [];
    for (const d of weekDeployments) {
      const clip = clipRangeToWindow(d, weekStart, weekEnd);
      if (!clip) continue;
      const startCol = differenceInCalendarDays(clip.start, weekStart);
      const span = differenceInCalendarDays(clip.end, clip.start) + 1;
      const isStart = isSameISODate(d.deploy_date, clip.start);
      const isEnd = isSameISODate(d.deploy_end_date, clip.end);
      segs.push({ deployment: d, startCol, span, isStart, isEnd });
    }
    // Stable lane assignment: longer spans first, then earlier start.
    segs.sort((a, b) => {
      if (b.span !== a.span) return b.span - a.span;
      return a.startCol - b.startCol;
    });
    const laneEndCols: number[] = [];
    for (const seg of segs) {
      let placed = false;
      for (let i = 0; i < laneEndCols.length; i++) {
        if (laneEndCols[i] <= seg.startCol) {
          laneEndCols[i] = seg.startCol + seg.span;
          seg.lane = i;
          placed = true;
          break;
        }
      }
      if (!placed) {
        seg.lane = laneEndCols.length;
        laneEndCols.push(seg.startCol + seg.span);
      }
    }
    return segs;
  }, [weekDeployments, weekStart, weekEnd]);

  const visibleSegs = useMemo(
    () => segments.filter((s) => (s.lane ?? 0) < MAX_VISIBLE_LANES),
    [segments],
  );

  const hiddenByDay = useMemo(() => {
    const map = new Map<number, number>();
    for (const s of segments) {
      if ((s.lane ?? 0) < MAX_VISIBLE_LANES) continue;
      for (let i = 0; i < s.span; i++) {
        const col = s.startCol + i;
        map.set(col, (map.get(col) ?? 0) + 1);
      }
    }
    return map;
  }, [segments]);

  const maxVisibleLane = useMemo(
    () => visibleSegs.reduce((m, s) => Math.max(m, (s.lane ?? 0) + 1), 0),
    [visibleSegs],
  );

  const overlayHeight = TOP_PADDING + maxVisibleLane * (SPANNING_BAR_LANE_HEIGHT + SPANNING_BAR_LANE_GAP);
  const baseRowHeight = 96;
  const rowHeight = Math.max(baseRowHeight, overlayHeight + 24);

  return (
    <div className="relative" style={{ height: `${rowHeight}px` }}>
      {/* Day-cell backgrounds */}
      <div className="grid h-full grid-cols-7 gap-1.5">
        {days.map((day, i) => {
          const iso = format(day, 'yyyy-MM-dd');
          const inMonth = day >= monthStart && day <= monthEnd;
          const hidden = hiddenByDay.get(i) ?? 0;
          return (
            <div key={iso} className="relative h-full">
              <CalendarDayCell
                date={day}
                inCurrentMonth={inMonth}
                freeze={isDateFrozen(iso, freezePeriods)}
                conflictCount={conflictByDate.get(iso) ?? 0}
                selected={selectedDate ? isSameISODate(selectedDate, day) : false}
                index={weekIndex * 7 + i}
                onSelect={onSelectDay}
                onAdd={onAddDay}
              />
              {hidden > 0 && (
                <span className="pointer-events-none absolute bottom-1 right-1 rounded-pill bg-slate-200/90 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 dark:bg-slate-700/80 dark:text-slate-200">
                  +{hidden} more
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Spanning-bar overlay — pointer-events:none lets empty space fall through
          to day cells; each <SpanningBar> is a <button> that handles its own clicks. */}
      <div
        className="pointer-events-none absolute inset-x-0"
        style={{
          top: `${TOP_PADDING + 6}px`,
          height: `${maxVisibleLane * (SPANNING_BAR_LANE_HEIGHT + SPANNING_BAR_LANE_GAP)}px`,
        }}
      >
        {visibleSegs.map((seg) => (
          <SpanningBar
            key={`${seg.deployment.id}-${weekIndex}`}
            deployment={seg.deployment}
            color={effectiveColor(seg.deployment, selectedTool)}
            startCol={seg.startCol}
            span={seg.span}
            isStart={seg.isStart}
            isEnd={seg.isEnd}
            lane={seg.lane ?? 0}
            onClick={onDeploymentClick}
            onContextMenu={onDeploymentContextMenu}
          />
        ))}
      </div>
    </div>
  );
}

/** Returns the start-of-week Date for a given date (used for grouping). */
export function weekKey(d: Date): string {
  return format(startOfWeek(d), 'yyyy-MM-dd');
}

/** Returns true if the deployment range intersects the given week. */
export function rangeIntersectsWeek(
  d: Pick<Deployment, 'deploy_date' | 'deploy_end_date'>,
  weekStart: Date,
  weekEnd: Date,
): boolean {
  const wsIso = format(weekStart, 'yyyy-MM-dd');
  const weIso = format(weekEnd, 'yyyy-MM-dd');
  return d.deploy_date <= weIso && d.deploy_end_date >= wsIso;
}

/** Find the parsed-ISO equivalent for date-fns interop. */
export function parseISODate(iso: string): Date {
  return parseISO(iso);
}
