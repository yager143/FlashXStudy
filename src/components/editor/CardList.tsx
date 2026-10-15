import { AnimatePresence } from 'framer-motion';
import type { Card } from '../../types';
import CardEditor from './CardEditor';

interface CardListProps {
  cards: Card[];
  onUpdate: (card: Card) => void;
  onDelete: (id: string) => void;
  onReorder?: (cards: Card[]) => void;
}

export default function CardList({ cards, onUpdate, onDelete, onReorder }: CardListProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-muted)]">
        <p className="text-sm">No cards yet. Add your first card above.</p>
      </div>
    );
  }

  const handleMoveUp = (index: number) => {
    if (index <= 0 || !onReorder) return;
    const newCards = [...cards];
    const [moved] = newCards.splice(index, 1);
    newCards.splice(index - 1, 0, moved);
    onReorder(newCards);
  };

  const handleMoveDown = (index: number) => {
    if (index >= cards.length - 1 || !onReorder) return;
    const newCards = [...cards];
    const [moved] = newCards.splice(index, 1);
    newCards.splice(index + 1, 0, moved);
    onReorder(newCards);
  };

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {cards.map((card, i) => (
          <CardEditor
            key={card.id}
            card={card}
            index={i}
            totalCards={cards.length}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onMoveUp={onReorder ? handleMoveUp : undefined}
            onMoveDown={onReorder ? handleMoveDown : undefined}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

