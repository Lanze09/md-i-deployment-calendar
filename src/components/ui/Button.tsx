import { motion, type HTMLMotionProps } from 'framer-motion';
import { cx } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accenture-400 hover:bg-accenture-500 text-white shadow-sm',
  secondary:
    'bg-surface-light-tertiary hover:bg-slate-200 text-slate-900 dark:bg-surface-dark-tertiary dark:hover:bg-slate-700 dark:text-slate-100',
  danger:
    'bg-status-danger hover:bg-red-700 text-white',
  ghost:
    'bg-transparent hover:bg-slate-100 text-slate-700 dark:hover:bg-slate-800 dark:text-slate-300',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3.5 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      disabled={disabled}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-btn font-medium font-body',
        'transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
