import { useEffect, useCallback } from 'react';

interface KeyboardShortcutHandlers {
  onFlip?: () => void;
  onPrevOrMissed?: () => void;
  onNextOrKnown?: () => void;
  disabled?: boolean;
}

/**
 * Manages study mode keyboard shortcuts:
 * - Space: Flip card
 * - Left Arrow / 1: Still Learning (Track ON) / Previous (Track OFF)
 * - Right Arrow / 2: Know (Track ON) / Next (Track OFF)
 */
export function useKeyboardShortcuts({
  onFlip,
  onPrevOrMissed,
  onNextOrKnown,
  disabled = false,
}: KeyboardShortcutHandlers) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;

      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          onFlip?.();
          break;
        case 'ArrowLeft':
        case '1':
          e.preventDefault();
          onPrevOrMissed?.();
          break;
        case 'ArrowRight':
        case '2':
          e.preventDefault();
          onNextOrKnown?.();
          break;
      }
    },
    [disabled, onFlip, onPrevOrMissed, onNextOrKnown]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
