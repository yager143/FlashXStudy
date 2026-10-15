interface FlipCardProps {
  term: string;
  definition: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export default function FlipCard({ term, definition, isFlipped, onFlip }: FlipCardProps) {
  return (
    <div
      id="flashcard"
      role="button"
      tabIndex={0}
      aria-label={`Flashcard: ${isFlipped ? 'Definition' : 'Term'}. Click to flip.`}
      className="flip-card-container w-full select-none cursor-pointer focus:outline-none"
      style={{ height: '360px' }}
      onClick={onFlip}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onFlip();
        }
      }}
    >
      <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* Front — Term */}
        <div
          id="card-front"
          className="flip-card-face shadow-xl hover:border-[var(--accent)]/40 hover:shadow-[0_0_30px_rgba(225,29,72,0.12)] transition-all duration-300"
        >
          <div className="text-center max-w-lg mx-auto flex flex-col items-center justify-between h-full py-4">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)] uppercase tracking-widest">
              Term
            </span>
            <p
              id="card-term"
              className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] leading-snug tracking-tight my-auto px-4"
            >
              {term || <span className="text-[var(--text-muted)] italic font-normal text-2xl">Empty Term</span>}
            </p>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 opacity-80">
              Click or press <kbd className="px-2 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] font-mono text-[10px]">Space</kbd> to flip
            </p>
          </div>
        </div>

        {/* Back — Definition */}
        <div
          id="card-back"
          className="flip-card-face flip-card-back shadow-xl hover:border-[var(--accent)]/40 hover:shadow-[0_0_30px_rgba(225,29,72,0.12)] transition-all duration-300"
        >
          <div className="text-center max-w-lg mx-auto flex flex-col items-center justify-between h-full py-4">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 uppercase tracking-widest">
              Definition
            </span>
            <p
              id="card-definition"
              className="text-xl sm:text-2xl font-medium text-[var(--text)] leading-relaxed my-auto px-4"
            >
              {definition || <span className="text-[var(--text-muted)] italic font-normal text-lg">Empty Definition</span>}
            </p>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 opacity-80">
              Click or press <kbd className="px-2 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] font-mono text-[10px]">Space</kbd> to flip
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
