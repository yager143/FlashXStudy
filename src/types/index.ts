export interface Folder {
  id: string;
  name: string;
  createdAt: number;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  lastStudied: number | null;
  cardCount: number;
  folderId?: string | null;
}

export interface Card {
  id: string;
  deckId: string;
  term: string;
  definition: string;
  order: number;
  masteryScore: number; // 0–1 lifetime mastery
}

export interface StudySession {
  deckId: string;
  round: number;
  trackProgress: boolean;
  currentIndex: number;
  cards: Card[];
  knownIds: Set<string>;
  missedIds: Set<string>;
  isComplete: boolean;
}

export type AppView = 'dashboard' | 'editor' | 'study' | 'learn' | 'deck-overview' | 'match' | 'test';

export type MasteryLevel = 0 | 1 | 2; // 0 = Unseen / Familiarizing, 1 = Familiar (Level 1), 2 = Mastered (Level 2)

export type LearnQuestionType = 'multiple-choice' | 'written';

export interface LearnQuestion {
  id: string;
  card: Card;
  level: MasteryLevel;
  type: LearnQuestionType;
  options?: string[]; // for multiple choice
  correctOptionIndex?: number;
}

