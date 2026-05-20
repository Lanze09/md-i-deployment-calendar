import { AnimatePresence, motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { cx } from '../../lib/utils';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  placement?: 'top' | 'bottom';
}

export function Tooltip({ content, children, className, placement = 'top' }: TooltipProps) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className={cx('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, y: placement === 'top' ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            className={cx(
              'pointer-events-none absolute left-1/2 z-40 -translate-x-1/2 whitespace-nowrap rounded-btn px-2 py-1 text-xs text-white shadow-lg',
              'bg-slate-900 dark:bg-slate-700',
              placement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
            )}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
