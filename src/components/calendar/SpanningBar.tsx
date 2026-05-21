import { motion } from 'framer-motion';
import { cx } from '../../lib/utils';
import type { Deployment } from '../../types';

export interface SpanningBarProps {
  deployment: Deployment;
  /** Resolved CSS hex colour for this bar */
  color: string;
  /** Day-of-week index for the bar's left edge within this week-row (0 = Sun, 6 = Sat) */
  startCol: number;
  /** Number of day columns the bar spans within this week-row (1-7) */
  span: number;
  /** True if the deployment actually starts in this week (round left edge) */
  isStart: boolean;
  /** True if the deployment actually ends in this week (round right edge) */
  isEnd: boolean;
  /** Vertical lane within the week, 0-based */
  lane: number;
  dim?: boolean;
  onClick?: (d: Deployment) => void;
  onContextMenu?: (d: Deployment, e: React.MouseEvent) => void;
}

const LANE_HEIGHT = 22;
const LANE_GAP = 2;

export function SpanningBar({
  deployment,
  color,
  startCol,
  span,
  isStart,
  isEnd,
  lane,
  dim,
  onClick,
  onContextMenu,
}: SpanningBarProps) {
  const isCancelled = deployment.status === 'Cancelled';
  const isFailed = deployment.status === 'Failed';

  return (
    <motion.button
      initial={{ opacity: 0, scaleX: 0.92 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
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
        'pointer-events-auto absolute flex items-center gap-1.5 truncate px-2 text-left text-[11px] font-medium font-body',
        'cursor-pointer transition-shadow hover:shadow-md',
        isStart ? 'rounded-l-pill' : '',
        isEnd ? 'rounded-r-pill' : '',
        !isStart && !isEnd && '',
        dim && 'opacity-25',
        isCancelled && 'line-through opacity-60',
      )}
      style={{
        left: `calc(${(startCol / 7) * 100}% + 2px)`,
        width: `calc(${(span / 7) * 100}% - 4px)`,
        top: `${lane * (LANE_HEIGHT + LANE_GAP)}px`,
        height: `${LANE_HEIGHT}px`,
        backgroundColor: `${color}29`,
        color: color,
        boxShadow: `inset 0 0 0 1px ${color}80`,
      }}
      title={`${deployment.title} — ${deployment.environment} (${deployment.deploy_date}${
        deployment.deploy_date !== deployment.deploy_end_date ? ` → ${deployment.deploy_end_date}` : ''
      })`}
    >
      {isStart && (
        <span
          className={cx(
            'h-1.5 w-1.5 flex-shrink-0 rounded-full',
            isFailed && 'animate-pulse-soft',
          )}
          style={{ backgroundColor: color }}
        />
      )}
      {/* Title is shown on the leftmost segment only */}
      {isStart && <span className="truncate">{deployment.title}</span>}
      {!isStart && (
        <span className="truncate text-[10px] opacity-70">
          ↳ {deployment.title}
        </span>
      )}
    </motion.button>
  );
}

export const SPANNING_BAR_LANE_HEIGHT = LANE_HEIGHT;
export const SPANNING_BAR_LANE_GAP = LANE_GAP;
