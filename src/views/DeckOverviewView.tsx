import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Pencil,
  Layers,
  BookOpen,
  Plus,
  Sparkles,
  Timer,
  FileQuestion,
  Brain,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function DeckOverviewView() {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  const {
    decks,
    activeCards,
    loadDecks,
    loadDeckCards,
    setView,
  } = useAppStore();

  const deck = decks.find(d => d.id === deckId);

  // Ensure decks and deck cards are loaded
  useEffect(() => {
    if (decks.length === 0) {
      loadDecks();
    }
  }, [decks.length, loadDecks]);

  useEffect(() => {
    if (deckId) {
      loadDeckCards(deckId);
    }
  }, [deckId, loadDeckCards]);

  const handleBackToDecks = () => {
    setView('dashboard');
    navigate('/');
  };

  const handleEditDeck = () => {
    if (!deckId) return;
    setView('editor', deckId);
    navigate(`/editor/${deckId}`);
  };

  const handleStartFlashcards = () => {
    if (!deckId) return;
    setView('study', deckId);
    navigate(`/study/${deckId}`);
  };

  const handleStartLearn = () => {
    if (!deckId) return;
    setView('learn', deckId);
    navigate(`/learn/${deckId}`);
  };

  const handleStartMatch = () => {
    if (!deckId) return;
    setView('match', deckId);
    navigate(`/match/${deckId}`);
  };

  const handleStartTest = () => {
    if (!deckId) return;
    setView('test', deckId);
    navigate(`/test/${deckId}`);
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
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4" style={{ background: 'var(--bg)' }}>
        <h2 className="text-xl font-bold text-[var(--text)]">Deck not found</h2>
        <p className="text-sm text-[var(--text-muted)]">This deck might have been removed or the link is invalid.</p>
        <button
          onClick={handleBackToDecks}
          className="px-4 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] hover:border-[var(--accent)] cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const cardCount = activeCards.length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between gap-4">
          {/* Back button with ONLY backwards arrow */}
          <button
            id="back-to-decks-btn"
            onClick={handleBackToDecks}
            className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] transition-all hover:border-[var(--accent)]/40 active:scale-95 cursor-pointer shadow-sm"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <button
              id="edit-deck-btn"
              onClick={handleEditDeck}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] text-sm font-semibold transition-all hover:border-[var(--accent)]/40 active:scale-95 cursor-pointer shadow-sm"
            >
              <Pencil size={15} />
              <span>Edit Deck</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto px-6 md:px-12 py-8 flex-1 space-y-10">
        {/* Deck Header: Title & Card Count (No lightning bolt) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-2.5"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text)] tracking-tight">
            {deck.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]">
              <BookOpen size={13} />
              {cardCount} {cardCount === 1 ? 'card' : 'cards'}
            </span>
            {deck.description && (
              <span className="text-sm text-[var(--text-muted)] line-clamp-2">
                {deck.description}
              </span>
            )}
          </div>
        </motion.div>

        {/* Study Mode Selection Section (No "CHOOSE STUDY MODE" header text) */}
        <div>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Mode 1: Flashcards Mode */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.15 }}
              onClick={cardCount > 0 ? handleStartFlashcards : undefined}
              className={`p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-md flex flex-col items-center justify-center text-center gap-4 transition-all ${
                cardCount > 0
                  ? 'hover:border-[var(--accent)]/60 hover:shadow-lg hover:shadow-[var(--accent)]/5 cursor-pointer group'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/25 group-hover:scale-105 transition-transform">
                <Layers size={28} />
              </div>
              <h3 className="text-lg font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                Flashcards
              </h3>
            </motion.div>

            {/* Mode 2: Adaptive Learn Mode */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.15 }}
              onClick={cardCount > 0 ? handleStartLearn : undefined}
              className={`p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-md flex flex-col items-center justify-center text-center gap-4 transition-all ${
                cardCount > 0
                  ? 'hover:border-rose-500/60 hover:shadow-lg hover:shadow-rose-500/5 cursor-pointer group'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-md shadow-[var(--accent)]/25 group-hover:scale-105 transition-transform"
                style={{ background: 'linear-gradient(135deg, var(--accent), #f43f5e)' }}
              >
                <Brain size={28} />
              </div>
              <h3 className="text-lg font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                Learn
              </h3>
            </motion.div>

            {/* Mode 3: Match Mode */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.15 }}
              onClick={cardCount > 0 ? handleStartMatch : undefined}
              className={`p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-md flex flex-col items-center justify-center text-center gap-4 transition-all ${
                cardCount > 0
                  ? 'hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer group'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #e11d48)' }}
              >
                <Timer size={28} />
              </div>
              <h3 className="text-lg font-bold text-[var(--text)] group-hover:text-amber-400 transition-colors">
                Match
              </h3>
            </motion.div>

            {/* Mode 4: Practice Test Mode */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.15 }}
              onClick={cardCount > 0 ? handleStartTest : undefined}
              className={`p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-md flex flex-col items-center justify-center text-center gap-4 transition-all ${
                cardCount > 0
                  ? 'hover:border-indigo-500/60 hover:shadow-lg hover:shadow-indigo-500/5 cursor-pointer group'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                <FileQuestion size={28} />
              </div>
              <h3 className="text-lg font-bold text-[var(--text)] group-hover:text-indigo-400 transition-colors">
                Test
              </h3>
            </motion.div>
          </div>
        </div>

        {/* Cards in Deck Preview Section (Comfortable generous spacing) */}
        <div className="space-y-6 pt-6 border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--accent)]" />
              <span>Cards in this deck ({cardCount})</span>
            </h2>
            <button
              onClick={handleEditDeck}
              className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add / Manage Cards</span>
            </button>
          </div>

          {activeCards.length === 0 ? (
            <div className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-center space-y-3">
              <p className="text-sm text-[var(--text-muted)]">No cards in this deck yet.</p>
              <button
                onClick={handleEditDeck}
                className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-bold cursor-pointer"
              >
                Add Your First Card
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeCards.map((card, idx) => (
                <div
                  key={card.id}
                  className="p-5 sm:p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm hover:border-[var(--accent)]/40 hover:shadow-sm transition-all"
                >
                  <div className="sm:w-1/3 font-bold text-[var(--text)] text-base flex items-center gap-3">
                    <span className="text-xs font-mono text-[var(--text-muted)] w-6 shrink-0">{idx + 1}.</span>
                    <span className="break-words">{card.term}</span>
                  </div>
                  <div className="sm:w-2/3 text-[var(--text-muted)] text-sm leading-relaxed pl-9 sm:pl-0">
                    {card.definition}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
