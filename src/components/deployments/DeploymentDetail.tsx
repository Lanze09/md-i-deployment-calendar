import { format, parseISO } from 'date-fns';
import { AlertTriangle, Clock, FileText, RotateCcw, ShieldAlert, User } from 'lucide-react';
import { TEAMS } from '../../constants/teams';
import { RISK_COLORS, STATUS_COLORS } from '../../constants/environments';
import { useApp } from '../../context/AppContext';
import { cx, deploymentConflicts, deploymentIsFrozen, deploymentSpanDays, effectiveColor } from '../../lib/utils';
import type { Deployment, FreezePeriod } from '../../types';
import { ConflictExplainer } from '../ai/ConflictExplainer';
import { DeploymentAISummary } from '../ai/DeploymentAISummary';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export interface DeploymentDetailProps {
  deployment: Deployment | null;
  allDeployments: Deployment[];
  freezePeriods: FreezePeriod[];
  onClose: () => void;
  onEdit: (d: Deployment) => void;
  onDelete: (d: Deployment) => void;
}

export function DeploymentDetail({
  deployment,
  allDeployments,
  freezePeriods,
  onClose,
  onEdit,
  onDelete,
}: DeploymentDetailProps) {
  const { selectedTool } = useApp();
  if (!deployment) return null;
  const team = TEAMS[deployment.team];
  const tint = effectiveColor(deployment, selectedTool);
  const conflicts = deploymentConflicts(deployment, allDeployments);
  const frozen = deploymentIsFrozen(deployment, freezePeriods);

  return (
    <Modal isOpen={Boolean(deployment)} onClose={onClose} size="lg" labelledBy="dep-detail-title">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color={tint}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tint }} />
                {team.label}
              </Badge>
              <Badge color={STATUS_COLORS[deployment.status]}>{deployment.status}</Badge>
              <Badge color={RISK_COLORS[deployment.risk_level]}>{deployment.risk_level} risk</Badge>
              <Badge>{deployment.environment}</Badge>
            </div>
            <h2 id="dep-detail-title" className="mt-2 font-display text-xl font-semibold text-slate-900 dark:text-slate-100">
              {deployment.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {team.fullName}
            </p>
          </div>
        </div>

        <DeploymentAISummary
          deployment={deployment}
          allDeployments={allDeployments}
          freezePeriods={freezePeriods}
        />

        {conflicts.length > 0 && (
          <div className="flex items-start gap-2 rounded-card border border-status-danger/40 bg-status-danger/10 px-3 py-2.5 text-sm">
            <AlertTriangle size={16} className="mt-0.5 text-status-danger" />
            <div>
              <div className="font-medium text-status-danger">
                Cross-team overlap on {deployment.environment} ({format(parseISO(deployment.deploy_date), 'MMM d')}
                {deployment.deploy_date !== deployment.deploy_end_date
                  ? ` – ${format(parseISO(deployment.deploy_end_date), 'MMM d')}`
                  : ''})
              </div>
              <ul className="mt-1 space-y-0.5 text-slate-700 dark:text-slate-300">
                {conflicts.map((c) => (
                  <li key={c.id}>
                    <strong>{TEAMS[c.team].label}</strong> · {c.title} ({c.owner})
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Consider staggering deployments to avoid environment contention.
              </p>
              <ConflictExplainer
                deployment={deployment}
                conflicts={conflicts}
                freezePeriods={freezePeriods}
              />
            </div>
          </div>
        )}

        {frozen && (
          <div className="flex items-start gap-2 rounded-card border border-status-warning/40 bg-status-warning/10 px-3 py-2.5 text-sm">
            <ShieldAlert size={16} className="mt-0.5 text-status-warning" />
            <div>
              <div className="font-medium text-status-warning">Inside freeze: {frozen.title}</div>
              <div className="text-slate-700 dark:text-slate-300">{frozen.reason}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <InfoRow icon={<Clock size={14} />} label="When">
            {deployment.deploy_date === deployment.deploy_end_date ? (
              <>{format(parseISO(deployment.deploy_date), 'EEEE, MMMM d, yyyy')}</>
            ) : (
              <>
                {format(parseISO(deployment.deploy_date), 'EEE, MMM d')}{' '}
                <span className="text-slate-400">→</span>{' '}
                {format(parseISO(deployment.deploy_end_date), 'EEE, MMM d, yyyy')}
                <span className="ml-2 text-xs text-slate-500">
                  ({deploymentSpanDays(deployment)} days)
                </span>
              </>
            )}
            {deployment.deploy_time_start && (
              <> · {deployment.deploy_time_start}
                {deployment.deploy_time_end ? `–${deployment.deploy_time_end}` : ''}
              </>
            )}
          </InfoRow>
          <InfoRow icon={<User size={14} />} label="Owner">
            {deployment.owner}
          </InfoRow>
        </div>

        {deployment.description && (
          <Section icon={<FileText size={14} />} title="Description">
            {deployment.description}
          </Section>
        )}

        {deployment.rollback_plan && (
          <Section icon={<RotateCcw size={14} />} title="Rollback plan">
            <code className="block whitespace-pre-wrap font-mono text-xs">
              {deployment.rollback_plan}
            </code>
          </Section>
        )}

        {deployment.notes && (
          <Section title="Notes">
            {deployment.notes}
          </Section>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
          <Button variant="danger" onClick={() => onDelete(deployment)}>
            Delete
          </Button>
          <Button onClick={() => onEdit(deployment)}>Edit deployment</Button>
        </div>
      </div>
    </Modal>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-slate-200 px-3 py-2 dark:border-slate-700">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {icon} {label}
      </div>
      <div className={cx('mt-1 text-sm text-slate-900 dark:text-slate-100')}>{children}</div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-slate-200 px-3 py-2 dark:border-slate-700">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {icon} {title}
      </div>
      <div className="mt-1 text-sm text-slate-700 dark:text-slate-300">{children}</div>
    </div>
  );
}
