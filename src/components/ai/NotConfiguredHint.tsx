import { ExternalLink, Sparkles } from 'lucide-react';
import { cx } from '../../lib/utils';

export interface NotConfiguredHintProps {
  variant?: 'card' | 'inline';
  className?: string;
}

/**
 * Shown wherever an AI feature is invoked but VITE_GEMINI_API_KEY isn't set.
 * Tells the user exactly what to do — set the env var and restart the dev server.
 */
export function NotConfiguredHint({ variant = 'card', className }: NotConfiguredHintProps) {
  if (variant === 'inline') {
    return (
      <span
        className={cx(
          'inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400',
          className,
        )}
      >
        <Sparkles size={11} className="text-accenture-400" />
        Set <code className="font-mono">VITE_GEMINI_API_KEY</code> in <code className="font-mono">.env</code> to enable AI
      </span>
    );
  }
  return (
    <div
      className={cx(
        'flex flex-col gap-2 rounded-card border border-accenture-300/40 bg-accenture-400/5 px-4 py-4 text-sm',
        className,
      )}
    >
      <div className="flex items-center gap-2 font-display font-semibold text-accenture-400">
        <Sparkles size={14} /> AI features are not configured
      </div>
      <p className="text-slate-600 dark:text-slate-300">
        Set <code className="font-mono">VITE_GEMINI_API_KEY</code> in your{' '}
        <code className="font-mono">.env</code> file, then restart the dev server
        (<code className="font-mono">npm run dev</code>).
      </p>
      <a
        href="https://aistudio.google.com/app/apikey"
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-fit items-center gap-1 text-xs font-medium text-accenture-400 hover:underline"
      >
        Get a free Gemini key <ExternalLink size={11} />
      </a>
    </div>
  );
}
