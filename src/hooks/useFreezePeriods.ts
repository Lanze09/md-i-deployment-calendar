import { useCallback, useEffect, useState } from 'react';
import {
  createFreezePeriod,
  deleteFreezePeriod,
  getFreezePeriods,
  updateFreezePeriod,
} from '../lib/database';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { FreezePeriod, FreezePeriodInput } from '../types';

export interface UseFreezePeriodsResult {
  freezePeriods: FreezePeriod[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  add: (input: FreezePeriodInput) => Promise<FreezePeriod>;
  edit: (id: string, patch: Partial<FreezePeriodInput>) => Promise<FreezePeriod>;
  remove: (id: string) => Promise<void>;
}

export function useFreezePeriods(): UseFreezePeriodsResult {
  const [freezePeriods, setFreezePeriods] = useState<FreezePeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFreezePeriods();
      setFreezePeriods(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;
    const channel = client
      .channel('freeze-periods-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'freeze_periods' },
        () => {
          refresh();
        },
      )
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }, [refresh]);

  const add = useCallback(async (input: FreezePeriodInput) => {
    const created = await createFreezePeriod(input);
    setFreezePeriods((prev) => [...prev, created]);
    return created;
  }, []);

  const edit = useCallback(async (id: string, patch: Partial<FreezePeriodInput>) => {
    const updated = await updateFreezePeriod(id, patch);
    setFreezePeriods((prev) => prev.map((f) => (f.id === id ? updated : f)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteFreezePeriod(id);
    setFreezePeriods((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return { freezePeriods, loading, error, refresh, add, edit, remove };
}
