import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { STATUSES, STATUS_COLORS } from '../../constants/environments';
import { cx } from '../../lib/utils';
import type { Deployment, DeploymentStatus } from '../../types';

export interface QuickStatusMenuProps {
  deployment: Deployment;
  x: number;
  y: number;
  onSelect: (status: DeploymentStatus) => void;
  onClose: () => void;
}

export function QuickStatusMenu({
  deployment,
  x,
  y,
  onSelect,
  onClose,
}: QuickStatusMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
      className="fixed z-[70] w-52 overflow-hidden rounded-card border border-slate-200 bg-surface-light-primary shadow-xl dark:border-slate-700 dark:bg-surface-dark-secondary"
      style={{ top: y, left: x }}
      role="menu"
    >
      <div className="border-b border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
        Set status
      </div>
      <ul className="py-1">
        {STATUSES.map((s) => (
          <li key={s}>
            <button
              onClick={() => onSelect(s)}
              className={cx(
                'flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors',
                'hover:bg-slate-100 dark:hover:bg-surface-dark-tertiary',
                s === deployment.status && 'font-semibold',
              )}
              role="menuitem"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[s] }}
              />
              <span>{s}</span>
              {s === deployment.status && (
                <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-400">
                  current
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
