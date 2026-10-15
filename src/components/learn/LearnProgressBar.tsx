import { CheckCircle2, BookOpen, Sparkles, Layers } from 'lucide-react';

interface LearnProgressBarProps {
  round: number;
  totalCards: number;
  level0Count: number;
  level1Count: number;
  level2Count: number;
  deckMasteryPercent: number;
  roundQueueLength: number;
}

export default function LearnProgressBar({
  round,
  totalCards,
  level0Count,
  level1Count,
  level2Count,
  deckMasteryPercent,
  roundQueueLength,
}: LearnProgressBarProps) {
  // Percentages for the multi-segment bar
  const masteredPct = totalCards > 0 ? (level2Count / totalCards) * 100 : 0;
  const familiarPct = totalCards > 0 ? (level1Count / totalCards) * 100 : 0;

  return (
    <div className="w-full space-y-3">
      {/* Top status bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        {/* Round & Queue info */}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 shadow-sm">
            <Layers size={13} />
            Round {round}
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            <span className="text-[var(--text)] font-semibold">{roundQueueLength}</span> {roundQueueLength === 1 ? 'question' : 'questions'} left in round
          </span>
        </div>

        {/* Level Badges */}
        <div className="flex items-center gap-2">
          {/* Level 0: Remaining */}
          <div
            id="badge-remaining"
            title="Level 0: Not yet familiar"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]"
          >
            <BookOpen size={12} />
            <span>{level0Count} Remaining</span>
          </div>

          {/* Level 1: Familiar */}
          <div
            id="badge-familiar"
            title="Level 1: Familiar (answered multiple choice correctly)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--amber)]/10 text-[var(--amber)] border border-[var(--amber)]/25"
          >
            <Sparkles size={12} />
            <span>{level1Count} Familiar</span>
          </div>

          {/* Level 2: Mastered */}
          <div
            id="badge-mastered"
            title="Level 2: Mastered (typed written answer correctly)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/25"
          >
            <CheckCircle2 size={12} />
            <span>{level2Count} Mastered</span>
          </div>
        </div>
      </div>

      {/* Segmented Progress Bar */}
      <div className="relative">
        <div className="w-full h-2 rounded-full bg-[var(--surface-2)] border border-[var(--border)] overflow-hidden flex">
          {/* Mastered Segment (Green) */}
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${masteredPct}%`,
              backgroundColor: 'var(--success)',
            }}
            title={`${level2Count} Mastered (${Math.round(masteredPct)}%)`}
          />
          {/* Familiar Segment (Amber) */}
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${familiarPct}%`,
              backgroundColor: 'var(--amber)',
            }}
            title={`${level1Count} Familiar (${Math.round(familiarPct)}%)`}
          />
        </div>

        {/* Overall Mastery Percentage Label */}
        <div className="flex justify-between items-center mt-1.5 text-xs text-[var(--text-muted)]">
          <span>Overall Deck Mastery</span>
          <span className="font-bold text-[var(--text)]">
            <span className="text-[var(--success)]">{deckMasteryPercent}%</span> Mastered
          </span>
        </div>
      </div>
    </div>
  );
}
