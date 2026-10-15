import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Timer,
  Trophy,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getPersonalBest, savePersonalBest } from '../lib/matchRecords';
import ThemeToggle from '../components/ui/ThemeToggle';
import type { Card } from '../types';

interface MatchTile {
  id: string; // unique tile id e.g. `${card.id}-term` or `${card.id}-def`
  cardId: string;
  type: 'term' | 'definition';
  text: string;
  isMatched: boolean;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function MatchView() {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  const { decks, activeCards, loadDecks, loadDeckCards, setView } = useAppStore();

  const deck = decks.find(d => d.id === deckId);

  // Tiles on board
  const [tiles, setTiles] = useState<MatchTile[]>([]);
  // Selection state (up to 2 tile IDs)
  const [selectedTileIds, setSelectedTileIds] = useState<string[]>([]);
  // Visual mismatch / match highlight state
  const [matchStatus, setMatchStatus] = useState<'idle' | 'matched' | 'mismatched'>('idle');
  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [penaltyCount, setPenaltyCount] = useState(0); // number of +1s penalties
  const [showPenaltyNotice, setShowPenaltyNotice] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [personalBest, setPersonalBest] = useState<number | null>(null);

  const startTimeRef = useRef<number>(0);
  const penaltySecondsRef = useRef<number>(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ensure decks and cards are loaded
  useEffect(() => {
    if (decks.length === 0) loadDecks();
  }, [decks.length, loadDecks]);

  useEffect(() => {
    if (deckId) {
      loadDeckCards(deckId);
      setPersonalBest(getPersonalBest(deckId));
    }
  }, [deckId, loadDeckCards]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Board generation: Pick up to 6 random cards, split into 2 tiles each, shuffle
  const generateBoard = useCallback((availableCards: Card[]) => {
    if (availableCards.length === 0) return;

    // Pick up to 6 cards
    const shuffledCards = shuffleArray(availableCards);
    const chosenCards = shuffledCards.slice(0, 6);

    const generatedTiles: MatchTile[] = [];
    chosenCards.forEach(card => {
      // Term tile
      generatedTiles.push({
        id: `${card.id}-term`,
        cardId: card.id,
        type: 'term',
        text: card.term,
        isMatched: false,
      });
      // Definition tile
      generatedTiles.push({
        id: `${card.id}-def`,
        cardId: card.id,
        type: 'definition',
        text: card.definition,
        isMatched: false,
      });
    });

    const randomizedTiles = shuffleArray(generatedTiles);
    setTiles(randomizedTiles);
    setSelectedTileIds([]);
    setMatchStatus('idle');
    setPenaltyCount(0);
    penaltySecondsRef.current = 0;
    setShowPenaltyNotice(false);
    setIsGameOver(false);
    setIsNewRecord(false);

    // Start timer
    setElapsedTime(0);
    startTimeRef.current = Date.now();
    setIsPlaying(true);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const rawSeconds = (now - startTimeRef.current) / 1000 + penaltySecondsRef.current;
      setElapsedTime(parseFloat(rawSeconds.toFixed(1)));
    }, 100);
  }, []);

  // Initialize game when activeCards are loaded
  useEffect(() => {
    if (activeCards.length > 0 && tiles.length === 0 && !isGameOver) {
      generateBoard(activeCards);
    }
  }, [activeCards, tiles.length, isGameOver, generateBoard]);

  // Handle Tile Click
  const handleTileClick = (tile: MatchTile) => {
    if (!isPlaying || isGameOver || tile.isMatched || matchStatus !== 'idle') return;

    // If clicking already selected tile, deselect it
    if (selectedTileIds.includes(tile.id)) {
      setSelectedTileIds([]);
      return;
    }

    // First tile selected
    if (selectedTileIds.length === 0) {
      setSelectedTileIds([tile.id]);
      return;
    }

    // Second tile selected
    if (selectedTileIds.length === 1) {
      const firstTile = tiles.find(t => t.id === selectedTileIds[0])!;
      const secondTile = tile;
      const newSelection = [firstTile.id, secondTile.id];
      setSelectedTileIds(newSelection);

      // Check match: Same cardId and different types (one term, one definition)
      const isMatch = firstTile.cardId === secondTile.cardId && firstTile.type !== secondTile.type;

      if (isMatch) {
        setMatchStatus('matched');

        setTimeout(() => {
          // Mark tiles as matched
          const updatedTiles = tiles.map(t =>
            t.id === firstTile.id || t.id === secondTile.id ? { ...t, isMatched: true } : t
          );
          setTiles(updatedTiles);
          setSelectedTileIds([]);
          setMatchStatus('idle');

          // Check if all pairs are now matched
          const allDone = updatedTiles.every(t => t.isMatched);
          if (allDone) {
            // STOP TIMER
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setIsPlaying(false);
            setIsGameOver(true);

            // Compute final time
            const finalSecs = (Date.now() - startTimeRef.current) / 1000 + penaltySecondsRef.current;
            const roundedFinal = parseFloat(finalSecs.toFixed(1));
            setElapsedTime(roundedFinal);

            // Save Personal Best
            if (deckId) {
              const res = savePersonalBest(deckId, roundedFinal);
              setIsNewRecord(res.isNewRecord);
              setPersonalBest(res.best);
            }
          }
        }, 320);
      } else {
        // MISMATCH!
        setMatchStatus('mismatched');

        // Add +1.0s penalty
        penaltySecondsRef.current += 1.0;
        setPenaltyCount(p => p + 1);
        setShowPenaltyNotice(true);

        setTimeout(() => {
          setShowPenaltyNotice(false);
        }, 800);

        // Shake for 400ms then deselect
        setTimeout(() => {
          setSelectedTileIds([]);
          setMatchStatus('idle');
        }, 400);
      }
    }
  };

  const handleBackToDeck = () => {
    if (deckId) {
      setView('deck-overview', deckId);
      navigate(`/deck/${deckId}`);
    } else {
      setView('dashboard');
      navigate('/');
    }
  };

  const handlePlayAgain = () => {
    generateBoard(activeCards);
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
        <button
          onClick={handleBackToDeck}
          className="px-4 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] hover:border-[var(--accent)] cursor-pointer"
        >
          Back to Deck Overview
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {/* Back button with ONLY backwards arrow */}
          <button
            id="back-to-deck-btn"
            onClick={handleBackToDeck}
            className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] transition-all hover:border-[var(--accent)]/40 active:scale-95 cursor-pointer shadow-sm"
            title="Back to Deck"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Center: Live Stopwatch + Penalty Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] shadow-sm">
              <Timer size={16} className="text-[var(--accent)]" />
              <span className="font-mono font-black text-lg text-[var(--text)] tracking-wider">
                {elapsedTime.toFixed(1)}s
              </span>
            </div>

            {/* +1.0s Penalty Floating Notice */}
            <AnimatePresence>
              {showPenaltyNotice && (
                <motion.span
                  initial={{ opacity: 0, y: 5, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.8 }}
                  className="px-2 py-0.5 rounded-lg bg-rose-500 text-white font-mono font-bold text-xs shadow-md shadow-rose-500/30"
                >
                  +1.0s
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Personal Best Badge & Theme Toggle */}
          <div className="flex items-center gap-3">
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-xs font-semibold"
              title="Personal Best for this deck"
            >
              <Trophy size={14} className="text-amber-400" />
              <span className="text-[var(--text-muted)]">Record:</span>
              <span className="font-mono text-[var(--text)] font-bold">
                {personalBest !== null ? `${personalBest.toFixed(1)}s` : '--'}
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Game Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 flex flex-col justify-center items-center">
        {activeCards.length === 0 ? (
          <div className="text-center p-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
            <p className="text-[var(--text-muted)] text-sm">
              This deck has no cards yet. Add cards to play Match!
            </p>
            <button
              onClick={() => {
                setView('editor', deck.id);
                navigate(`/editor/${deck.id}`);
              }}
              className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold"
            >
              Add Cards
            </button>
          </div>
        ) : isGameOver ? (
          /* End-of-Game Victory Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full max-w-lg p-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] text-center shadow-2xl space-y-6"
          >
            {/* Victory Trophy */}
            <div className="flex justify-center">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #e11d48)',
                  boxShadow: '0 0 30px rgba(245,158,11,0.35)',
                }}
              >
                <Trophy size={42} className="text-white" />
              </div>
            </div>

            {/* Title & Record Badge */}
            <div className="space-y-2">
              {isNewRecord && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-sm animate-pulse">
                  <Sparkles size={13} />
                  New Personal Best Record!
                </span>
              )}
              <h2 className="text-3xl font-black text-[var(--text)] tracking-tight">
                All Matched!
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                You cleared all pairs in this round.
              </p>
            </div>

            {/* Time Comparison Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                  Final Time
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-black text-white">
                  {elapsedTime.toFixed(1)}s
                </span>
                {penaltyCount > 0 && (
                  <span className="block text-[11px] text-rose-400 mt-1 font-semibold">
                    ({penaltyCount} {penaltyCount === 1 ? 'penalty' : 'penalties'} included)
                  </span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                  Personal Best
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-black text-amber-400">
                  {personalBest !== null ? `${personalBest.toFixed(1)}s` : `${elapsedTime.toFixed(1)}s`}
                </span>
                <span className="block text-[11px] text-[var(--text-muted)] mt-1 font-semibold">
                  {deck.title}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                id="play-again-btn"
                onClick={handlePlayAgain}
                className="w-full sm:w-auto px-7 py-3 rounded-lg font-bold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/30 hover:brightness-110 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, var(--accent), #f43f5e)' }}
              >
                <RotateCcw size={16} />
                <span>Play Again</span>
              </button>

              <button
                id="back-to-deck-btn"
                onClick={handleBackToDeck}
                className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-sm border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm"
                title="Back"
              >
                <ArrowLeft size={18} />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Active Matching Board */
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
              <span>Click a Term and its matching Definition to clear the pair.</span>
              <span className="font-semibold">
                {tiles.filter(t => t.isMatched).length / 2} / {tiles.length / 2} Pairs Cleared
              </span>
            </div>

            {/* Grid of Tiles (e.g. 4x3 grid on desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {tiles.map(tile => {
                const isSelected = selectedTileIds.includes(tile.id);
                const isThisTileMatched = tile.isMatched;

                // Status styling
                let borderAndBg =
                  'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/40 hover:bg-[var(--surface-2)]';
                let textColor = 'text-[var(--text)]';
                let shakeVariants = {};

                if (isSelected) {
                  if (matchStatus === 'matched') {
                    borderAndBg =
                      'border-emerald-500 bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.35)]';
                    textColor = 'text-emerald-300 font-bold';
                  } else if (matchStatus === 'mismatched') {
                    borderAndBg =
                      'border-rose-500 bg-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.35)]';
                    textColor = 'text-rose-300 font-bold';
                    shakeVariants = {
                      x: [-6, 6, -4, 4, 0],
                    };
                  } else {
                    borderAndBg =
                      'border-[var(--accent)] bg-[var(--surface-2)] ring-2 ring-[var(--accent)]/30 shadow-[0_0_15px_rgba(225,29,72,0.2)]';
                    textColor = 'text-white font-bold';
                  }
                }

                return (
                  <motion.button
                    key={tile.id}
                    id={`match-tile-${tile.id}`}
                    onClick={() => handleTileClick(tile)}
                    disabled={isThisTileMatched || matchStatus !== 'idle'}
                    animate={shakeVariants}
                    transition={{ duration: 0.35 }}
                    style={{
                      visibility: isThisTileMatched ? 'hidden' : 'visible',
                      pointerEvents: isThisTileMatched ? 'none' : 'auto',
                    }}
                    className={`min-h-[110px] sm:min-h-[125px] p-4 rounded-2xl border text-center flex flex-col items-center justify-center relative transition-all duration-150 select-none cursor-pointer active:scale-95 ${borderAndBg}`}
                  >
                    {/* Tile Text without Term/Def labels */}
                    <span className={`text-sm sm:text-base font-semibold leading-snug break-words px-3 line-clamp-4 ${textColor}`}>
                      {tile.text}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
