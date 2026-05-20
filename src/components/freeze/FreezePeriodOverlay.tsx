import { Snowflake } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { FreezePeriod } from '../../types';

export interface FreezePeriodOverlayProps {
  freezePeriods: FreezePeriod[];
  className?: string;
}

export function FreezePeriodOverlay({
  freezePeriods,
  className,
}: FreezePeriodOverlayProps) {
  if (freezePeriods.length === 0) return null;
  return (
    <div className={className}>
      {freezePeriods.map((f) => (
        <div
          key={f.id}
          className="flex items-start gap-2 rounded-card border border-status-warning/40 bg-status-warning/10 px-3 py-2 text-xs"
        >
          <Snowflake size={14} className="mt-0.5 text-status-warning" />
          <div>
            <div className="font-semibold text-status-warning">{f.title}</div>
            <div className="text-slate-600 dark:text-slate-300">
              {format(parseISO(f.start_date), 'MMM d')} — {format(parseISO(f.end_date), 'MMM d, yyyy')}
              {f.affected_environments.length > 0 && (
                <> · {f.affected_environments.join(', ')}</>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
