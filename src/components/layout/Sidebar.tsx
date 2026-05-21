import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ENVIRONMENTS,
  RISK_COLORS,
  RISK_LEVELS,
  STATUSES,
  STATUS_COLORS,
} from '../../constants/environments';
import { effectiveColor } from '../../lib/utils';
import { FreezePeriodOverlay } from '../freeze/FreezePeriodOverlay';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const app = useApp();
  const {
    filters,
    toggleFilter,
    setAllFilters,
    clearFilters,
    freezePeriods,
    selectedTool,
    deployments,
  } = app;

  // Deployments belonging to the currently-selected tool, sorted by start date.
  // Only used when a specific tool is selected (not "All tools").
  const toolDeployments = useMemo(() => {
    if (selectedTool === 'all') return [];
    return deployments.deployments
      .filter((d) => d.team === selectedTool)
      .sort((a, b) => a.deploy_date.localeCompare(b.deploy_date));
  }, [deployments.deployments, selectedTool]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-[2px] lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -360 }}
            animate={{ x: 0 }}
            exit={{ x: -360 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="fixed left-0 top-0 z-40 flex h-full w-80 flex-col border-r border-slate-200 bg-surface-light-primary p-4 shadow-xl dark:border-slate-800 dark:bg-surface-dark-secondary lg:static lg:z-auto lg:shadow-none"
            data-print-hide
            aria-label="Filters"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                Filters
              </h2>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
                <button
                  onClick={onClose}
                  className="rounded-btn p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-surface-dark-tertiary lg:hidden"
                  aria-label="Close filters"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto pr-1">
              {selectedTool !== 'all' && toolDeployments.length > 0 && (
                <FilterGroup
                  title={`Deployments — ${selectedTool}`}
                  onSelectAll={() =>
                    setAllFilters('enhancements', toolDeployments.map((d) => d.id))
                  }
                  onClear={() => setAllFilters('enhancements', [])}
                >
                  {toolDeployments.map((d) => (
                    <Checkbox
                      key={d.id}
                      checked={filters.enhancements.includes(d.id)}
                      onChange={() => toggleFilter('enhancements', d.id)}
                      dotColor={effectiveColor(d, selectedTool)}
                      label={
                        <>
                          {d.title}
                          <span className="ml-1 text-[10px] uppercase tracking-wide text-slate-400">
                            · {d.environment}
                          </span>
                        </>
                      }
                    />
                  ))}
                </FilterGroup>
              )}

              <FilterGroup
                title="Environments"
                onSelectAll={() => setAllFilters('environments', [...ENVIRONMENTS])}
                onClear={() => setAllFilters('environments', [])}
              >
                {ENVIRONMENTS.map((env) => (
                  <Checkbox
                    key={env}
                    checked={filters.environments.includes(env)}
                    onChange={() => toggleFilter('environments', env)}
                    label={env}
                  />
                ))}
              </FilterGroup>

              <FilterGroup
                title="Status"
                onSelectAll={() => setAllFilters('statuses', [...STATUSES])}
                onClear={() => setAllFilters('statuses', [])}
              >
                {STATUSES.map((s) => (
                  <Checkbox
                    key={s}
                    checked={filters.statuses.includes(s)}
                    onChange={() => toggleFilter('statuses', s)}
                    dotColor={STATUS_COLORS[s]}
                    label={s}
                  />
                ))}
              </FilterGroup>

              <FilterGroup
                title="Risk level"
                onSelectAll={() => setAllFilters('riskLevels', [...RISK_LEVELS])}
                onClear={() => setAllFilters('riskLevels', [])}
              >
                {RISK_LEVELS.map((r) => (
                  <Checkbox
                    key={r}
                    checked={filters.riskLevels.includes(r)}
                    onChange={() => toggleFilter('riskLevels', r)}
                    dotColor={RISK_COLORS[r]}
                    label={r}
                  />
                ))}
              </FilterGroup>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Freeze periods
                </h3>
                <FreezePeriodOverlay
                  freezePeriods={freezePeriods.freezePeriods}
                  className="space-y-2"
                />
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function FilterGroup({
  title,
  children,
  onSelectAll,
  onClear,
}: {
  title: string;
  children: React.ReactNode;
  onSelectAll: () => void;
  onClear: () => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </h3>
        <div className="flex gap-1 text-[10px]">
          <button
            onClick={onSelectAll}
            className="text-accenture-400 hover:underline"
          >
            All
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={onClear}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
          >
            None
          </button>
        </div>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
