import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useDeployments, type UseDeploymentsResult } from '../hooks/useDeployments';
import { useFilters } from '../hooks/useFilters';
import { useFreezePeriods, type UseFreezePeriodsResult } from '../hooks/useFreezePeriods';
import { useTheme } from '../hooks/useTheme';
import type {
  Deployment,
  FilterState,
  ToastMessage,
  ViewMode,
} from '../types';

export interface AppContextValue {
  deployments: UseDeploymentsResult;
  freezePeriods: UseFreezePeriodsResult;
  filters: FilterState;
  toggleFilter: ReturnType<typeof useFilters>['toggle'];
  setAllFilters: ReturnType<typeof useFilters>['setAll'];
  setSearch: ReturnType<typeof useFilters>['setSearch'];
  clearFilters: () => void;
  theme: ReturnType<typeof useTheme>;
  view: ViewMode;
  setView: (v: ViewMode) => void;
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  selectedDate: string | null;
  setSelectedDate: (iso: string | null) => void;
  editingDeployment: Deployment | null;
  setEditingDeployment: (d: Deployment | null) => void;
  isDeploymentModalOpen: boolean;
  openDeploymentModal: (d?: Deployment | null, dateIso?: string) => void;
  closeDeploymentModal: () => void;
  isFreezeModalOpen: boolean;
  setFreezeModalOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const TOAST_TTL = 4000;

export function AppProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const { filters, toggle, setAll, setSearch, clearAll } = useFilters();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const next: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, next]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_TTL);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const deployments = useDeployments({
    onRealtimeInsert: (row) =>
      pushToast({
        type: 'success',
        title: 'New deployment added',
        description: `${row.title} by ${row.owner}`,
      }),
    onRealtimeUpdate: (row) =>
      pushToast({
        type: 'info',
        title: 'Deployment updated',
        description: row.title,
      }),
    onRealtimeDelete: () =>
      pushToast({
        type: 'info',
        title: 'Deployment removed',
      }),
  });

  const freezePeriods = useFreezePeriods();

  const [view, setView] = useState<ViewMode>('calendar');
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingDeployment, setEditingDeployment] = useState<Deployment | null>(null);
  const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState(false);
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const [isFreezeModalOpen, setFreezeModalOpen] = useState(false);

  const openDeploymentModal = useCallback(
    (d?: Deployment | null, dateIso?: string) => {
      setEditingDeployment(d ?? null);
      setPendingDate(dateIso ?? null);
      setIsDeploymentModalOpen(true);
    },
    [],
  );

  const closeDeploymentModal = useCallback(() => {
    setIsDeploymentModalOpen(false);
    setEditingDeployment(null);
    setPendingDate(null);
  }, []);

  const clearFilters = useCallback(() => clearAll(), [clearAll]);

  const value = useMemo<AppContextValue>(
    () => ({
      deployments,
      freezePeriods,
      filters,
      toggleFilter: toggle,
      setAllFilters: setAll,
      setSearch,
      clearFilters,
      theme,
      view,
      setView,
      currentDate,
      setCurrentDate,
      selectedDate: selectedDate ?? pendingDate,
      setSelectedDate,
      editingDeployment,
      setEditingDeployment,
      isDeploymentModalOpen,
      openDeploymentModal,
      closeDeploymentModal,
      isFreezeModalOpen,
      setFreezeModalOpen,
      toasts,
      pushToast,
      dismissToast,
    }),
    [
      deployments,
      freezePeriods,
      filters,
      toggle,
      setAll,
      setSearch,
      clearFilters,
      theme,
      view,
      currentDate,
      selectedDate,
      pendingDate,
      editingDeployment,
      isDeploymentModalOpen,
      openDeploymentModal,
      closeDeploymentModal,
      isFreezeModalOpen,
      toasts,
      pushToast,
      dismissToast,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <AppProvider>');
  return ctx;
}
