import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useLearnSession } from '../hooks/useLearnSession';
import LearnProgressBar from '../components/learn/LearnProgressBar';
import MultipleChoiceCard from '../components/learn/MultipleChoiceCard';
import WrittenAnswerCard from '../components/learn/WrittenAnswerCard';
import LearnRoundSummary from '../components/learn/LearnRoundSummary';
import ThemeToggle from '../components/ui/ThemeToggle';
import type { MasteryLevel } from '../types';

export default function LearnView() {
  const navigate = useNavigate();
  const {
    activeDeckId,
    decks,
    activeCards,
    loadDecks,
    loadDeckCards,
    markDeckStudied,
    recordCardResult,
    setView,
  } = useAppStore();

  const deck = decks.find(d => d.id === activeDeckId);

  // Ensure decks are loaded
  useEffect(() => {
    if (decks.length === 0) {
      loadDecks();
    }
  }, [decks.length, loadDecks]);

  // Load cards and mark deck as studied
  useEffect(() => {
    if (activeDeckId) {
      loadDeckCards(activeDeckId);
      markDeckStudied(activeDeckId);
    }
  }, [activeDeckId, loadDeckCards, markDeckStudied]);

  // Callback when a card's mastery level advances
  const handleCardProgress = useCallback(
    (cardId: string, level: MasteryLevel) => {
      if (!activeDeckId) return;
      if (level >= 1) {
        recordCardResult(cardId, activeDeckId, 'known');
      } else {
        recordCardResult(cardId, activeDeckId, 'missed');
      }
    },
    [activeDeckId, recordCardResult]
  );

  const {
    currentQuestion,
    isAnswered,
    feedback,
    currentRound,
    roundQueueLength,
    isRoundComplete,
    isDeckMastered,
    stats,
    actions,
  } = useLearnSession({
    cards: activeCards,
    deckId: activeDeckId || '',
    onCardProgress: handleCardProgress,
  });

  const handleBackToDeck = () => {
    if (activeDeckId) {
      setView('deck-overview', activeDeckId);
      navigate(`/deck/${activeDeckId}`);
    } else {
      setView('dashboard');
      navigate('/');
    }
  };

  if (!deck) {
    if (decks.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-screen text-[var(--text-muted)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
        <h2 className="text-xl font-bold text-[var(--text)]">Deck not found</h2>
        <p className="text-sm text-[var(--text-muted)]">This deck may have been deleted or the link is invalid.</p>
        <button
          onClick={handleBackToDeck}
          className="px-4 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] hover:border-[var(--accent)] cursor-pointer"
        >
          Return to Deck Overview
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              id="back-to-deck-btn"
              onClick={handleBackToDeck}
              className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] transition-all hover:border-[var(--accent)]/40 active:scale-95 flex-shrink-0 cursor-pointer shadow-sm"
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[var(--text)] truncate text-base">
                  {deck.title}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--accent)]/15 text-[var(--accent)] uppercase tracking-wider border border-[var(--accent)]/30">
                  Learn
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="reset-learn-btn"
              onClick={() => {
                if (confirm('Restart Learn Mode from Round 1?')) {
                  actions.restartSession();
                }
              }}
              className="p-2 rounded-xl hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              title="Restart Learn Mode"
            >
              <RotateCcw size={16} />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col justify-between">
        {/* Progress Bar Header */}
        {activeCards.length > 0 && !isDeckMastered && !isRoundComplete && (
          <div className="mb-8">
            <LearnProgressBar
              round={currentRound}
              totalCards={stats.totalCards}
              level0Count={stats.level0Count}
              level1Count={stats.level1Count}
              level2Count={stats.level2Count}
              deckMasteryPercent={stats.deckMasteryPercent}
              roundQueueLength={roundQueueLength}
            />
          </div>
        )}

        {/* Study Content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {activeCards.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <p className="text-[var(--text-muted)] text-base mb-4">
                  This deck has no cards yet.
                </p>
                <button
                  onClick={() => {
                    setView('editor', activeDeckId ?? undefined);
                    navigate(`/editor/${activeDeckId}`);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white font-semibold text-sm"
                >
                  Add Cards to Deck
                </button>
              </motion.div>
            ) : isRoundComplete || isDeckMastered ? (
              <LearnRoundSummary
                key="summary"
                round={currentRound}
                totalCards={stats.totalCards}
                level0Count={stats.level0Count}
                level1Count={stats.level1Count}
                level2Count={stats.level2Count}
                isDeckMastered={isDeckMastered}
                onNextRound={actions.startNextRound}
                onRestart={actions.restartSession}
                onBackToDashboard={handleBackToDeck}
              />
            ) : currentQuestion ? (
              currentQuestion.type === 'multiple-choice' ? (
                <MultipleChoiceCard
                  key={currentQuestion.id}
                  question={currentQuestion}
                  isAnswered={isAnswered}
                  feedback={feedback}
                  onSelectOption={actions.answerMultipleChoice}
                  onNextQuestion={actions.nextQuestion}
                />
              ) : (
                <WrittenAnswerCard
                  key={currentQuestion.id}
                  question={currentQuestion}
                  isAnswered={isAnswered}
                  feedback={feedback}
                  onSubmitAnswer={actions.submitWrittenAnswer}
                  onOverride={actions.overrideAnswer}
                  onNextQuestion={actions.nextQuestion}
                />
              )
            ) : null}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
