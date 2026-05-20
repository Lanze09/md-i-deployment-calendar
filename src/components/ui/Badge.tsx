import type { ReactNode } from 'react';
import { cx } from '../../lib/utils';

export interface BadgeProps {
  color?: string;
  className?: string;
  children: ReactNode;
  size?: 'sm' | 'md';
}

export function Badge({ color, className, children, size = 'sm' }: BadgeProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-pill font-medium font-body whitespace-nowrap',
        sizeClass,
        !color && 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
        className,
      )}
      style={
        color
          ? {
              backgroundColor: `${color}1f`,
              color,
              boxShadow: `inset 0 0 0 1px ${color}66`,
            }
          : undefined
      }
    >
      {children}
    </span>
  );
}
