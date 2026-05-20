import { useEffect, useRef, useState } from 'react';
import {
  CalendarDays,
  Columns3,
  Download,
  Filter,
  HelpCircle,
  KanbanSquare,
  Keyboard,
  Moon,
  Plus,
  Search,
  Snowflake,
  Sun,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  applyFilters,
  activeFilterCount,
  cx,
  defaultExportFilename,
  exportToCSV,
} from '../../lib/utils';
import type { ViewMode } from '../../types';
import { Button } from '../ui/Button';

export interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenShortcuts: () => void;
  onOpenTour: () => void;
  isDemo: boolean;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

const VIEWS: Array<{ id: ViewMode; label: string; icon: React.ReactNode }> = [
  { id: 'calendar', label: 'Calendar', icon: <CalendarDays size={14} /> },
  { id: 'timeline', label: 'Timeline', icon: <KanbanSquare size={14} /> },
  { id: 'week', label: 'Week', icon: <Columns3 size={14} /> },
];

export function Header({
  onToggleSidebar,
  onOpenShortcuts,
  onOpenTour,
  isDemo,
  searchInputRef,
}: HeaderProps) {
  const app = useApp();
  const { view, setView, theme, openDeploymentModal, setSearch, filters, deployments, currentDate, setFreezeModalOpen } = app;

  const [searchValue, setSearchValue] = useState(filters.search);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setSearch(searchValue);
    }, 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [searchValue, setSearch]);

  const handleExport = () => {
    const visible = applyFilters(deployments.deployments, filters);
    exportToCSV(visible, defaultExportFilename(currentDate));
  };

  const activeFilters = activeFilterCount(filters);

  return (
    <header
      data-print-hide
      className={cx(
        'sticky top-0 z-20 flex flex-col gap-2 border-b border-slate-200 bg-surface-light-primary/90 px-4 py-3 backdrop-blur',
        'dark:border-slate-800 dark:bg-surface-dark-primary/85',
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-btn bg-accenture-400 text-white font-display font-bold">
            ▶
          </span>
          <div>
            <h1 className="font-display text-lg font-semibold leading-tight text-slate-900 dark:text-slate-100">
              MD&amp;I Deployment Calendar
            </h1>
            <p className="text-[11px] leading-tight text-slate-500 dark:text-slate-400">
              Accenture Oracle Business Group
            </p>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search title or owner…  (F)"
              className="w-56 rounded-btn border border-slate-300 bg-white py-1.5 pl-7 pr-3 text-sm font-body text-slate-900 transition-colors focus:border-accenture-400 dark:border-slate-700 dark:bg-surface-dark-tertiary dark:text-slate-100"
              aria-label="Search deployments"
            />
          </div>

          <div className="flex rounded-btn border border-slate-300 bg-white p-0.5 dark:border-slate-700 dark:bg-surface-dark-tertiary">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={cx(
                  'flex items-center gap-1.5 rounded-btn px-2.5 py-1 text-xs font-medium transition-colors',
                  view === v.id
                    ? 'bg-accenture-400 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
                )}
                aria-label={`${v.label} view`}
              >
                {v.icon}
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleSidebar}
            aria-label="Toggle filters"
            className="relative"
          >
            <Filter size={14} />
            <span className="hidden md:inline">Filters</span>
            {activeFilters > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-[1rem] place-items-center rounded-full bg-accenture-400 px-1 text-[9px] font-bold text-white">
                {activeFilters}
              </span>
            )}
          </Button>

          <Button variant="secondary" size="sm" onClick={() => setFreezeModalOpen(true)} aria-label="Manage freeze periods">
            <Snowflake size={14} />
            <span className="hidden md:inline">Freezes</span>
          </Button>

          <Button variant="secondary" size="sm" onClick={handleExport} aria-label="Export CSV">
            <Download size={14} />
            <span className="hidden md:inline">Export</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={onOpenShortcuts} aria-label="Keyboard shortcuts">
            <Keyboard size={14} />
          </Button>

          <Button variant="ghost" size="sm" onClick={onOpenTour} aria-label="Replay onboarding tour">
            <HelpCircle size={14} />
          </Button>

          <Button variant="ghost" size="sm" onClick={theme.toggle} aria-label="Toggle theme">
            {theme.theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </Button>

          <Button onClick={() => openDeploymentModal(null)} size="sm">
            <Plus size={14} />
            <span className="hidden sm:inline">New</span>
          </Button>
        </div>
      </div>

      {isDemo && (
        <div className="rounded-btn border border-accenture-300/40 bg-accenture-400/5 px-3 py-1.5 text-[11px] text-accenture-700 dark:text-accenture-200">
          Running in demo mode — connect Supabase in <code className="font-mono">.env</code> for live data.
        </div>
      )}
    </header>
  );
}
