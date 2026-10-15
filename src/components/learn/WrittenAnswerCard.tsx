import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, CornerDownLeft, ShieldCheck, PenTool } from 'lucide-react';
import type { LearnQuestion } from '../../types';
import type { LearnFeedback } from '../../hooks/useLearnSession';

interface WrittenAnswerCardProps {
  question: LearnQuestion;
  isAnswered: boolean;
  feedback: LearnFeedback | null;
  onSubmitAnswer: (answer: string) => void;
  onOverride: () => void;
  onNextQuestion: () => void;
}

export default function WrittenAnswerCard({
  question,
  isAnswered,
  feedback,
  onSubmitAnswer,
  onOverride,
  onNextQuestion,
}: WrittenAnswerCardProps) {
  const { card } = question;
  const [typedValue, setTypedValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const answeredAtRef = useRef<number>(0);

  // Freeze feedback for this question instance during exit animation
  const lastFeedbackRef = useRef<LearnFeedback | null>(null);
  if (feedback && feedback.questionId === question.id) {
    lastFeedbackRef.current = feedback;
  }
  const activeFeedback =
    feedback && feedback.questionId === question.id ? feedback : lastFeedbackRef.current;
  const activeIsAnswered = isAnswered || (activeFeedback !== null && activeFeedback.questionId === question.id);

  // Focus input on mount or question change
  useEffect(() => {
    setTypedValue('');
    if (!activeIsAnswered) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [question.id, activeIsAnswered]);

  // Window keyboard listener for Space or Enter to trigger Next Question after answering
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeIsAnswered) return;
      if (e.key === 'Enter' || e.key === ' ') {
        // Enforce 250ms cooldown so the Enter key used to submit doesn't instantly dismiss
        if (Date.now() - answeredAtRef.current < 250) return;
        e.preventDefault();
        onNextQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIsAnswered, onNextQuestion]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (activeIsAnswered) {
      if (Date.now() - answeredAtRef.current > 250) {
        onNextQuestion();
      }
      return;
    }
    if (!typedValue.trim()) return;
    answeredAtRef.current = Date.now();
    onSubmitAnswer(typedValue.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-2xl mx-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-xl"
    >
      {/* Header Prompt */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--amber)]">
          <PenTool size={15} />
          <span>Level 1 · Written Recall (Type the term)</span>
        </div>
        <span className="text-xs text-[var(--text-muted)] font-medium">
          {activeIsAnswered ? (
            <span>
              Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] font-mono text-[10px]">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] font-mono text-[10px]">Enter</kbd> to continue
            </span>
          ) : (
            <span>
              Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] font-mono text-[10px]">Enter</kbd> to submit
            </span>
          )}
        </span>
      </div>

      {/* Question Definition Prompt */}
      <div className="min-h-[110px] flex flex-col justify-center mb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
          Definition
        </span>
        <p className="text-lg sm:text-xl font-medium text-[var(--text)] leading-relaxed">
          {card.definition}
        </p>
      </div>

      {/* Written Input Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
          Your Answer
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            id="learn-written-input"
            type="text"
            value={activeFeedback ? activeFeedback.userAnswer : typedValue}
            onChange={(e) => setTypedValue(e.target.value)}
            disabled={activeIsAnswered}
            placeholder="Type the matching term here..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            className={`w-full px-5 py-3.5 pr-28 rounded-2xl border text-base font-medium transition-all outline-none ${
              activeIsAnswered && activeFeedback
                ? activeFeedback.status === 'correct' || activeFeedback.status === 'overridden'
                  ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold'
                  : 'border-rose-500 bg-rose-500/10 text-rose-300 font-bold'
                : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 placeholder-[var(--text-muted)]'
            }`}
          />

          {!activeIsAnswered && (
            <button
              id="learn-submit-btn"
              type="submit"
              disabled={!typedValue.trim()}
              className="absolute right-2.5 top-2 bottom-2 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-md shadow-[var(--accent)]/20 cursor-pointer"
            >
              <span>Submit</span>
              <CornerDownLeft size={13} />
            </button>
          )}
        </div>
      </form>

      {/* Step 2: Answered Feedback & Next Question Button */}
      <AnimatePresence>
        {activeIsAnswered && activeFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Status Card */}
            <div
              className={`p-5 rounded-2xl border flex flex-col gap-3 ${
                activeFeedback.status === 'correct' || activeFeedback.status === 'overridden'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md ${
                    activeFeedback.status === 'correct' || activeFeedback.status === 'overridden'
                      ? 'bg-emerald-500 shadow-emerald-500/30'
                      : 'bg-rose-500 shadow-rose-500/30'
                  }`}
                >
                  {activeFeedback.status === 'correct' || activeFeedback.status === 'overridden' ? (
                    <Check size={20} strokeWidth={3} />
                  ) : (
                    <X size={20} strokeWidth={3} />
                  )}
                </div>
                <div>
                  <div className="font-bold text-base text-white">
                    {activeFeedback.status === 'overridden'
                      ? 'Override accepted — Marked as Mastered!'
                      : activeFeedback.status === 'correct'
                      ? activeFeedback.typoTolerated
                        ? 'Correct! (Typo tolerated)'
                        : 'Correct! Card Mastered 🎉'
                      : 'Incorrect'}
                  </div>
                  <div className="text-xs text-zinc-300">
                    {activeFeedback.status === 'correct' || activeFeedback.status === 'overridden'
                      ? 'Advanced to Level 2 (Mastered)'
                      : "Don't worry, you'll see this again in this round"}
                  </div>
                </div>
              </div>

              {/* Detail comparison on incorrect */}
              {activeFeedback.status === 'incorrect' && (
                <div className="mt-2 pt-3 border-t border-rose-500/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3.5 rounded-xl bg-[var(--surface)]/90 border border-rose-500/30">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1">
                      <X size={13} strokeWidth={2.5} />
                      <span>Your Answer</span>
                    </div>
                    <span className="text-rose-300 font-semibold text-base line-through">
                      {activeFeedback.userAnswer || '(blank)'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[var(--surface)]/90 border border-emerald-500/30">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                      <Check size={13} strokeWidth={2.5} />
                      <span>Correct Answer</span>
                    </div>
                    <span className="text-emerald-300 font-bold text-base">
                      {activeFeedback.correctAnswer}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions: Override & Next Question */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-1">
              {activeFeedback.status === 'incorrect' && (
                <button
                  id="override-answer-btn"
                  onClick={onOverride}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] flex items-center justify-center gap-2 transition-all hover:border-[var(--accent)]/40 active:scale-95 shadow-sm cursor-pointer"
                  title="Mark this answer as correct anyway"
                >
                  <ShieldCheck size={16} className="text-[var(--accent)]" />
                  <span>Override: I was right</span>
                </button>
              )}

              <button
                id="next-question-btn"
                onClick={onNextQuestion}
                className="w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)]/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                style={{ background: 'linear-gradient(135deg, var(--accent), #f43f5e)' }}
              >
                <span>Next Question</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
