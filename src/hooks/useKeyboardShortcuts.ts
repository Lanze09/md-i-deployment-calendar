import { useEffect } from 'react';

export interface ShortcutHandlers {
  newDeployment?: () => void;
  toggleTheme?: () => void;
  prevMonth?: () => void;
  nextMonth?: () => void;
  focusSearch?: () => void;
  setView?: (view: 'calendar' | 'timeline' | 'week') => void;
  showHelp?: () => void;
  closeAll?: () => void;
}

export interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
}

export function useKeyboardShortcuts(
  handlers: ShortcutHandlers,
  { enabled = true }: UseKeyboardShortcutsOptions = {},
) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inForm =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable === true;
      if (e.key === 'Escape') {
        handlers.closeAll?.();
        return;
      }
      if (inForm) return;

      switch (e.key) {
        case 'n':
        case 'N':
          handlers.newDeployment?.();
          break;
        case 't':
        case 'T':
          handlers.toggleTheme?.();
          break;
        case 'ArrowLeft':
          handlers.prevMonth?.();
          break;
        case 'ArrowRight':
          handlers.nextMonth?.();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          handlers.focusSearch?.();
          break;
        case '1':
          handlers.setView?.('calendar');
          break;
        case '2':
          handlers.setView?.('timeline');
          break;
        case '3':
          handlers.setView?.('week');
          break;
        case '?':
          handlers.showHelp?.();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, handlers]);
}
