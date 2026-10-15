import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, HelpCircle } from 'lucide-react';
import type { LearnQuestion } from '../../types';
import type { LearnFeedback } from '../../hooks/useLearnSession';

interface MultipleChoiceCardProps {
  question: LearnQuestion;
  isAnswered: boolean;
  feedback: LearnFeedback | null;
  onSelectOption: (index: number) => void;
  onNextQuestion: () => void;
}

export default function MultipleChoiceCard({
  question,
  isAnswered,
  feedback,
  onSelectOption,
  onNextQuestion,
}: MultipleChoiceCardProps) {
  const { card, options = [], correctOptionIndex = 0 } = question;

  // Freeze feedback for this question so during Framer Motion exit animation it retains answered styles
  const lastFeedbackRef = useRef<LearnFeedback | null>(null);
  if (feedback && feedback.questionId === question.id) {
    lastFeedbackRef.current = feedback;
  }
  const activeFeedback =
    feedback && feedback.questionId === question.id ? feedback : lastFeedbackRef.current;
  const activeIsAnswered = isAnswered || (activeFeedback !== null && activeFeedback.questionId === question.id);

  // Keyboard shortcut support:
  // - When NOT answered: keys 1, 2, 3, 4 select the option
  // - When answered: Space or Enter triggers Next Question
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        return;
      }

      if (activeIsAnswered) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNextQuestion();
        }
        return;
      }

      if (e.key === '1' && options.length >= 1) {
        e.preventDefault();
        onSelectOption(0);
      } else if (e.key === '2' && options.length >= 2) {
        e.preventDefault();
        onSelectOption(1);
      } else if (e.key === '3' && options.length >= 3) {
        e.preventDefault();
        onSelectOption(2);
      } else if (e.key === '4' && options.length >= 4) {
        e.preventDefault();
        onSelectOption(3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIsAnswered, options.length, onSelectOption, onNextQuestion]);

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
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
          <HelpCircle size={15} />
          <span>Level 0 · Choose the matching term</span>
        </div>
        <span className="text-xs text-[var(--text-muted)] font-medium">
          {activeIsAnswered ? (
            <span>
              Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] font-mono text-[10px]">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] font-mono text-[10px]">Enter</kbd> to continue
            </span>
          ) : (
            <span>
              Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] font-mono text-[10px]">1</kbd> - <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] font-mono text-[10px]">4</kbd>
            </span>
          )}
        </span>
      </div>

      {/* Question Definition Prompt */}
      <div className="min-h-[110px] flex flex-col justify-center mb-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
          Definition
        </span>
        <p className="text-lg sm:text-xl font-medium text-[var(--text)] leading-relaxed">
          {card.definition}
        </p>
      </div>

      {/* 4 Clickable Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {options.map((opt, idx) => {
          const isCorrectAnswer = idx === correctOptionIndex;
          const isSelected = activeFeedback?.selectedOptionIndex === idx;
          const userChoseCorrect = activeFeedback?.status === 'correct';

          let btnStyles =
            'bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)]/50 hover:bg-[var(--surface-2)]/80';
          let badgeStyles = 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]';
          let icon = null;
          let labelBadge = null;

          if (activeIsAnswered && activeFeedback) {
            if (userChoseCorrect) {
              // USER CHOSE CORRECT:
              // - Chosen correct option in bright Green with Green Checkmark
              // - All other unchosen options dimmed/red with Red X
              if (isCorrectAnswer) {
                btnStyles =
                  'border-emerald-500 bg-emerald-500/20 text-white font-bold shadow-[0_0_18px_rgba(16,185,129,0.35)]';
                badgeStyles = 'bg-emerald-500 text-white border-emerald-500';
                icon = <Check size={16} strokeWidth={3} className="text-white" />;
                labelBadge = (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-white uppercase tracking-wider">
                    Correct
                  </span>
                );
              } else {
                btnStyles =
                  'border-rose-500/30 bg-rose-500/5 text-rose-300/70 opacity-50 cursor-not-allowed';
                badgeStyles = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
                icon = <X size={14} strokeWidth={2.5} className="text-rose-400" />;
              }
            } else {
              // USER CHOSE INCORRECT:
              // - Option clicked by user in bright Red with Red X ("Your Answer")
              // - Actual correct option in bright Green with Green Checkmark ("Correct Answer")
              // - Remaining two options dimmed
              if (isSelected) {
                btnStyles =
                  'border-rose-500 bg-rose-500/20 text-rose-300 font-bold shadow-[0_0_18px_rgba(244,63,94,0.35)]';
                badgeStyles = 'bg-rose-500 text-white border-rose-500';
                icon = <X size={16} strokeWidth={3} className="text-white" />;
                labelBadge = (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500 text-white uppercase tracking-wider">
                    Your Answer
                  </span>
                );
              } else if (isCorrectAnswer) {
                btnStyles =
                  'border-emerald-500 bg-emerald-500/20 text-white font-bold shadow-[0_0_18px_rgba(16,185,129,0.35)]';
                badgeStyles = 'bg-emerald-500 text-white border-emerald-500';
                icon = <Check size={16} strokeWidth={3} className="text-white" />;
                labelBadge = (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-white uppercase tracking-wider">
                    Correct Answer
                  </span>
                );
              } else {
                btnStyles = 'opacity-30 bg-[var(--surface-2)] border-[var(--border)] cursor-not-allowed';
                badgeStyles = 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]';
                icon = idx + 1;
              }
            }
          } else {
            icon = idx + 1;
          }

          return (
            <button
              key={`${question.id}-opt-${idx}`}
              id={`mc-option-${idx + 1}`}
              onClick={() => {
                if (!activeIsAnswered) onSelectOption(idx);
              }}
              disabled={activeIsAnswered}
              className={`relative flex items-center justify-between gap-3 p-4 rounded-2xl border text-left text-sm transition-all duration-200 ${btnStyles}`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Number / Result Icon badge */}
                <span
                  className={`w-7 h-7 flex-shrink-0 rounded-xl flex items-center justify-center text-xs font-bold border transition-colors ${badgeStyles}`}
                >
                  {icon}
                </span>

                {/* Option Text */}
                <span className="font-medium leading-snug break-words">
                  {opt}
                </span>
              </div>

              {/* Status pill (Your Answer / Correct Answer) */}
              {labelBadge}
            </button>
          );
        })}
      </div>

      {/* Step 2: Answered Feedback & Next Question Button */}
      <AnimatePresence>
        {activeIsAnswered && activeFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
              activeFeedback.status === 'correct'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {activeFeedback.status === 'correct' ? (
                <>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/30">
                    <Check size={20} strokeWidth={3} />
                  </div>
                  <div>
                    <div className="font-bold text-base text-white">Correct!</div>
                    <div className="text-xs text-emerald-200">
                      Advanced to Level 1 (Familiar)
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-rose-500/30">
                    <X size={20} strokeWidth={3} />
                  </div>
                  <div>
                    <div className="font-bold text-base text-white">Incorrect</div>
                    <div className="text-xs text-rose-200">
                      Correct answer: <span className="font-bold text-white underline">{card.term}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Prominent Red/Accent "Next Question ->" Button */}
            <button
              id="next-question-btn"
              onClick={onNextQuestion}
              className="w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)]/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              style={{ background: 'linear-gradient(135deg, var(--accent), #f43f5e)' }}
            >
              <span>Next Question</span>
              <ArrowRight size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
