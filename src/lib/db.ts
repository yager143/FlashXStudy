import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Deck, Card, Folder } from '../types';

class FlashXDB extends Dexie {
  decks!: Table<Deck>;
  cards!: Table<Card>;
  folders!: Table<Folder>;

  constructor() {
    super('FlashXStudyDB');
    this.version(1).stores({
      decks: 'id, title, createdAt, lastStudied',
      cards: 'id, deckId, order',
    });
    this.version(2).stores({
      decks: 'id, title, createdAt, lastStudied, folderId',
      cards: 'id, deckId, order',
      folders: 'id, name, createdAt',
    });
  }
}

export const db = new FlashXDB();

// ─── Folder Operations ────────────────────────────────────────────────────────

export async function getAllFolders(): Promise<Folder[]> {
  return db.folders.orderBy('createdAt').reverse().toArray();
}

export async function getFolderById(id: string): Promise<Folder | undefined> {
  return db.folders.get(id);
}

export async function saveFolder(folder: Folder): Promise<void> {
  await db.folders.put(folder);
}

export async function deleteFolder(id: string): Promise<void> {
  await db.transaction('rw', db.folders, db.decks, async () => {
    await db.folders.delete(id);
    const decksInFolder = await db.decks.where('folderId').equals(id).toArray();
    for (const d of decksInFolder) {
      await db.decks.update(d.id, { folderId: null });
    }
  });
}

export async function moveDeckToFolder(deckId: string, folderId: string | null): Promise<void> {
  await db.decks.update(deckId, { folderId: folderId ?? null });
}

// ─── Deck Operations ──────────────────────────────────────────────────────────

export async function getAllDecks(): Promise<Deck[]> {
  return db.decks.orderBy('createdAt').reverse().toArray();
}

export async function getDeckById(id: string): Promise<Deck | undefined> {
  return db.decks.get(id);
}

export async function saveDeck(deck: Deck): Promise<void> {
  await db.decks.put(deck);
}

export async function deleteDeck(id: string): Promise<void> {
  await db.transaction('rw', db.decks, db.cards, async () => {
    await db.decks.delete(id);
    await db.cards.where('deckId').equals(id).delete();
  });
}

export async function updateDeckLastStudied(deckId: string): Promise<void> {
  await db.decks.update(deckId, { lastStudied: Date.now() });
}

export async function updateDeckCardCount(deckId: string): Promise<void> {
  const count = await db.cards.where('deckId').equals(deckId).count();
  await db.decks.update(deckId, { cardCount: count });
}

// ─── Card Operations ──────────────────────────────────────────────────────────

export async function getCardsByDeckId(deckId: string): Promise<Card[]> {
  return db.cards.where('deckId').equals(deckId).sortBy('order');
}

export async function saveCard(card: Card): Promise<void> {
  await db.cards.put(card);
}

export async function saveCards(cards: Card[]): Promise<void> {
  await db.cards.bulkPut(cards);
}

export async function deleteCard(id: string): Promise<void> {
  await db.cards.delete(id);
}

export async function reorderCards(cards: Card[]): Promise<void> {
  const updates = cards.map((c, i) => ({ ...c, order: i }));
  await db.cards.bulkPut(updates);
}

export async function updateCardMastery(cardId: string, masteryScore: number): Promise<void> {
  await db.cards.update(cardId, { masteryScore });
}

export async function getDeckMastery(deckId: string): Promise<number> {
  const cards = await db.cards.where('deckId').equals(deckId).toArray();
  if (cards.length === 0) return 0;
  const total = cards.reduce((sum, c) => sum + (c.masteryScore || 0), 0);
  return Math.round((total / cards.length) * 100);
}

