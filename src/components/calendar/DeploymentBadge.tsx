import { motion } from 'framer-motion';
import { TEAMS } from '../../constants/teams';
import { cx } from '../../lib/utils';
import type { Deployment } from '../../types';

export interface DeploymentBadgeProps {
  deployment: Deployment;
  /** Optional override colour. Falls back to tool's signature colour. */
  color?: string;
  onClick?: (deployment: Deployment) => void;
  onContextMenu?: (deployment: Deployment, e: React.MouseEvent) => void;
  dim?: boolean;
  size?: 'sm' | 'md';
  showEnv?: boolean;
}

export function DeploymentBadge({
  deployment,
  color,
  onClick,
  onContextMenu,
  dim,
  size = 'sm',
  showEnv = false,
}: DeploymentBadgeProps) {
  const tint = color ?? TEAMS[deployment.team].color;
  const isFailed = deployment.status === 'Failed';
  const isCancelled = deployment.status === 'Cancelled';

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(deployment);
      }}
      onContextMenu={(e) => {
        if (!onContextMenu) return;
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(deployment, e);
      }}
      className={cx(
        'group flex w-full items-center gap-1.5 truncate rounded-pill text-left font-medium font-body transition-all',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
        dim && 'opacity-25',
        isCancelled && 'line-through opacity-60',
      )}
      style={{
        backgroundColor: `${tint}26`,
        color: tint,
        boxShadow: `inset 0 0 0 1px ${tint}66`,
      }}
      title={`${deployment.title} — ${deployment.owner} (${deployment.environment})`}
    >
      <span
        className={cx(
          'h-1.5 w-1.5 flex-shrink-0 rounded-full',
          isFailed && 'animate-pulse-soft',
        )}
        style={{ backgroundColor: tint }}
      />
      <span className="truncate">{deployment.title}</span>
      {showEnv && (
        <span className="ml-auto truncate font-mono text-[9px] opacity-70">
          {deployment.environment}
        </span>
      )}
    </motion.button>
  );
}
