import { create } from 'zustand';
import type { Deck, Card, Folder, AppView } from '../types';
import {
  getAllDecks,
  getDeckById,
  getCardsByDeckId,
  saveDeck,
  saveCards,
  saveCard,
  deleteCard,
  deleteDeck,
  updateDeckCardCount,
  updateDeckLastStudied,
  reorderCards,
  updateCardMastery,
  getDeckMastery,
  getAllFolders,
  saveFolder,
  deleteFolder as dbDeleteFolder,
  moveDeckToFolder as dbMoveDeckToFolder,
} from '../lib/db';

function genId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface AppState {
  // Navigation
  view: AppView;
  activeDeckId: string | null;

  // Data
  decks: Deck[];
  folders: Folder[];
  selectedFolderId: string | null;
  deckMasteries: Record<string, number>;
  activeCards: Card[];

  // Theme
  isDark: boolean;

  // Actions
  setView: (view: AppView, deckId?: string) => void;
  setSelectedFolderId: (id: string | null) => void;
  toggleTheme: () => void;

  // Folder CRUD
  loadFolders: () => Promise<void>;
  createFolder: (name: string) => Promise<string>;
  renameFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  moveDeckToFolder: (deckId: string, folderId: string | null) => Promise<void>;

  // Deck CRUD
  loadDecks: () => Promise<void>;
  loadDeckCards: (deckId: string) => Promise<void>;
  createDeck: (title: string, description: string, folderId?: string | null) => Promise<string>;
  updateDeck: (id: string, title: string, description: string, folderId?: string | null) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  markDeckStudied: (id: string) => Promise<void>;

  // Card CRUD
  addCard: (deckId: string, term: string, definition: string) => Promise<void>;
  updateCard: (card: Card) => Promise<void>;
  removeCard: (cardId: string, deckId: string) => Promise<void>;
  reorderCards: (cards: Card[]) => Promise<void>;
  recordCardResult: (cardId: string, deckId: string, result: 'known' | 'missed') => Promise<void>;
  bulkImportCards: (deckId: string, cards: Pick<Card, 'term' | 'definition'>[]) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  view: 'dashboard',
  activeDeckId: null,
  decks: [],
  folders: [],
  selectedFolderId: null,
  deckMasteries: {},
  activeCards: [],
  isDark: true,

  setView: (view, deckId) => set({ view, activeDeckId: deckId ?? null }),
  setSelectedFolderId: (id) => set({ selectedFolderId: id }),

  toggleTheme: () => {
    const next = !get().isDark;
    set({ isDark: next });
    document.documentElement.classList.toggle('dark', next);
  },

  loadFolders: async () => {
    const folders = await getAllFolders();
    set({ folders });
  },

  createFolder: async (name: string) => {
    const id = genId();
    const folder: Folder = {
      id,
      name,
      createdAt: Date.now(),
    };
    await saveFolder(folder);
    await get().loadFolders();
    return id;
  },

  renameFolder: async (id: string, name: string) => {
    const folders = get().folders;
    const existing = folders.find(f => f.id === id);
    if (!existing) return;
    await saveFolder({ ...existing, name });
    await get().loadFolders();
  },

  deleteFolder: async (id: string) => {
    await dbDeleteFolder(id);
    if (get().selectedFolderId === id) {
      set({ selectedFolderId: null });
    }
    await get().loadFolders();
    await get().loadDecks();
  },

  moveDeckToFolder: async (deckId: string, folderId: string | null) => {
    await dbMoveDeckToFolder(deckId, folderId);
    await get().loadDecks();
  },

  loadDecks: async () => {
    const decks = await getAllDecks();
    const masteries: Record<string, number> = {};
    for (const d of decks) {
      masteries[d.id] = await getDeckMastery(d.id);
    }
    set({ decks, deckMasteries: masteries });
    await get().loadFolders();
  },

  loadDeckCards: async (deckId) => {
    const cards = await getCardsByDeckId(deckId);
    set({ activeCards: cards });
  },

  createDeck: async (title, description, folderId) => {
    const id = genId();
    const deck: Deck = {
      id,
      title,
      description,
      createdAt: Date.now(),
      lastStudied: null,
      cardCount: 0,
      folderId: folderId ?? null,
    };
    await saveDeck(deck);
    await get().loadDecks();
    return id;
  },

  updateDeck: async (id, title, description, folderId) => {
    const existing = await getDeckById(id);
    if (!existing) return;
    await saveDeck({
      ...existing,
      title,
      description,
      folderId: folderId !== undefined ? folderId : existing.folderId ?? null,
    });
    await get().loadDecks();
  },

  deleteDeck: async (id) => {
    await deleteDeck(id);
    await get().loadDecks();
  },

  markDeckStudied: async (id) => {
    await updateDeckLastStudied(id);
    await get().loadDecks();
  },

  addCard: async (deckId, term, definition) => {
    const cards = await getCardsByDeckId(deckId);
    const card: Card = {
      id: genId(),
      deckId,
      term,
      definition,
      order: cards.length,
      masteryScore: 0,
    };
    await saveCard(card);
    await updateDeckCardCount(deckId);
    await get().loadDeckCards(deckId);
    await get().loadDecks();
  },

  updateCard: async (card) => {
    await saveCard(card);
    await get().loadDeckCards(card.deckId);
  },

  removeCard: async (cardId, deckId) => {
    await deleteCard(cardId);
    await updateDeckCardCount(deckId);
    await get().loadDeckCards(deckId);
    await get().loadDecks();
  },

  reorderCards: async (cards) => {
    await reorderCards(cards);
    set({ activeCards: cards });
  },

  recordCardResult: async (cardId, deckId, result) => {
    const currentCard = get().activeCards.find(c => c.id === cardId);
    const prevScore = currentCard?.masteryScore ?? 0;
    const newScore = result === 'known' ? Math.min(1, Math.max(0.5, prevScore + 0.5)) : Math.max(0, prevScore - 0.5);
    await updateCardMastery(cardId, newScore);
    const updatedCards = get().activeCards.map(c =>
      c.id === cardId ? { ...c, masteryScore: newScore } : c
    );
    const mastery = await getDeckMastery(deckId);
    set(state => ({
      activeCards: updatedCards,
      deckMasteries: { ...state.deckMasteries, [deckId]: mastery },
    }));
  },

  bulkImportCards: async (deckId, newCards) => {
    const existing = await getCardsByDeckId(deckId);
    const offset = existing.length;
    const cards: Card[] = newCards.map((c, i) => ({
      id: genId(),
      deckId,
      term: c.term,
      definition: c.definition,
      order: offset + i,
      masteryScore: 0,
    }));
    await saveCards(cards);
    await updateDeckCardCount(deckId);
    await get().loadDeckCards(deckId);
    await get().loadDecks();
  },
}));
