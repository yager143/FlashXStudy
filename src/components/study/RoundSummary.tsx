import { motion } from 'framer-motion';
import { Trophy, RotateCcw, RefreshCw, X, Check, ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';

interface RoundSummaryProps {
  round: number;
  totalCards: number;
  knownCount: number;
  missedCount: number;
  onReviewMissed: () => void;
  onRestartFull: () => void;
  onBackToDashboard?: () => void;
}

export default function RoundSummary({
  round,
  totalCards,
  knownCount,
  missedCount,
  onReviewMissed,
  onRestartFull,
  onBackToDashboard,
}: RoundSummaryProps) {
  const accuracy = totalCards > 0 ? Math.round((knownCount / totalCards) * 100) : 0;
  const isPerfect = missedCount === 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-8 py-8"
    >
      {/* Icon */}
      <div className="relative">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: isPerfect
              ? 'linear-gradient(135deg, var(--success), #34d399)'
              : 'linear-gradient(135deg, var(--accent), #f43f5e)',
            boxShadow: isPerfect
              ? '0 0 40px rgba(16,185,129,0.4)'
              : '0 0 40px rgba(225,29,72,0.4)',
          }}
        >
          {isPerfect ? (
            <Trophy size={40} className="text-white" />
          ) : (
            <RefreshCw size={40} className="text-white" />
          )}
        </div>
      </div>

      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[var(--text)]">
          {isPerfect ? '🎉 Perfect Round!' : `Round ${round} Complete`}
        </h2>
        <p className="text-[var(--text-muted)] mt-1 text-sm">
          {isPerfect
            ? "You've mastered all cards in this deck!"
            : `Keep going — you're making progress!`}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6">
        {/* Accuracy */}
        <div className="text-center px-6 py-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div
            className="text-4xl font-black"
            style={{ color: accuracy >= 80 ? 'var(--success)' : accuracy >= 50 ? 'var(--amber)' : 'var(--danger)' }}
          >
            {accuracy}%
          </div>
          <div className="text-xs font-semibold text-[var(--text-muted)] mt-1">Accuracy</div>
        </div>

        {/* Know */}
        <div className="text-center px-6 py-4 rounded-2xl border border-[var(--success)]/20 bg-[var(--success-dim)]">
          <div className="flex items-center justify-center gap-1.5">
            <Check size={20} className="text-[var(--success)]" strokeWidth={2.5} />
            <span className="text-4xl font-black text-[var(--success)]">{knownCount}</span>
          </div>
          <div className="text-xs font-semibold text-[var(--success)]/70 mt-1">Know It</div>
        </div>

        {/* Still Learning */}
        {missedCount > 0 && (
          <div className="text-center px-6 py-4 rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger-dim)]">
            <div className="flex items-center justify-center gap-1.5">
              <X size={20} className="text-[var(--danger)]" strokeWidth={2.5} />
              <span className="text-4xl font-black text-[var(--danger)]">{missedCount}</span>
            </div>
            <div className="text-xs font-semibold text-[var(--danger)]/70 mt-1">Still Learning</div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-3 w-full max-w-sm">
        {missedCount > 0 && (
          <Button
            id="review-missed-btn"
            size="lg"
            onClick={onReviewMissed}
            className="w-full"
          >
            <RefreshCw size={18} />
            Review Missed Cards ({missedCount})
          </Button>
        )}
        <Button
          id="restart-full-deck-btn"
          variant="ghost"
          size="md"
          onClick={onRestartFull}
          className="w-full"
        >
          <RotateCcw size={16} />
          Restart Full Deck
        </Button>
        {onBackToDashboard && (
          <Button
            id="summary-back-dashboard-btn"
            variant="ghost"
            size="md"
            onClick={onBackToDashboard}
            className="w-full text-[var(--text-muted)] hover:text-[var(--text)] flex items-center justify-center"
            title="Back"
          >
            <ArrowLeft size={18} />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
