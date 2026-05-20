import { cx } from '../../lib/utils';

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cx(
        'skeleton-shimmer rounded-btn bg-slate-200 dark:bg-slate-800',
        className,
      )}
    />
  );
}
