export type TeamKey = 'IDM' | 'DQA' | 'RMT' | 'PRT' | 'CDP' | 'MyConcerto' | 'NEXUS';

export type EnvironmentName =
  | 'Development'
  | 'Test / QA'
  | 'UAT'
  | 'Staging'
  | 'Production';

export type DeploymentStatus =
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Failed'
  | 'Cancelled'
  | 'Rolled Back';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ViewMode = 'calendar' | 'timeline' | 'week';

export interface Deployment {
  id: string;
  title: string;
  description: string | null;
  team: TeamKey;
  environment: EnvironmentName;
  deploy_date: string;
  deploy_time_start: string | null;
  deploy_time_end: string | null;
  status: DeploymentStatus;
  owner: string;
  risk_level: RiskLevel;
  rollback_plan: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export type DeploymentInput = Omit<Deployment, 'id' | 'created_at' | 'updated_at'>;

export interface FreezePeriod {
  id: string;
  title: string;
  reason: string | null;
  start_date: string;
  end_date: string;
  affected_environments: EnvironmentName[];
  created_at?: string;
}

export type FreezePeriodInput = Omit<FreezePeriod, 'id' | 'created_at'>;

export interface FilterState {
  teams: TeamKey[];
  environments: EnvironmentName[];
  statuses: DeploymentStatus[];
  riskLevels: RiskLevel[];
  search: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}

export interface Conflict {
  date: string;
  environment: EnvironmentName;
  deployments: Deployment[];
}
