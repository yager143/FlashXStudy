import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useStudySession } from '../hooks/useStudySession';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import FlipCard from '../components/study/FlipCard';
import StudyControls from '../components/study/StudyControls';
import ProgressHeader from '../components/study/ProgressHeader';
import TrackingBadges from '../components/study/TrackingBadges';
import RoundSummary from '../components/study/RoundSummary';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function StudyView() {
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

  // Load cards and record study time when view opens
  useEffect(() => {
    if (activeDeckId) {
      loadDeckCards(activeDeckId);
      markDeckStudied(activeDeckId);
    }
  }, [activeDeckId, loadDeckCards, markDeckStudied]);

  const handleCardResult = useCallback(
    (card: { id: string }, result: 'known' | 'missed') => {
      if (activeDeckId) {
        recordCardResult(card.id, activeDeckId, result);
      }
    },
    [activeDeckId, recordCardResult]
  );

  const {
    state,
    currentCard,
    flip,
    next,
    prev,
    markKnown,
    markMissed,
    toggleTrack,
    toggleShuffle,
    reviewMissed,
    restart,
  } = useStudySession({
    initialCards: activeCards,
    onCardResult: handleCardResult,
  });

  // Register keyboard shortcuts
  useKeyboardShortcuts({
    onFlip: flip,
    onPrevOrMissed: () => {
      if (state.trackProgress && !state.showSummary) {
        markMissed();
      } else if (!state.trackProgress) {
        prev();
      }
    },
    onNextOrKnown: () => {
      if (state.trackProgress && !state.showSummary) {
        markKnown();
      } else if (!state.trackProgress) {
        next();
      }
    },
    disabled: state.showSummary,
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
      <div className="flex items-center justify-center min-h-screen text-[var(--text-muted)]">
        Deck not found.{' '}
        <button
          id="deck-not-found-back-btn"
          onClick={handleBackToDeck}
          className="ml-2 text-[var(--accent)] underline font-medium"
        >
          Go back to deck overview
        </button>
      </div>
    );
  }

  if (deck.cardCount > 0 && activeCards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[var(--text-muted)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" />
      </div>
    );
  }

  if (activeCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-6">
        <p className="text-[var(--text-muted)]">This deck has no cards yet.</p>
        <button
          id="empty-deck-add-cards-btn"
          onClick={() => {
            setView('editor', activeDeckId!);
            navigate(`/editor/${activeDeckId}`);
          }}
          className="text-[var(--accent)] font-semibold hover:underline"
        >
          Add Cards
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              id="study-back-btn"
              onClick={handleBackToDeck}
              className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] transition-all hover:border-[var(--accent)]/40 active:scale-95 cursor-pointer shadow-sm"
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--text)] truncate max-w-[200px] text-sm">{deck.title}</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Study Area */}
      <main className="flex-1 w-full flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-3xl mx-auto min-h-[80vh] flex flex-col items-center justify-center gap-6">
          {/* Progress + Controls */}
          <div className="w-full">
            <ProgressHeader
              current={state.currentIndex}
              total={state.cards.length}
              round={state.round}
              trackProgress={state.trackProgress}
              onToggleTrack={toggleTrack}
              shuffle={state.shuffle}
              onToggleShuffle={toggleShuffle}
              knownCount={state.knownIds.length}
              missedCount={state.missedIds.length}
            />
          </div>

          {/* Tracking Badges */}
          {state.trackProgress && !state.showSummary && (
            <div className="w-full">
              <TrackingBadges
                knownCount={state.knownIds.length}
                missedCount={state.missedIds.length}
              />
            </div>
          )}

          {/* Main Content Area */}
          <div className="w-full">
            <AnimatePresence mode="wait">
              {state.showSummary ? (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-8 py-6"
                >
                  <RoundSummary
                    round={state.round}
                    totalCards={state.cards.length}
                    knownCount={state.knownIds.length}
                    missedCount={state.missedIds.length}
                    onReviewMissed={reviewMissed}
                    onRestartFull={restart}
                    onBackToDashboard={handleBackToDeck}
                  />
                </motion.div>
              ) : currentCard ? (
                <motion.div
                  key={`card-${currentCard.id}-${state.currentIndex}-${state.round}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <FlipCard
                    term={currentCard.term}
                    definition={currentCard.definition}
                    isFlipped={state.isFlipped}
                    onFlip={flip}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Study Controls */}
          {!state.showSummary && (
            <div className="w-full flex flex-col gap-3">
              <StudyControls
                trackProgress={state.trackProgress}
                onPrev={prev}
                onNext={next}
                onKnow={markKnown}
                onMissed={markMissed}
                canGoPrev={state.currentIndex > 0}
                canGoNext={state.currentIndex < state.cards.length - 1}
              />

              {/* Card position hint */}
              {!state.trackProgress && (
                <p className="text-center text-xs text-[var(--text-muted)]">
                  Card {state.currentIndex + 1} of {state.cards.length}
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
