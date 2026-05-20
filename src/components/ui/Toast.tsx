import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';
import type { ToastMessage } from '../../types';
import { cx } from '../../lib/utils';

const ICON_MAP = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
} as const;

const COLOR_MAP: Record<ToastMessage['type'], string> = {
  success: 'text-status-success',
  error: 'text-status-danger',
  info: 'text-status-info',
  warning: 'text-status-warning',
};

export interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const Icon = ICON_MAP[toast.type];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={cx(
        'flex w-80 items-start gap-3 rounded-card p-3 shadow-lg',
        'bg-surface-light-primary border border-slate-200',
        'dark:bg-surface-dark-secondary dark:border-slate-700',
      )}
      role="status"
    >
      <Icon size={20} className={cx('mt-0.5 flex-shrink-0', COLOR_MAP[toast.type])} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {toast.title}
        </p>
        {toast.description && (
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="rounded-btn p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
