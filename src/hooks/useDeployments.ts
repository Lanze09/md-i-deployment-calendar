import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createDeployment,
  deleteDeployment,
  getDeployments,
  updateDeployment,
} from '../lib/database';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Deployment, DeploymentInput } from '../types';

export interface UseDeploymentsResult {
  deployments: Deployment[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  add: (input: DeploymentInput) => Promise<Deployment>;
  edit: (id: string, patch: Partial<DeploymentInput>) => Promise<Deployment>;
  remove: (id: string) => Promise<void>;
}

export interface UseDeploymentsOptions {
  onRealtimeInsert?: (deployment: Deployment) => void;
  onRealtimeUpdate?: (deployment: Deployment) => void;
  onRealtimeDelete?: (id: string) => void;
}

export function useDeployments(options: UseDeploymentsOptions = {}): UseDeploymentsResult {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const optsRef = useRef(options);
  optsRef.current = options;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDeployments();
      setDeployments(data);
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
      .channel('deployments-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'deployments' },
        (payload) => {
          const row = payload.new as Deployment;
          setDeployments((prev) => (prev.some((d) => d.id === row.id) ? prev : [...prev, row]));
          optsRef.current.onRealtimeInsert?.(row);
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'deployments' },
        (payload) => {
          const row = payload.new as Deployment;
          setDeployments((prev) => prev.map((d) => (d.id === row.id ? row : d)));
          optsRef.current.onRealtimeUpdate?.(row);
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'deployments' },
        (payload) => {
          const row = payload.old as { id: string };
          setDeployments((prev) => prev.filter((d) => d.id !== row.id));
          optsRef.current.onRealtimeDelete?.(row.id);
        },
      )
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }, []);

  const add = useCallback(async (input: DeploymentInput) => {
    const created = await createDeployment(input);
    setDeployments((prev) => (prev.some((d) => d.id === created.id) ? prev : [...prev, created]));
    return created;
  }, []);

  const edit = useCallback(async (id: string, patch: Partial<DeploymentInput>) => {
    const updated = await updateDeployment(id, patch);
    setDeployments((prev) => prev.map((d) => (d.id === id ? updated : d)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteDeployment(id);
    setDeployments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return { deployments, loading, error, refresh, add, edit, remove };
}
