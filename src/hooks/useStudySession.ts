import { useReducer, useEffect, useCallback, useRef } from 'react';
import type { Card } from '../types';

export interface StudySessionState {
  cards: Card[];
  currentIndex: number;
  isFlipped: boolean;
  trackProgress: boolean;
  shuffle: boolean;
  knownIds: string[];
  missedIds: string[];
  round: number;
  showSummary: boolean;
  isComplete: boolean;
}

type SessionAction =
  | { type: 'FLIP' }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'MARK_KNOWN' }
  | { type: 'MARK_MISSED' }
  | { type: 'TOGGLE_TRACK' }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'REVIEW_MISSED' }
  | { type: 'RESTART'; allCards: Card[] };

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sessionReducer(state: StudySessionState, action: SessionAction): StudySessionState {
  switch (action.type) {
    case 'FLIP':
      return { ...state, isFlipped: !state.isFlipped };

    case 'NEXT': {
      if (!state.trackProgress) {
        const next = Math.min(state.currentIndex + 1, state.cards.length - 1);
        return { ...state, currentIndex: next, isFlipped: false };
      }
      return state;
    }

    case 'PREV': {
      if (!state.trackProgress) {
        const prev = Math.max(state.currentIndex - 1, 0);
        return { ...state, currentIndex: prev, isFlipped: false };
      }
      return state;
    }

    case 'MARK_KNOWN': {
      if (state.cards.length === 0) return state;
      const card = state.cards[state.currentIndex];
      const newKnown = [...state.knownIds.filter(id => id !== card.id), card.id];
      const newMissed = state.missedIds.filter(id => id !== card.id);
      const nextIndex = state.currentIndex + 1;
      const isEnd = nextIndex >= state.cards.length;
      return {
        ...state,
        knownIds: newKnown,
        missedIds: newMissed,
        currentIndex: isEnd ? state.currentIndex : nextIndex,
        isFlipped: false,
        showSummary: isEnd,
        isComplete: isEnd,
      };
    }

    case 'MARK_MISSED': {
      if (state.cards.length === 0) return state;
      const card = state.cards[state.currentIndex];
      const newMissed = [...state.missedIds.filter(id => id !== card.id), card.id];
      const newKnown = state.knownIds.filter(id => id !== card.id);
      const nextIndex = state.currentIndex + 1;
      const isEnd = nextIndex >= state.cards.length;
      return {
        ...state,
        missedIds: newMissed,
        knownIds: newKnown,
        currentIndex: isEnd ? state.currentIndex : nextIndex,
        isFlipped: false,
        showSummary: isEnd,
        isComplete: isEnd,
      };
    }

    case 'TOGGLE_TRACK':
      return { ...state, trackProgress: !state.trackProgress, showSummary: false };

    case 'TOGGLE_SHUFFLE': {
      const nextShuffle = !state.shuffle;
      const cards = nextShuffle ? shuffleArray(state.cards) : [...state.cards];
      return { ...state, shuffle: nextShuffle, cards, currentIndex: 0, isFlipped: false };
    }

    case 'REVIEW_MISSED': {
      const missedCards = state.cards.filter(c => state.missedIds.includes(c.id));
      return {
        ...state,
        cards: state.shuffle ? shuffleArray(missedCards) : missedCards,
        currentIndex: 0,
        isFlipped: false,
        knownIds: [],
        missedIds: [],
        round: state.round + 1,
        showSummary: false,
        isComplete: false,
      };
    }

    case 'RESTART': {
      const cards = state.shuffle ? shuffleArray(action.allCards) : [...action.allCards];
      return {
        ...state,
        cards,
        currentIndex: 0,
        isFlipped: false,
        knownIds: [],
        missedIds: [],
        round: 1,
        showSummary: false,
        isComplete: false,
      };
    }

    default:
      return state;
  }
}

interface UseStudySessionOptions {
  initialCards: Card[];
  onCardResult?: (card: Card, result: 'known' | 'missed') => void;
}

export function useStudySession({ initialCards, onCardResult }: UseStudySessionOptions) {
  const [state, dispatch] = useReducer(sessionReducer, {
    cards: initialCards,
    currentIndex: 0,
    isFlipped: false,
    trackProgress: false,
    shuffle: false,
    knownIds: [],
    missedIds: [],
    round: 1,
    showSummary: false,
    isComplete: false,
  });

  const cardIdsKey = initialCards.map(c => c.id).join(',');
  const prevKeyRef = useRef<string>('');

  // Reinitialize when initialCards first loads or changes deck, avoiding restarts on mastery score updates
  useEffect(() => {
    if (initialCards.length > 0 && prevKeyRef.current !== cardIdsKey) {
      prevKeyRef.current = cardIdsKey;
      dispatch({ type: 'RESTART', allCards: initialCards });
    }
  }, [cardIdsKey, initialCards]);

  const flip = useCallback(() => {
    dispatch({ type: 'FLIP' });
  }, []);

  const next = useCallback(() => {
    dispatch({ type: 'NEXT' });
  }, []);

  const prev = useCallback(() => {
    dispatch({ type: 'PREV' });
  }, []);

  const markKnown = useCallback(() => {
    const card = state.cards[state.currentIndex];
    if (card) {
      onCardResult?.(card, 'known');
    }
    dispatch({ type: 'MARK_KNOWN' });
  }, [state.cards, state.currentIndex, onCardResult]);

  const markMissed = useCallback(() => {
    const card = state.cards[state.currentIndex];
    if (card) {
      onCardResult?.(card, 'missed');
    }
    dispatch({ type: 'MARK_MISSED' });
  }, [state.cards, state.currentIndex, onCardResult]);

  const toggleTrack = useCallback(() => {
    dispatch({ type: 'TOGGLE_TRACK' });
  }, []);

  const toggleShuffle = useCallback(() => {
    dispatch({ type: 'TOGGLE_SHUFFLE' });
  }, []);

  const reviewMissed = useCallback(() => {
    dispatch({ type: 'REVIEW_MISSED' });
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: 'RESTART', allCards: initialCards });
  }, [initialCards]);

  return {
    state,
    currentCard: state.cards[state.currentIndex],
    flip,
    next,
    prev,
    markKnown,
    markMissed,
    toggleTrack,
    toggleShuffle,
    reviewMissed,
    restart,
  };
}
