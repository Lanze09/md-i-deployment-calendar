import type { DeploymentStatus, EnvironmentName, RiskLevel } from '../types';

export const ENVIRONMENTS: EnvironmentName[] = [
  'Development',
  'Test / QA',
  'UAT',
  'Staging',
  'Production',
];

export const STATUSES: DeploymentStatus[] = [
  'Scheduled',
  'In Progress',
  'Completed',
  'Failed',
  'Cancelled',
  'Rolled Back',
];

export const RISK_LEVELS: RiskLevel[] = ['Low', 'Medium', 'High', 'Critical'];

export const STATUS_COLORS: Record<DeploymentStatus, string> = {
  Scheduled: '#0070F3',
  'In Progress': '#F5A623',
  Completed: '#00B140',
  Failed: '#E4002B',
  Cancelled: '#6B7280',
  'Rolled Back': '#9333EA',
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  Low: '#00B140',
  Medium: '#F5A623',
  High: '#FF6B35',
  Critical: '#E4002B',
};
