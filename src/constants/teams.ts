import type { TeamKey } from '../types';

export interface TeamMeta {
  label: string;
  fullName: string;
  color: string;
  bg: string;
}

export const TEAMS: Record<TeamKey, TeamMeta> = {
  IDM: { label: 'IDM', fullName: 'Intelligent Data Migration', color: '#A100FF', bg: 'bg-team-idm' },
  DQA: { label: 'DQA', fullName: 'Data Quality Accelerator', color: '#00B140', bg: 'bg-team-dqa' },
  RMT: { label: 'RMT', fullName: 'Release Management Tool', color: '#0070F3', bg: 'bg-team-rmt' },
  PRT: { label: 'PRT', fullName: 'Payroll Tool', color: '#F5A623', bg: 'bg-team-prt' },
  CDP: { label: 'CDP', fullName: 'Cloud Deployment Platform', color: '#E4002B', bg: 'bg-team-cdp' },
  MyConcerto: { label: 'MyConcerto', fullName: 'Orchestration Tool', color: '#00C2CE', bg: 'bg-team-myconcerto' },
  NEXUS: { label: 'NEXUS', fullName: 'Integration Hub', color: '#FF6B35', bg: 'bg-team-nexus' },
};

export const TEAM_KEYS: TeamKey[] = Object.keys(TEAMS) as TeamKey[];
