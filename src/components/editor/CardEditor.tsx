import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { Trash2, GripVertical, Check, X, ChevronUp, ChevronDown } from 'lucide-react';
import type { Card } from '../../types';

interface CardEditorProps {
  card: Card;
  index: number;
  totalCards?: number;
  onUpdate: (card: Card) => void;
  onDelete: (id: string) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
}

export default function CardEditor({
  card,
  index,
  totalCards = 1,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: CardEditorProps) {
  const [term, setTerm] = useState(card.term);
  const [definition, setDefinition] = useState(card.definition);
  const [isDirty, setIsDirty] = useState(false);

  const handleSave = () => {
    if (!term.trim() && !definition.trim()) return;
    onUpdate({ ...card, term: term.trim(), definition: definition.trim() });
    setIsDirty(false);
  };

  const handleDiscard = () => {
    setTerm(card.term);
    setDefinition(card.definition);
    setIsDirty(false);
  };

  const handleChange = (field: 'term' | 'definition', value: string) => {
    if (field === 'term') setTerm(value);
    else setDefinition(value);
    setIsDirty(true);
  };

  return (
    <motion.div
      id={`card-item-${card.id}`}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden hover:border-[var(--accent)]/30 transition-all duration-200"
    >
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[var(--surface-2)] border-b border-[var(--border)]">
        <span className="text-[var(--text-muted)] flex items-center gap-1">
          <GripVertical size={16} />
        </span>
        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          Card {index + 1}
        </span>

        {/* Move up / down controls */}
        <div className="flex items-center gap-0.5 ml-2">
          {onMoveUp && (
            <button
              id={`move-up-card-${card.id}`}
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              className="p-1 rounded hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              title="Move card up"
            >
              <ChevronUp size={14} />
            </button>
          )}
          {onMoveDown && (
            <button
              id={`move-down-card-${card.id}`}
              onClick={() => onMoveDown(index)}
              disabled={index === totalCards - 1}
              className="p-1 rounded hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              title="Move card down"
            >
              <ChevronDown size={14} />
            </button>
          )}
        </div>

        <div className="flex-1" />
        {isDirty && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1"
            >
              <button
                id={`save-card-${card.id}`}
                onClick={handleSave}
                className="p-1 rounded-lg bg-[var(--success)]/20 text-[var(--success)] hover:bg-[var(--success)]/30 transition-colors"
                title="Save changes"
              >
                <Check size={14} />
              </button>
              <button
                id={`discard-card-${card.id}`}
                onClick={handleDiscard}
                className="p-1 rounded-lg bg-[var(--danger-dim)] text-[var(--danger)] hover:bg-[var(--danger)]/30 transition-colors"
                title="Discard changes"
              >
                <X size={14} />
              </button>
            </motion.div>
          </AnimatePresence>
        )}
        <button
          id={`delete-card-${card.id}`}
          onClick={() => onDelete(card.id)}
          className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-dim)] opacity-0 group-hover:opacity-100 transition-all duration-150"
          title="Delete card"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-0 divide-x divide-[var(--border)]">
        <div className="p-4">
          <label className="block text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">
            Term
          </label>
          <textarea
            id={`card-term-${card.id}`}
            value={term}
            onChange={(e) => handleChange('term', e.target.value)}
            onBlur={handleSave}
            rows={2}
            placeholder="Enter term..."
            className="w-full bg-transparent text-[var(--text)] text-sm resize-none focus:outline-none placeholder-[var(--text-muted)] leading-relaxed"
          />
        </div>
        <div className="p-4">
          <label className="block text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">
            Definition
          </label>
          <textarea
            id={`card-def-${card.id}`}
            value={definition}
            onChange={(e) => handleChange('definition', e.target.value)}
            onBlur={handleSave}
            rows={2}
            placeholder="Enter definition..."
            className="w-full bg-transparent text-[var(--text)] text-sm resize-none focus:outline-none placeholder-[var(--text-muted)] leading-relaxed"
          />
        </div>
      </div>
    </motion.div>
  );
}
