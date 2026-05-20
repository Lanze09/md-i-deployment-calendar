import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { cx } from '../../lib/utils';

export interface CheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  dotColor?: string;
  className?: string;
}

export function Checkbox({ checked, onChange, label, dotColor, className }: CheckboxProps) {
  return (
    <label
      className={cx(
        'flex cursor-pointer items-center gap-2 rounded-btn px-2 py-1.5 transition-colors',
        'hover:bg-slate-100 dark:hover:bg-surface-dark-tertiary',
        className,
      )}
    >
      <span
        className={cx(
          'flex h-4 w-4 items-center justify-center rounded border transition-colors',
          checked
            ? 'border-accenture-400 bg-accenture-400 text-white'
            : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-surface-dark-tertiary',
        )}
        aria-hidden="true"
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {dotColor && (
        <span
          className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
      )}
      <span className="text-sm text-slate-700 dark:text-slate-200">{label}</span>
    </label>
  );
}
