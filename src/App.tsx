import { AnimatePresence } from 'framer-motion';
import { addMonths, format, parseISO } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { CalendarView } from './components/calendar/CalendarView';
import { DeploymentDetail } from './components/deployments/DeploymentDetail';
import { DeploymentList } from './components/deployments/DeploymentList';
import { DeploymentModal } from './components/deployments/DeploymentModal';
import { FreezePeriodModal } from './components/freeze/FreezePeriodModal';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { StatsBar } from './components/layout/StatsBar';
import { TimelineView } from './components/timeline/TimelineView';
import { WeekView } from './components/week/WeekView';
import { KeyboardShortcutsModal } from './components/ui/KeyboardShortcutsModal';
import { OnboardingTour } from './components/ui/OnboardingTour';
import { QuickStatusMenu } from './components/deployments/QuickStatusMenu';
import { Skeleton } from './components/ui/Skeleton';
import { ToastContainer } from './components/ui/ToastContainer';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { isSupabaseConfigured } from './lib/supabase';
import { isDateFrozen } from './lib/utils';
import type { Deployment, DeploymentStatus } from './types';

const ONBOARDING_KEY = 'mdi-cal-onboarded-v1';

function ShellInner() {
  const app = useApp();
  const {
    deployments,
    freezePeriods,
    view,
    setView,
    setCurrentDate,
    currentDate,
    openDeploymentModal,
    closeDeploymentModal,
    isDeploymentModalOpen,
    toasts,
    dismissToast,
    pushToast,
    selectedDate,
    setSelectedDate,
    theme,
  } = app;

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  );
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [detail, setDetail] = useState<Deployment | null>(null);
  const [quickMenu, setQuickMenu] = useState<
    { deployment: Deployment; x: number; y: number } | null
  >(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.localStorage.getItem(ONBOARDING_KEY)) {
      setTourOpen(true);
    }
  }, []);

  const handleCloseTour = () => {
    window.localStorage.setItem(ONBOARDING_KEY, '1');
    setTourOpen(false);
  };

  useKeyboardShortcuts(
    {
      newDeployment: () => openDeploymentModal(null, selectedDate ?? undefined),
      toggleTheme: theme.toggle,
      prevMonth: () => setCurrentDate(addMonths(currentDate, -1)),
      nextMonth: () => setCurrentDate(addMonths(currentDate, 1)),
      focusSearch: () => searchInputRef.current?.focus(),
      setView: (v) => setView(v),
      showHelp: () => setShortcutsOpen(true),
      closeAll: () => {
        setShortcutsOpen(false);
        setTourOpen(false);
        setQuickMenu(null);
        if (detail) setDetail(null);
        else if (isDeploymentModalOpen) closeDeploymentModal();
        else if (selectedDate) setSelectedDate(null);
      },
    },
    { enabled: true },
  );

  const handleStatusChange = async (status: DeploymentStatus) => {
    if (!quickMenu) return;
    try {
      await deployments.edit(quickMenu.deployment.id, { status });
      pushToast({ type: 'success', title: `Status updated to ${status}` });
    } catch (err) {
      pushToast({ type: 'error', title: 'Failed to update', description: (err as Error).message });
    } finally {
      setQuickMenu(null);
    }
  };

  const selectedDayDeployments = useMemo(() => {
    if (!selectedDate) return [];
    return deployments.deployments
      .filter((d) => d.deploy_date === selectedDate)
      .sort((a, b) => (a.deploy_time_start ?? '99:99').localeCompare(b.deploy_time_start ?? '99:99'));
  }, [selectedDate, deployments.deployments]);

  const selectedDayFreeze = useMemo(
    () => (selectedDate ? isDateFrozen(selectedDate, freezePeriods.freezePeriods) : null),
    [selectedDate, freezePeriods.freezePeriods],
  );

  return (
    <div className="min-h-screen pb-12">
      <a id="main" className="sr-only" tabIndex={-1}>
        Main
      </a>

      <Header
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onOpenTour={() => setTourOpen(true)}
        isDemo={!isSupabaseConfigured}
        searchInputRef={searchInputRef}
      />

      <div data-print-only className="mb-2 px-4 pt-3">
        <h1 className="font-display text-xl font-semibold">
          Accenture MD&amp;I — Deployment Calendar — {format(currentDate, 'MMMM yyyy')}
        </h1>
      </div>

      <StatsBar />

      <div className="flex flex-col gap-3 px-4 lg:flex-row lg:gap-4">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1">
          {deployments.loading ? (
            <CalendarSkeleton />
          ) : deployments.error ? (
            <div className="card p-6 text-sm text-status-danger">
              Failed to load deployments: {deployments.error.message}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {view === 'calendar' && (
                <CalendarView
                  key="cal"
                  onDeploymentClick={(d) => setDetail(d)}
                  onDeploymentContextMenu={(d, e) =>
                    setQuickMenu({ deployment: d, x: e.clientX, y: e.clientY })
                  }
                />
              )}
              {view === 'timeline' && (
                <TimelineView key="tl" onDeploymentClick={(d) => setDetail(d)} />
              )}
              {view === 'week' && (
                <WeekView key="wk" onDeploymentClick={(d) => setDetail(d)} />
              )}
            </AnimatePresence>
          )}
        </main>
      </div>

      <DeploymentList
        isOpen={Boolean(selectedDate) && !detail}
        dateIso={selectedDate}
        deployments={selectedDayDeployments}
        freeze={selectedDayFreeze}
        onClose={() => setSelectedDate(null)}
        onAdd={(dateIso) => openDeploymentModal(null, dateIso)}
        onSelect={(d) => setDetail(d)}
      />

      <DeploymentDetail
        deployment={detail}
        allDeployments={deployments.deployments}
        freezePeriods={freezePeriods.freezePeriods}
        onClose={() => setDetail(null)}
        onEdit={(d) => {
          setDetail(null);
          openDeploymentModal(d);
        }}
        onDelete={async (d) => {
          try {
            await deployments.remove(d.id);
            pushToast({ type: 'info', title: 'Deployment deleted', description: d.title });
            setDetail(null);
          } catch (err) {
            pushToast({
              type: 'error',
              title: 'Failed to delete',
              description: (err as Error).message,
            });
          }
        }}
      />

      <DeploymentModal />
      <FreezePeriodModal />

      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      <OnboardingTour isOpen={tourOpen} onClose={handleCloseTour} />

      <AnimatePresence>
        {quickMenu && (
          <QuickStatusMenu
            key="quick-menu"
            deployment={quickMenu.deployment}
            x={quickMenu.x}
            y={quickMenu.y}
            onSelect={handleStatusChange}
            onClose={() => setQuickMenu(null)}
          />
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <footer
        data-print-hide
        className="mt-10 px-4 text-center text-[11px] text-slate-400 dark:text-slate-500"
      >
        Built for Accenture MD&amp;I — AI in Action event, May 2026. Date today:{' '}
        {format(parseISO(format(new Date(), 'yyyy-MM-dd')), 'MMMM d, yyyy')}.
      </footer>
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-7 w-32" />
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ShellInner />
    </AppProvider>
  );
}
