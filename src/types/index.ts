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
  /** ISO date — first day of the deployment / enhancement window */
  deploy_date: string;
  /** ISO date — last day of the deployment / enhancement window (inclusive). Equal to deploy_date for single-day items. */
  deploy_end_date: string;
  deploy_time_start: string | null;
  deploy_time_end: string | null;
  status: DeploymentStatus;
  owner: string;
  risk_level: RiskLevel;
  rollback_plan: string | null;
  notes: string | null;
  /** Per-enhancement bar colour (CSS hex). When null, falls back to the tool's signature colour. Used in single-tool focus mode; tool colour is always used in All-tools view. */
  color: string | null;
  created_at?: string;
  updated_at?: string;
}

export type ToolSelection = TeamKey | 'all';

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
  environments: EnvironmentName[];
  statuses: DeploymentStatus[];
  riskLevels: RiskLevel[];
  /** Deployment IDs — only applied when a specific tool is selected. Empty array = no filter. */
  enhancements: string[];
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
