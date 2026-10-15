import { useState, useEffect, useCallback, useRef } from 'react';
import type { Card, MasteryLevel, LearnQuestion } from '../types';
import { gradeAnswer, type GradeResult } from '../lib/learnGrading';

const ROUND_BATCH_SIZE = 7;

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateQuestionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Creates a question for a given card at its current level.
 */
function createQuestion(card: Card, level: MasteryLevel, allCards: Card[]): LearnQuestion {
  if (level === 0) {
    // Multiple Choice
    const otherCards = allCards.filter(c => c.id !== card.id);
    const shuffledOthers = shuffleArray(otherCards);
    const distractors = shuffledOthers.slice(0, 3).map(c => c.term);
    const options = shuffleArray([card.term, ...distractors]);
    const correctOptionIndex = options.indexOf(card.term);

    return {
      id: generateQuestionId(),
      card,
      level: 0,
      type: 'multiple-choice',
      options,
      correctOptionIndex,
    };
  }

  // Level 1: Written recall
  return {
    id: generateQuestionId(),
    card,
    level: 1,
    type: 'written',
  };
}

export interface LearnFeedback {
  questionId: string;
  status: 'correct' | 'incorrect' | 'overridden';
  userAnswer: string;
  correctAnswer: string;
  typoTolerated?: boolean;
  selectedOptionIndex?: number;
}

interface UseLearnSessionProps {
  cards: Card[];
  deckId: string;
  onCardProgress?: (cardId: string, level: MasteryLevel) => void;
}

export function useLearnSession({ cards, deckId, onCardProgress }: UseLearnSessionProps) {
  // Mastery levels of all cards in this session (starts at 0)
  const [cardLevels, setCardLevels] = useState<Record<string, MasteryLevel>>({});
  
  // Active round state
  const [currentRound, setCurrentRound] = useState(1);
  const [activeBatchCardIds, setActiveBatchCardIds] = useState<string[]>([]);
  const [roundQueue, setRoundQueue] = useState<LearnQuestion[]>([]);
  
  // The current question frozen in state (does NOT change when card scores update)
  const [currentQuestion, setCurrentQuestion] = useState<LearnQuestion | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState<LearnFeedback | null>(null);

  const [isRoundComplete, setIsRoundComplete] = useState(false);
  const [isDeckMastered, setIsDeckMastered] = useState(false);

  // Store the cards array for this deck session to prevent re-renders when score changes
  const cardsRef = useRef<Card[]>([]);
  const initializedDeckIdRef = useRef<string | null>(null);

  // Pending queue to transition to when user clicks Next Question
  const pendingNextQueueRef = useRef<LearnQuestion[] | null>(null);

  // Initialize session ONLY when deckId changes or on first load of cards
  useEffect(() => {
    if (cards.length === 0) return;
    if (initializedDeckIdRef.current === deckId) return;

    initializedDeckIdRef.current = deckId;
    cardsRef.current = [...cards];

    const initialLevels: Record<string, MasteryLevel> = {};
    cards.forEach(c => {
      initialLevels[c.id] = 0;
    });
    setCardLevels(initialLevels);

    // First round batch (up to 7 cards)
    const firstBatch = cards.slice(0, ROUND_BATCH_SIZE);
    const firstBatchIds = firstBatch.map(c => c.id);
    setActiveBatchCardIds(firstBatchIds);

    // Initial questions for round 1
    const initialQuestions = firstBatch.map(card => createQuestion(card, 0, cards));
    setRoundQueue(initialQuestions);
    setCurrentQuestion(initialQuestions.length > 0 ? initialQuestions[0] : null);
    setCurrentRound(1);
    setIsRoundComplete(false);
    setIsDeckMastered(false);
    setIsAnswered(false);
    setFeedback(null);
    pendingNextQueueRef.current = null;
  }, [cards, deckId]);

  // Counts based on all cards in session
  const allCards = cardsRef.current.length > 0 ? cardsRef.current : cards;
  const totalCards = allCards.length;
  const level0Count = allCards.filter(c => (cardLevels[c.id] ?? 0) === 0).length;
  const level1Count = allCards.filter(c => (cardLevels[c.id] ?? 0) === 1).length;
  const level2Count = allCards.filter(c => (cardLevels[c.id] ?? 0) === 2).length;

  const deckMasteryPercent = totalCards > 0 ? Math.round((level2Count / totalCards) * 100) : 0;
  const familiarPercent = totalCards > 0 ? Math.round((level1Count / totalCards) * 100) : 0;

  // Check if round should complete when queue becomes empty
  const checkRoundStatus = useCallback((
    updatedLevels: Record<string, MasteryLevel>,
    updatedQueue: LearnQuestion[],
    batchIds: string[]
  ) => {
    if (updatedQueue.length > 0) {
      setCurrentQuestion(updatedQueue[0]);
      return;
    }

    const sessionCards = cardsRef.current;
    // Check if all cards in the batch have reached Level 2
    const unmasteredInBatch = batchIds.filter(id => (updatedLevels[id] ?? 0) < 2);

    if (unmasteredInBatch.length > 0) {
      // Re-queue remaining unmastered cards in this batch
      const newQuestions = unmasteredInBatch.map(id => {
        const card = sessionCards.find(c => c.id === id)!;
        const lvl = updatedLevels[id] ?? 0;
        return createQuestion(card, lvl, sessionCards);
      });
      setRoundQueue(newQuestions);
      setCurrentQuestion(newQuestions.length > 0 ? newQuestions[0] : null);
      return;
    }

    // All cards in current batch are Mastered (Level 2)!
    const allMastered = sessionCards.every(c => (updatedLevels[c.id] ?? 0) === 2);
    if (allMastered) {
      setIsDeckMastered(true);
      setIsRoundComplete(true);
      setCurrentQuestion(null);
    } else {
      setIsRoundComplete(true);
      setCurrentQuestion(null);
    }
  }, []);

  // STEP 1: Multiple choice answer selection (locks options, sets isAnswered = true, NO timer)
  const answerMultipleChoice = useCallback((selectedIndex: number) => {
    if (!currentQuestion || isAnswered) return;

    const isCorrect = selectedIndex === currentQuestion.correctOptionIndex;
    const cardId = currentQuestion.card.id;
    const card = currentQuestion.card;
    const sessionCards = cardsRef.current;

    let nextQueue: LearnQuestion[];

    if (isCorrect) {
      // Level 0 -> Level 1 (Familiar)
      const newLevel: MasteryLevel = 1;
      const updatedLevels = { ...cardLevels, [cardId]: newLevel };
      setCardLevels(updatedLevels);
      onCardProgress?.(cardId, newLevel);

      // Create Level 1 (written) question and append to active round queue
      const nextQ = createQuestion(card, 1, sessionCards);
      nextQueue = [...roundQueue.slice(1), nextQ];
    } else {
      // Incorrect: reset card to Level 0
      const newLevel: MasteryLevel = 0;
      const updatedLevels = { ...cardLevels, [cardId]: newLevel };
      setCardLevels(updatedLevels);
      onCardProgress?.(cardId, newLevel);

      // Re-queue at Level 0 in the round
      const retryQ = createQuestion(card, 0, sessionCards);
      nextQueue = [...roundQueue.slice(1), retryQ];
    }

    pendingNextQueueRef.current = nextQueue;
    setIsAnswered(true);
    setFeedback({
      questionId: currentQuestion.id,
      status: isCorrect ? 'correct' : 'incorrect',
      userAnswer: currentQuestion.options?.[selectedIndex] ?? '',
      correctAnswer: card.term,
      selectedOptionIndex: selectedIndex,
    });
    // ZERO timers! Screen stays completely still until user clicks Next Question
  }, [currentQuestion, isAnswered, cardLevels, roundQueue, onCardProgress]);

  // STEP 1: Written answer submission (locks input, sets isAnswered = true, NO timer)
  const submitWrittenAnswer = useCallback((typedAnswer: string) => {
    if (!currentQuestion || isAnswered) return;

    const card = currentQuestion.card;
    const cardId = card.id;
    const grade: GradeResult = gradeAnswer(typedAnswer, card.term);
    const sessionCards = cardsRef.current;

    let nextQueue: LearnQuestion[];

    if (grade.isCorrect) {
      // Level 1 -> Level 2 (Mastered!)
      const newLevel: MasteryLevel = 2;
      const updatedLevels = { ...cardLevels, [cardId]: newLevel };
      setCardLevels(updatedLevels);
      onCardProgress?.(cardId, newLevel);

      nextQueue = roundQueue.slice(1);
    } else {
      // Incorrect: reset card to Level 0
      const newLevel: MasteryLevel = 0;
      const updatedLevels = { ...cardLevels, [cardId]: newLevel };
      setCardLevels(updatedLevels);
      onCardProgress?.(cardId, newLevel);

      // Re-queue at Level 0 (multiple choice)
      const retryQ = createQuestion(card, 0, sessionCards);
      nextQueue = [...roundQueue.slice(1), retryQ];
    }

    pendingNextQueueRef.current = nextQueue;
    setIsAnswered(true);
    setFeedback({
      questionId: currentQuestion.id,
      status: grade.isCorrect ? 'correct' : 'incorrect',
      userAnswer: typedAnswer,
      correctAnswer: card.term,
      typoTolerated: grade.typoTolerated,
    });
    // ZERO timers! Screen stays completely still until user clicks Next Question
  }, [currentQuestion, isAnswered, cardLevels, roundQueue, onCardProgress]);

  // "Override: I was right" button handler
  const overrideAnswer = useCallback(() => {
    if (!isAnswered || !feedback || feedback.status !== 'incorrect' || !currentQuestion) return;

    const cardId = currentQuestion.card.id;

    // Promote card to Level 2 (Mastered)
    const newLevel: MasteryLevel = 2;
    const updatedLevels = { ...cardLevels, [cardId]: newLevel };
    setCardLevels(updatedLevels);
    onCardProgress?.(cardId, newLevel);

    // Cancel retry question: simply remove the card from the pending queue
    pendingNextQueueRef.current = roundQueue.slice(1);

    setFeedback({
      ...feedback,
      status: 'overridden',
    });
    // ZERO timers! Screen stays still with Next Question button visible
  }, [isAnswered, feedback, currentQuestion, cardLevels, roundQueue, onCardProgress]);

  // STEP 2: The "Next Question" button: ONLY advances when explicitly clicked
  const nextQuestion = useCallback(() => {
    if (!isAnswered) return;

    const nextQueue = pendingNextQueueRef.current ?? roundQueue.slice(1);
    pendingNextQueueRef.current = null;

    setIsAnswered(false);
    setFeedback(null);
    setRoundQueue(nextQueue);
    checkRoundStatus(cardLevels, nextQueue, activeBatchCardIds);
  }, [isAnswered, roundQueue, cardLevels, activeBatchCardIds, checkRoundStatus]);

  // Start next round
  const startNextRound = useCallback(() => {
    const sessionCards = cardsRef.current;
    const unmasteredCards = sessionCards.filter(c => (cardLevels[c.id] ?? 0) < 2);

    if (unmasteredCards.length === 0) {
      setIsDeckMastered(true);
      setIsRoundComplete(true);
      setCurrentQuestion(null);
      return;
    }

    const nextBatch = unmasteredCards.slice(0, ROUND_BATCH_SIZE);
    const nextBatchIds = nextBatch.map(c => c.id);
    setActiveBatchCardIds(nextBatchIds);

    const nextQuestions = nextBatch.map(card => {
      const lvl = cardLevels[card.id] ?? 0;
      return createQuestion(card, lvl, sessionCards);
    });

    setRoundQueue(nextQuestions);
    setCurrentQuestion(nextQuestions.length > 0 ? nextQuestions[0] : null);
    setCurrentRound(r => r + 1);
    setIsRoundComplete(false);
    setIsAnswered(false);
    setFeedback(null);
    pendingNextQueueRef.current = null;
  }, [cardLevels]);

  // Reset/Restart entire Learn session
  const restartSession = useCallback(() => {
    const sessionCards = cardsRef.current.length > 0 ? cardsRef.current : cards;
    cardsRef.current = [...sessionCards];

    const initialLevels: Record<string, MasteryLevel> = {};
    sessionCards.forEach(c => {
      initialLevels[c.id] = 0;
    });
    setCardLevels(initialLevels);

    const firstBatch = sessionCards.slice(0, ROUND_BATCH_SIZE);
    const firstBatchIds = firstBatch.map(c => c.id);
    setActiveBatchCardIds(firstBatchIds);

    const initialQuestions = firstBatch.map(card => createQuestion(card, 0, sessionCards));
    setRoundQueue(initialQuestions);
    setCurrentQuestion(initialQuestions.length > 0 ? initialQuestions[0] : null);
    setCurrentRound(1);
    setIsRoundComplete(false);
    setIsDeckMastered(false);
    setIsAnswered(false);
    setFeedback(null);
    pendingNextQueueRef.current = null;
  }, [cards]);

  return {
    currentQuestion,
    isAnswered,
    feedback,
    currentRound,
    roundQueueLength: roundQueue.length,
    activeBatchCardCount: activeBatchCardIds.length,
    isRoundComplete,
    isDeckMastered,
    cardLevels,
    stats: {
      totalCards,
      level0Count,
      level1Count,
      level2Count,
      deckMasteryPercent,
      familiarPercent,
    },
    actions: {
      answerMultipleChoice,
      submitWrittenAnswer,
      overrideAnswer,
      nextQuestion,
      startNextRound,
      restartSession,
    },
  };
}
