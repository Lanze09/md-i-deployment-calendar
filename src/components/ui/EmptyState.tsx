import type { ReactNode } from 'react';
import { CalendarX } from 'lucide-react';
import { cx } from '../../lib/utils';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center rounded-card p-8 text-center',
        className,
      )}
    >
      <div className="mb-3 text-slate-400 dark:text-slate-500">
        {icon ?? <CalendarX size={40} strokeWidth={1.5} />}
      </div>
      <h3 className="font-display text-base font-semibold text-slate-700 dark:text-slate-200">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
