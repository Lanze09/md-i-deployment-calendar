import { supabase, isSupabaseConfigured } from './supabase';
import { DEMO_DEPLOYMENTS, DEMO_FREEZE_PERIODS } from './demoData';
import type {
  Deployment,
  DeploymentInput,
  FreezePeriod,
  FreezePeriodInput,
} from '../types';

const DEPLOYMENTS_TABLE = 'deployments';
const FREEZE_TABLE = 'freeze_periods';

const memory = {
  deployments: [...DEMO_DEPLOYMENTS] as Deployment[],
  freezePeriods: [...DEMO_FREEZE_PERIODS] as FreezePeriod[],
};

const randomId = (): string =>
  globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// =====================================================================
// Deployments
// =====================================================================

export async function getDeployments(): Promise<Deployment[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [...memory.deployments];
  }
  const { data, error } = await supabase
    .from(DEPLOYMENTS_TABLE)
    .select('*')
    .order('deploy_date', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Deployment[];
}

export async function createDeployment(input: DeploymentInput): Promise<Deployment> {
  if (!isSupabaseConfigured || !supabase) {
    const created: Deployment = { id: randomId(), ...input };
    memory.deployments = [...memory.deployments, created];
    return created;
  }
  const { data, error } = await supabase
    .from(DEPLOYMENTS_TABLE)
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Deployment;
}

export async function updateDeployment(
  id: string,
  patch: Partial<DeploymentInput>,
): Promise<Deployment> {
  if (!isSupabaseConfigured || !supabase) {
    const idx = memory.deployments.findIndex((d) => d.id === id);
    if (idx < 0) throw new Error(`Deployment ${id} not found`);
    const updated: Deployment = { ...memory.deployments[idx], ...patch };
    memory.deployments = [
      ...memory.deployments.slice(0, idx),
      updated,
      ...memory.deployments.slice(idx + 1),
    ];
    return updated;
  }
  const { data, error } = await supabase
    .from(DEPLOYMENTS_TABLE)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Deployment;
}

export async function deleteDeployment(id: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    memory.deployments = memory.deployments.filter((d) => d.id !== id);
    return;
  }
  const { error } = await supabase.from(DEPLOYMENTS_TABLE).delete().eq('id', id);
  if (error) throw error;
}

// =====================================================================
// Freeze periods
// =====================================================================

export async function getFreezePeriods(): Promise<FreezePeriod[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [...memory.freezePeriods];
  }
  const { data, error } = await supabase
    .from(FREEZE_TABLE)
    .select('*')
    .order('start_date', { ascending: true });
  if (error) throw error;
  return (data ?? []) as FreezePeriod[];
}

export async function createFreezePeriod(input: FreezePeriodInput): Promise<FreezePeriod> {
  if (!isSupabaseConfigured || !supabase) {
    const created: FreezePeriod = { id: randomId(), ...input };
    memory.freezePeriods = [...memory.freezePeriods, created];
    return created;
  }
  const { data, error } = await supabase
    .from(FREEZE_TABLE)
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as FreezePeriod;
}

export async function updateFreezePeriod(
  id: string,
  patch: Partial<FreezePeriodInput>,
): Promise<FreezePeriod> {
  if (!isSupabaseConfigured || !supabase) {
    const idx = memory.freezePeriods.findIndex((f) => f.id === id);
    if (idx < 0) throw new Error(`Freeze period ${id} not found`);
    const updated: FreezePeriod = { ...memory.freezePeriods[idx], ...patch };
    memory.freezePeriods = [
      ...memory.freezePeriods.slice(0, idx),
      updated,
      ...memory.freezePeriods.slice(idx + 1),
    ];
    return updated;
  }
  const { data, error } = await supabase
    .from(FREEZE_TABLE)
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as FreezePeriod;
}

export async function deleteFreezePeriod(id: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    memory.freezePeriods = memory.freezePeriods.filter((f) => f.id !== id);
    return;
  }
  const { error } = await supabase.from(FREEZE_TABLE).delete().eq('id', id);
  if (error) throw error;
}
