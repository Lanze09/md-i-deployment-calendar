import { motion } from 'framer-motion';
import { format, isSameDay, isToday } from 'date-fns';
import { cx } from '../../lib/utils';
import type { Deployment, FreezePeriod } from '../../types';
import { DeploymentBadge } from './DeploymentBadge';
import { ConflictIndicator } from './ConflictIndicator';

export interface CalendarDayCellProps {
  date: Date;
  inCurrentMonth: boolean;
  deployments: Deployment[];
  dimmedIds: Set<string>;
  freeze: FreezePeriod | null;
  conflictCount: number;
  selected: boolean;
  index: number;
  onSelect: (date: Date) => void;
  onAdd: (date: Date) => void;
  onDeploymentClick: (deployment: Deployment) => void;
  onDeploymentContextMenu?: (deployment: Deployment, e: React.MouseEvent) => void;
}

const MAX_VISIBLE = 3;

export function CalendarDayCell({
  date,
  inCurrentMonth,
  deployments,
  dimmedIds,
  freeze,
  conflictCount,
  selected,
  index,
  onSelect,
  onAdd,
  onDeploymentClick,
  onDeploymentContextMenu,
}: CalendarDayCellProps) {
  const visible = deployments.slice(0, MAX_VISIBLE);
  const overflow = Math.max(0, deployments.length - MAX_VISIBLE);
  const today = isToday(date);

  return (
    <motion.div
      data-day-cell
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(0.4, index * 0.012), duration: 0.25 }}
      whileHover={{ scale: 1.015 }}
      onClick={() => onSelect(date)}
      onDoubleClick={() => onAdd(date)}
      className={cx(
        'relative flex h-32 cursor-pointer flex-col gap-1 rounded-card border p-1.5 transition-colors',
        'bg-surface-light-primary border-slate-200 hover:border-accenture-300',
        'dark:bg-surface-dark-secondary dark:border-slate-800 dark:hover:border-accenture-300',
        !inCurrentMonth && 'opacity-50',
        selected && 'ring-2 ring-accenture-400',
        today && 'ring-2 ring-accenture-400/70',
        freeze && 'bg-freeze-stripes dark:bg-freeze-stripes-dark',
      )}
      role="button"
      tabIndex={0}
      aria-label={`${format(date, 'EEEE, MMMM d, yyyy')}${freeze ? ` — frozen: ${freeze.title}` : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(date);
        }
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className={cx(
            'font-display text-sm font-semibold',
            today
              ? 'rounded-full bg-accenture-400 px-1.5 py-0.5 text-white'
              : 'text-slate-700 dark:text-slate-200',
          )}
        >
          {format(date, 'd')}
        </span>
        <div className="flex items-center gap-1">
          {conflictCount > 0 && (
            <ConflictIndicator
              count={conflictCount}
              description={`${conflictCount} conflict${conflictCount === 1 ? '' : 's'} on ${format(date, 'MMM d')}`}
            />
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
        {visible.map((d) => (
          <DeploymentBadge
            key={d.id}
            deployment={d}
            dim={dimmedIds.has(d.id)}
            onClick={onDeploymentClick}
            onContextMenu={onDeploymentContextMenu}
          />
        ))}
        {overflow > 0 && (
          <span className="mt-auto text-[10px] font-medium text-slate-500 dark:text-slate-400">
            +{overflow} more
          </span>
        )}
      </div>
    </motion.div>
  );
}

// Re-export same-day check for callers
export const isSameCalendarDay = isSameDay;
