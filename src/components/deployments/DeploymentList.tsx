import { AnimatePresence, motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Plus, X } from 'lucide-react';
import { TEAMS } from '../../constants/teams';
import { STATUS_COLORS } from '../../constants/environments';
import { cx } from '../../lib/utils';
import type { Deployment, FreezePeriod } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

export interface DeploymentListProps {
  isOpen: boolean;
  dateIso: string | null;
  deployments: Deployment[];
  freeze: FreezePeriod | null;
  onClose: () => void;
  onAdd: (dateIso: string) => void;
  onSelect: (d: Deployment) => void;
}

export function DeploymentList({
  isOpen,
  dateIso,
  deployments,
  freeze,
  onClose,
  onAdd,
  onSelect,
}: DeploymentListProps) {
  return (
    <AnimatePresence>
      {isOpen && dateIso && (
        <>
          <motion.div
            className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-[2px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className={cx(
              'fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col',
              'bg-surface-light-primary shadow-2xl dark:bg-surface-dark-secondary',
              'border-l border-slate-200 dark:border-slate-800',
            )}
            data-print-hide
            aria-label="Deployments for selected day"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <div>
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {format(parseISO(dateIso), 'EEEE, MMMM d')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {deployments.length} deployment{deployments.length === 1 ? '' : 's'}
                  {freeze && ' · inside freeze window'}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close panel"
                className="rounded-btn p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-surface-dark-tertiary"
              >
                <X size={18} />
              </button>
            </div>

            {freeze && (
              <div className="mx-4 mt-3 rounded-card border border-status-warning/40 bg-status-warning/10 px-3 py-2 text-xs">
                <div className="font-semibold text-status-warning">{freeze.title}</div>
                <div className="text-slate-600 dark:text-slate-300">{freeze.reason}</div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4">
              {deployments.length === 0 ? (
                <EmptyState
                  title="No deployments scheduled"
                  description="Looks calm — schedule one with the button below."
                />
              ) : (
                <ul className="space-y-2">
                  {deployments.map((d, idx) => {
                    const team = TEAMS[d.team];
                    return (
                      <motion.li
                        key={d.id}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                      >
                        <button
                          onClick={() => onSelect(d)}
                          className="w-full rounded-card border border-slate-200 bg-surface-light-primary p-3 text-left transition-colors hover:border-accenture-300 dark:border-slate-700 dark:bg-surface-dark-tertiary dark:hover:border-accenture-300"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <Badge color={team.color}>{team.label}</Badge>
                                <Badge color={STATUS_COLORS[d.status]}>{d.status}</Badge>
                                <span className="text-[10px] uppercase tracking-wide text-slate-500">
                                  {d.environment}
                                </span>
                              </div>
                              <h4 className="mt-1.5 truncate font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {d.title}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {d.deploy_time_start
                                  ? `${d.deploy_time_start}${d.deploy_time_end ? `–${d.deploy_time_end}` : ''} · `
                                  : ''}
                                {d.owner}
                                {d.deploy_date !== d.deploy_end_date && (
                                  <span className="ml-1 text-[10px] uppercase tracking-wide text-slate-400">
                                    · {d.deploy_date} → {d.deploy_end_date}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border-t border-slate-200 p-4 dark:border-slate-800">
              <Button onClick={() => onAdd(dateIso)} className="w-full">
                <Plus size={14} /> Add deployment for this day
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
