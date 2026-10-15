import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

interface StudyControlsProps {
  trackProgress: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  onKnow?: () => void;
  onMissed?: () => void;
  canGoPrev?: boolean;
  canGoNext?: boolean;
}

export default function StudyControls({
  trackProgress,
  onPrev,
  onNext,
  onKnow,
  onMissed,
  canGoPrev = true,
  canGoNext = true,
}: StudyControlsProps) {
  if (trackProgress) {
    return (
      <div className="flex items-center justify-center gap-6">
        {/* Still Learning / X */}
        <button
          id="study-missed-btn"
          onClick={onMissed}
          className="group flex flex-col items-center gap-2"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-[var(--danger)] bg-[var(--danger-dim)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white transition-all duration-200 active:scale-90 group-hover:shadow-[0_0_24px_rgba(244,63,94,0.4)]">
            <X size={28} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-semibold text-[var(--danger)]">Still Learning</span>
          <kbd className="text-[10px] text-[var(--text-muted)] bg-[var(--surface-2)] border border-[var(--border)] rounded px-1.5 py-0.5 font-mono">← / 1</kbd>
        </button>

        {/* Know / Check */}
        <button
          id="study-known-btn"
          onClick={onKnow}
          className="group flex flex-col items-center gap-2"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-[var(--success)] bg-[var(--success-dim)] text-[var(--success)] hover:bg-[var(--success)] hover:text-white transition-all duration-200 active:scale-90 group-hover:shadow-[0_0_24px_rgba(16,185,129,0.4)]">
            <Check size={28} strokeWidth={2.5} />
          </div>
          <span className="text-xs font-semibold text-[var(--success)]">Know It</span>
          <kbd className="text-[10px] text-[var(--text-muted)] bg-[var(--surface-2)] border border-[var(--border)] rounded px-1.5 py-0.5 font-mono">→ / 2</kbd>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        id="study-prev-btn"
        onClick={onPrev}
        disabled={!canGoPrev}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--accent)]/40 hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm"
      >
        <ChevronLeft size={18} />
        Previous
        <kbd className="text-[10px] text-[var(--text-muted)] bg-[var(--surface-2)] border border-[var(--border)] rounded px-1.5 py-0.5 font-mono">←</kbd>
      </button>
      <button
        id="study-next-btn"
        onClick={onNext}
        disabled={!canGoNext}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--accent)]/40 hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm"
      >
        Next
        <kbd className="text-[10px] text-[var(--text-muted)] bg-[var(--surface-2)] border border-[var(--border)] rounded px-1.5 py-0.5 font-mono">→</kbd>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
