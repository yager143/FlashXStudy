import { db, saveDeck, saveCards } from './db';
import type { Deck, Card } from '../types';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function seedSampleDeck(): Promise<void> {
  // Check if already seeded
  const existing = await db.decks.count();
  if (existing > 0) return;

  const deckId = generateId();
  const now = Date.now();

  const deck: Deck = {
    id: deckId,
    title: 'Cell Biology & Organelles',
    description: 'Master the key structures of eukaryotic cells, their functions, and their roles in cellular processes.',
    createdAt: now,
    lastStudied: null,
    cardCount: 6,
  };

  const cardData = [
    {
      term: 'Mitochondria',
      definition: 'The "powerhouse of the cell." Generates ATP through cellular respiration (oxidative phosphorylation). Contains its own DNA and double membrane.',
    },
    {
      term: 'Endoplasmic Reticulum (ER)',
      definition: 'Network of membrane-bound tubules. Rough ER (with ribosomes) synthesizes proteins; Smooth ER synthesizes lipids and detoxifies chemicals.',
    },
    {
      term: 'Golgi Apparatus',
      definition: 'The cell\'s "post office." Modifies, packages, and ships proteins from the rough ER to their final destinations (lysosomes, plasma membrane, or secretion).',
    },
    {
      term: 'Lysosome',
      definition: 'Membrane-bound organelle containing hydrolytic enzymes. Digests waste materials, cellular debris, and foreign invaders (autophagy and phagocytosis).',
    },
    {
      term: 'Nucleus',
      definition: 'Control center of the cell. Contains chromatin (DNA + histones), the nucleolus (ribosome assembly), and is enclosed by a double-layered nuclear envelope with pores.',
    },
    {
      term: 'Ribosome',
      definition: 'Molecular machine that synthesizes proteins by translating mRNA. Found free in the cytoplasm (cytosolic proteins) or bound to rough ER (secretory/membrane proteins).',
    },
  ];

  const cards: Card[] = cardData.map((c, i) => ({
    id: generateId(),
    deckId,
    term: c.term,
    definition: c.definition,
    order: i,
    masteryScore: 0,
  }));

  await saveDeck(deck);
  await saveCards(cards);
  console.log('[FlashXStudy] Sample deck seeded ✓');
}
