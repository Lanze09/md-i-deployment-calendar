import { motion } from 'framer-motion';
import { cx } from '../../lib/utils';
import type { Deployment } from '../../types';

export interface WeekTimeSlotProps {
  deployment: Deployment;
  color: string;
  topPct: number;
  heightPct: number;
  onClick: (d: Deployment) => void;
  laneIndex: number;
  lanesInColumn: number;
}

export function WeekTimeSlot({
  deployment,
  color,
  topPct,
  heightPct,
  onClick,
  laneIndex,
  lanesInColumn,
}: WeekTimeSlotProps) {
  const widthPct = 100 / lanesInColumn;
  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onClick(deployment)}
      className={cx(
        'absolute overflow-hidden rounded-btn p-1 text-left text-[10px] font-medium font-body',
        'transition-shadow hover:shadow-md',
        deployment.status === 'Cancelled' && 'line-through opacity-50',
      )}
      style={{
        top: `${topPct}%`,
        height: `max(${heightPct}%, 18px)`,
        left: `${laneIndex * widthPct}%`,
        width: `calc(${widthPct}% - 2px)`,
        backgroundColor: `${color}26`,
        color: color,
        boxShadow: `inset 0 0 0 1px ${color}80`,
      }}
      title={`${deployment.title} — ${deployment.environment}`}
    >
      <div className="truncate font-semibold">{deployment.title}</div>
      <div className="truncate opacity-80">{deployment.environment}</div>
    </motion.button>
  );
}
