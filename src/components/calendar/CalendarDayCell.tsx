import { motion } from 'framer-motion';
import { format, isToday } from 'date-fns';
import { cx } from '../../lib/utils';
import type { FreezePeriod } from '../../types';
import { ConflictIndicator } from './ConflictIndicator';

export interface CalendarDayCellProps {
  date: Date;
  inCurrentMonth: boolean;
  freeze: FreezePeriod | null;
  conflictCount: number;
  selected: boolean;
  index: number;
  onSelect: (date: Date) => void;
  onAdd: (date: Date) => void;
}

export function CalendarDayCell({
  date,
  inCurrentMonth,
  freeze,
  conflictCount,
  selected,
  index,
  onSelect,
  onAdd,
}: CalendarDayCellProps) {
  const today = isToday(date);
  return (
    <motion.div
      data-day-cell
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(0.4, index * 0.012), duration: 0.25 }}
      onClick={() => onSelect(date)}
      onDoubleClick={() => onAdd(date)}
      className={cx(
        'relative flex h-full cursor-pointer flex-col rounded-card border p-1.5 transition-colors',
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
        {conflictCount > 0 && (
          <ConflictIndicator
            count={conflictCount}
            description={`${conflictCount} cross-team conflict${conflictCount === 1 ? '' : 's'} on ${format(date, 'MMM d')}`}
          />
        )}
      </div>
    </motion.div>
  );
}
