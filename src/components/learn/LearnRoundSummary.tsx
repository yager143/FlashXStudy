import { motion } from 'framer-motion';
import { Trophy, CheckCircle2, ArrowRight, RotateCcw, Sparkles, ArrowLeft } from 'lucide-react';



interface LearnRoundSummaryProps {
  round: number;
  totalCards: number;
  level0Count: number;
  level1Count: number;
  level2Count: number;
  isDeckMastered: boolean;
  onNextRound: () => void;
  onRestart: () => void;
  onBackToDashboard: () => void;
}

export default function LearnRoundSummary({
  round,
  totalCards,
  level0Count,
  level1Count,
  level2Count,
  isDeckMastered,
  onNextRound,
  onRestart,
  onBackToDashboard,
}: LearnRoundSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-xl mx-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-2xl"
    >
      {/* Icon Badge */}
      <div className="flex justify-center mb-6">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg"
          style={{
            background: isDeckMastered
              ? 'linear-gradient(135deg, var(--accent), #f43f5e)'
              : 'linear-gradient(135deg, var(--success), #059669)',
            boxShadow: isDeckMastered
              ? '0 0 30px rgba(225,29,72,0.35)'
              : '0 0 30px rgba(16,185,129,0.35)',
          }}
        >
          {isDeckMastered ? (
            <Trophy size={40} className="text-white" />
          ) : (
            <Sparkles size={40} className="text-white" />
          )}
        </div>
      </div>

      {/* Title & Subtitle */}
      <h2 className="text-2xl sm:text-3xl font-black text-[var(--text)] mb-2 tracking-tight">
        {isDeckMastered ? "You've Mastered This Deck! 🎉" : `Round ${round} Complete! 🌟`}
      </h2>
      <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto mb-8">
        {isDeckMastered
          ? 'Incredible work! Every card has been practiced and mastered through multiple-choice and written recall.'
          : `Great progress! You completed Round ${round}. Keep going to master the rest of the cards.`}
      </p>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
          <div className="text-2xl font-black text-[var(--success)]">{level2Count}</div>
          <div className="text-xs text-[var(--text-muted)] mt-1 font-semibold">Mastered</div>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
          <div className="text-2xl font-black text-[var(--amber)]">{level1Count}</div>
          <div className="text-xs text-[var(--text-muted)] mt-1 font-semibold">Familiar</div>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
          <div className="text-2xl font-black text-[var(--text-muted)]">{level0Count}</div>
          <div className="text-xs text-[var(--text-muted)] mt-1 font-semibold">Remaining</div>
        </div>
      </div>

      {/* Progress pill */}
      <div className="mb-8 p-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between text-xs font-semibold">
        <span className="text-[var(--text-muted)]">Overall Deck Mastery</span>
        <span className="flex items-center gap-1.5 text-[var(--success)] font-bold">
          <CheckCircle2 size={14} />
          {totalCards > 0 ? Math.round((level2Count / totalCards) * 100) : 0}% Complete
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {isDeckMastered ? (
          <>
            <button
              id="restart-learn-btn"
              onClick={onRestart}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <RotateCcw size={16} />
              Study Again
            </button>
            <button
              id="back-to-deck-btn"
              onClick={onBackToDashboard}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, var(--accent), #f43f5e)' }}
            >
              <ArrowLeft size={16} />
              Return to Deck Overview
            </button>
          </>
        ) : (
          <>
            <button
              id="back-to-deck-btn"
              onClick={onBackToDashboard}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft size={16} />
              Deck Overview
            </button>
            <button
              id="next-round-btn"
              onClick={onNextRound}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20"
              style={{ background: 'linear-gradient(135deg, var(--accent), #f43f5e)' }}
            >
              <span>Continue to Round {round + 1}</span>
              <ArrowRight size={16} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
