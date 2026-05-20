import { Modal } from './Modal';

export interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS: Array<{ keys: string[]; label: string }> = [
  { keys: ['N'], label: 'New deployment' },
  { keys: ['T'], label: 'Toggle theme' },
  { keys: ['←'], label: 'Previous month' },
  { keys: ['→'], label: 'Next month' },
  { keys: ['F'], label: 'Focus search' },
  { keys: ['1'], label: 'Calendar view' },
  { keys: ['2'], label: 'Timeline view' },
  { keys: ['3'], label: 'Week view' },
  { keys: ['Esc'], label: 'Close modal' },
  { keys: ['?'], label: 'Show this help' },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard shortcuts" size="md" labelledBy="kbd-title">
      <ul className="divide-y divide-slate-200 dark:divide-slate-700">
        {SHORTCUTS.map((s) => (
          <li key={s.label} className="flex items-center justify-between py-2.5">
            <span className="text-sm text-slate-700 dark:text-slate-200">{s.label}</span>
            <span className="flex items-center gap-1">
              {s.keys.map((k) => (
                <kbd
                  key={k}
                  className="rounded-btn border border-slate-300 bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700 dark:border-slate-600 dark:bg-surface-dark-tertiary dark:text-slate-200"
                >
                  {k}
                </kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
