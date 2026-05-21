import { motion } from 'framer-motion';
import type { Deployment } from '../../types';
import { cx } from '../../lib/utils';

export interface TimelineBarProps {
  deployment: Deployment;
  color: string;
  leftPct: number;
  widthPct: number;
  onClick: (d: Deployment) => void;
  stackIndex: number;
}

export function TimelineBar({ deployment, color, leftPct, widthPct, onClick, stackIndex }: TimelineBarProps) {
  const isCancelled = deployment.status === 'Cancelled';
  return (
    <motion.button
      initial={{ opacity: 0, scaleX: 0.85 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -2 }}
      onClick={() => onClick(deployment)}
      className={cx(
        'absolute h-7 origin-left truncate rounded-pill px-2 text-left text-[11px] font-medium font-body',
        'transition-shadow hover:shadow-md',
        isCancelled && 'line-through opacity-50',
      )}
      style={{
        left: `${leftPct}%`,
        width: `${Math.max(widthPct, 2.4)}%`,
        top: `${stackIndex * 32 + 6}px`,
        backgroundColor: `${color}29`,
        color: color,
        boxShadow: `inset 0 0 0 1px ${color}80`,
      }}
      title={`${deployment.title} — ${deployment.environment} (${deployment.status})`}
    >
      <span className="truncate">{deployment.title}</span>
    </motion.button>
  );
}
