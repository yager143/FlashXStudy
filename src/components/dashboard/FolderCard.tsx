import { useState } from 'react';
import { motion } from 'framer-motion';
import { Folder, MoreVertical, Pencil, Trash2, ArrowRight } from 'lucide-react';
import type { Folder as FolderType } from '../../types';

interface FolderCardProps {
  folder: FolderType;
  deckCount: number;
  onClick: () => void;
  onRename: (id: string, currentName: string) => void;
  onDelete: (id: string, name: string) => void;
}

export default function FolderCard({
  folder,
  deckCount,
  onClick,
  onRename,
  onDelete,
}: FolderCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.div
      id={`folder-card-${folder.id}`}
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="group relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden transition-all duration-200 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/5 flex flex-col justify-between cursor-pointer"
    >
      {/* Top accent line */}
      <div
        className="h-1 w-full"
        style={{ background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }}
      />

      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        {/* Header row: Folder Icon + Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-amber-400/15 text-amber-400 border border-amber-400/30 group-hover:scale-105 transition-transform">
            <Folder size={22} />
          </div>

          {/* 3-dots options menu */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              id={`folder-menu-${folder.id}`}
              onClick={() => setMenuOpen(v => !v)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] opacity-80 group-hover:opacity-100 transition-all cursor-pointer"
              title="Folder options"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 z-40 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl py-1.5 min-w-[140px]">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onRename(folder.id, folder.name);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer text-left"
                  >
                    <Pencil size={13} />
                    <span>Rename</span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(folder.id, folder.name);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[var(--danger)] hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Folder Title & Deck Count */}
        <div>
          <h3
            className="font-bold text-[var(--text)] text-lg leading-snug truncate group-hover:text-amber-400 transition-colors"
            title={folder.name}
          >
            {folder.name}
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-semibold">
            {deckCount} {deckCount === 1 ? 'deck' : 'decks'}
          </p>
        </div>

        {/* Footer row: Open folder cue */}
        <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-muted)] group-hover:text-amber-400 transition-colors">
          <span className="font-semibold text-[11px] uppercase tracking-wider">Open Folder</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}
