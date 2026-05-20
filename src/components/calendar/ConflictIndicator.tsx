import { AlertTriangle } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

export interface ConflictIndicatorProps {
  count: number;
  description?: string;
}

export function ConflictIndicator({ count, description }: ConflictIndicatorProps) {
  return (
    <Tooltip content={description ?? `${count} conflict${count === 1 ? '' : 's'}`}>
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-status-danger/15 text-status-danger animate-pulse-soft">
        <AlertTriangle size={12} strokeWidth={2.5} aria-label="Conflict" />
      </span>
    </Tooltip>
  );
}
