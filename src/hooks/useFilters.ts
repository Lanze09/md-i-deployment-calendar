import { useCallback, useEffect, useState } from 'react';
import type {
  DeploymentStatus,
  EnvironmentName,
  FilterState,
  RiskLevel,
  TeamKey,
} from '../types';

const DEFAULT_FILTERS: FilterState = {
  teams: [],
  environments: [],
  statuses: [],
  riskLevels: [],
  search: '',
};

function readFromUrl(): FilterState {
  if (typeof window === 'undefined') return { ...DEFAULT_FILTERS };
  const params = new URLSearchParams(window.location.search);
  const csv = (key: string): string[] => {
    const v = params.get(key);
    return v ? v.split(',').filter(Boolean) : [];
  };
  return {
    teams: csv('teams') as TeamKey[],
    environments: csv('envs') as EnvironmentName[],
    statuses: csv('statuses') as DeploymentStatus[],
    riskLevels: csv('risks') as RiskLevel[],
    search: params.get('q') ?? '',
  };
}

function writeToUrl(filters: FilterState): void {
  const params = new URLSearchParams(window.location.search);
  const set = (key: string, list: string[]) => {
    if (list.length === 0) params.delete(key);
    else params.set(key, list.join(','));
  };
  set('teams', filters.teams);
  set('envs', filters.environments);
  set('statuses', filters.statuses);
  set('risks', filters.riskLevels);
  if (filters.search) params.set('q', filters.search);
  else params.delete('q');
  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
  window.history.replaceState(null, '', url);
}

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>(readFromUrl);

  useEffect(() => {
    writeToUrl(filters);
  }, [filters]);

  const toggle = useCallback(
    <K extends keyof Omit<FilterState, 'search'>>(key: K, value: FilterState[K][number]) => {
      setFilters((prev) => {
        const current = prev[key] as Array<typeof value>;
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [key]: next };
      });
    },
    [],
  );

  const setAll = useCallback(
    <K extends keyof Omit<FilterState, 'search'>>(key: K, values: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: values }));
    },
    [],
  );

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const clearAll = useCallback(() => setFilters({ ...DEFAULT_FILTERS }), []);

  return { filters, toggle, setAll, setSearch, clearAll };
}
