import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

export interface CalendarHeaderProps {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarHeader({ currentDate, onPrev, onNext, onToday }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-1">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
      </div>
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="sm" onClick={onToday}>
          Today
        </Button>
        <Button variant="secondary" size="sm" onClick={onPrev} aria-label="Previous month">
          <ChevronLeft size={16} />
        </Button>
        <Button variant="secondary" size="sm" onClick={onNext} aria-label="Next month">
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
