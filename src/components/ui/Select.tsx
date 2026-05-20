import type { SelectHTMLAttributes } from 'react';
import { cx } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
}

export function Select({ options, className, ...rest }: SelectProps) {
  return (
    <select
      className={cx(
        'w-full rounded-btn border border-slate-300 bg-white px-3 py-2 text-sm font-body text-slate-900',
        'transition-colors focus:border-accenture-400',
        'dark:border-slate-700 dark:bg-surface-dark-tertiary dark:text-slate-100',
        className,
      )}
      {...rest}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
