import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Pencil, MoreVertical, Folder, FolderInput, Check, X } from 'lucide-react';
import type { Deck } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface DeckCardProps {
  deck: Deck;
  onLearn: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function DeckCard({ deck, onLearn, onEdit, onDelete }: DeckCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const { folders, moveDeckToFolder } = useAppStore();

  const assignedFolder = deck.folderId ? folders.find(f => f.id === deck.folderId) : null;

  const handleSelectFolder = async (folderId: string | null) => {
    await moveDeckToFolder(deck.id, folderId);
    setShowFolderModal(false);
    setMenuOpen(false);
  };

  return (
    <>
      <motion.div
        id={`deck-card-${deck.id}`}
        layout
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.15 }}
        onClick={() => onLearn(deck.id)}
        className="group relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden transition-all duration-200 hover:border-[var(--accent)]/60 hover:shadow-xl hover:shadow-[var(--accent)]/10 flex flex-col justify-between cursor-pointer opacity-100 select-none"
      >
        {/* Top accent line */}
        <div
          className="h-1.5 w-full transition-all duration-200 group-hover:h-2"
          style={{ background: 'linear-gradient(90deg, var(--accent), #f43f5e)' }}
        />

        <div className="p-6 flex flex-col flex-1 justify-between gap-4">
          {/* Header row: Title + Count & Action Menu */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3
                className="font-bold text-[var(--text)] text-lg sm:text-xl leading-snug truncate group-hover:text-[var(--accent)] transition-colors"
                title={deck.title}
              >
                {deck.title}
              </h3>

              <div className="flex items-center gap-2 mt-2">
                {/* Amount of Cards */}
                <span className="text-xs text-[var(--text-muted)] font-semibold">
                  {deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'}
                </span>

                {/* Assigned Folder Badge */}
                {assignedFolder && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-400/10 text-amber-400 border border-amber-400/25 truncate max-w-[140px]">
                    <Folder size={10} className="shrink-0" />
                    <span className="truncate">{assignedFolder.name}</span>
                  </span>
                )}
              </div>

              {deck.description && (
                <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-2 leading-relaxed">
                  {deck.description}
                </p>
              )}
            </div>

            {/* 3-Dots Menu Button */}
            <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                id={`deck-menu-${deck.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(v => !v);
                }}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] opacity-80 group-hover:opacity-100 transition-all duration-150 cursor-pointer"
                title="Deck Options"
              >
                <MoreVertical size={18} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
                  <div
                    className="absolute right-0 top-8 z-40 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl py-1.5 min-w-[170px] backdrop-blur-md"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Move to Folder */}
                    <button
                      id={`move-deck-${deck.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        setShowFolderModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)] transition-colors cursor-pointer text-left"
                    >
                      <FolderInput size={14} className="text-amber-400" />
                      <span>Move to Folder…</span>
                    </button>

                    {/* Edit Deck */}
                    <button
                      id={`edit-deck-${deck.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onEdit(deck.id);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer text-left"
                    >
                      <Pencil size={14} />
                      <span>Edit Deck</span>
                    </button>

                    <div className="my-1 border-t border-[var(--border)]" />

                    {/* Delete Deck */}
                    <button
                      id={`delete-deck-${deck.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDelete(deck.id);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-[var(--danger)] hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
                    >
                      <Trash2 size={14} />
                      <span>Delete Deck</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Move to Folder Modal */}
      <AnimatePresence>
        {showFolderModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <FolderInput size={18} className="text-amber-400" />
                  <h3 className="font-bold text-[var(--text)] text-base">Move to Folder</h3>
                </div>
                <button
                  onClick={() => setShowFolderModal(false)}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-[var(--text-muted)]">
                Select where to place <span className="font-semibold text-[var(--text)]">"{deck.title}"</span>:
              </p>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {/* None / Remove from Folder */}
                <button
                  onClick={() => handleSelectFolder(null)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    !deck.folderId
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text)]'
                      : 'border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--accent)]/40 text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">📂</span>
                    <span>None (Main Page / Unassigned)</span>
                  </div>
                  {!deck.folderId && <Check size={14} className="text-[var(--accent)]" />}
                </button>

                {/* Available Folders */}
                {folders.map(folder => {
                  const isCurrent = deck.folderId === folder.id;
                  return (
                    <button
                      key={folder.id}
                      onClick={() => handleSelectFolder(folder.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-amber-400 bg-amber-400/10 text-[var(--text)]'
                          : 'border-[var(--border)] bg-[var(--surface-2)] hover:border-amber-400/40 text-[var(--text-muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Folder size={16} className="text-amber-400 shrink-0" />
                        <span className="truncate">{folder.name}</span>
                      </div>
                      {isCurrent && <Check size={14} className="text-amber-400 shrink-0" />}
                    </button>
                  );
                })}

                {folders.length === 0 && (
                  <p className="text-center py-4 text-xs text-[var(--text-muted)]">
                    No folders created yet. Create a folder on the dashboard first!
                  </p>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowFolderModal(false)}
                  className="px-4 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface)] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
