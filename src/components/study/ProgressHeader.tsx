import { Brain, Shuffle } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';

interface ProgressHeaderProps {
  current: number;
  total: number;
  round: number;
  trackProgress: boolean;
  onToggleTrack: () => void;
  shuffle: boolean;
  onToggleShuffle: () => void;
  knownCount?: number;
  missedCount?: number;
}

export default function ProgressHeader({
  current,
  total,
  round,
  trackProgress,
  onToggleTrack,
  shuffle,
  onToggleShuffle,
  knownCount = 0,
  missedCount = 0,
}: ProgressHeaderProps) {
  const progress = total > 0
    ? trackProgress
      ? Math.min(100, ((knownCount + missedCount) / total) * 100)
      : Math.min(100, ((current + 1) / total) * 100)
    : 0;

  return (
    <div className="space-y-3">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {round > 1 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
              Round {round}
            </span>
          )}
          <span className="text-sm text-[var(--text-muted)]">
            <span className="text-[var(--text)] font-semibold">{Math.min(current + 1, total)}</span>
            {' '}/ {total}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Shuffle toggle */}
          <button
            id="shuffle-toggle-btn"
            onClick={onToggleShuffle}
            title="Shuffle cards"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
              shuffle
                ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30'
                : 'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]'
            }`}
          >
            <Shuffle size={13} />
            Shuffle
          </button>

          {/* Track Progress toggle */}
          <button
            id="track-progress-toggle-btn"
            onClick={onToggleTrack}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
              trackProgress
                ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-[0_0_12px_rgba(225,29,72,0.3)]'
                : 'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]'
            }`}
          >
            <Brain size={13} />
            Track Progress {trackProgress ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar value={progress} />
    </div>
  );
}
