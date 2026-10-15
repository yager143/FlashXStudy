import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Upload, Download } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import CardList from '../components/editor/CardList';
import BulkImportModal from '../components/editor/BulkImportModal';
import BulkExportModal from '../components/editor/BulkExportModal';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function DeckEditorView() {
  const {
    activeDeckId,
    decks,
    activeCards,
    loadDeckCards,
    folders,
    loadFolders,
    updateDeck,
    addCard,
    updateCard,
    removeCard,
    reorderCards,
    bulkImportCards,
    setView,
  } = useAppStore();

  const deck = decks.find(d => d.id === activeDeckId);

  const [title, setTitle] = useState(deck?.title ?? '');
  const [description, setDescription] = useState(deck?.description ?? '');
  const [folderId, setFolderId] = useState<string | null>(deck?.folderId ?? null);
  const [prevDeckId, setPrevDeckId] = useState(deck?.id);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (activeDeckId) loadDeckCards(activeDeckId);
  }, [activeDeckId, loadDeckCards]);

  useEffect(() => {
    if (folders.length === 0) loadFolders();
  }, [folders.length, loadFolders]);

  if (deck && deck.id !== prevDeckId) {
    setPrevDeckId(deck.id);
    setTitle(deck.title);
    setDescription(deck.description);
    setFolderId(deck.folderId ?? null);
  }

  const handleSaveMeta = async (newFId?: string | null) => {
    if (!activeDeckId || !title.trim()) return;
    const targetFolderId = newFId !== undefined ? newFId : folderId;
    await updateDeck(activeDeckId, title.trim(), description.trim(), targetFolderId);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddCard = async () => {
    if (!activeDeckId) return;
    await addCard(activeDeckId, '', '');
  };

  if (!deck || !activeDeckId) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[var(--text-muted)]">
        Deck not found.{' '}
        <button onClick={() => setView('dashboard')} className="ml-2 text-[var(--accent)] underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl">
        <div className="w-full max-w-5xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              id="back-to-deck-btn"
              onClick={() => setView('deck-overview', activeDeckId)}
              className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] transition-all hover:border-[var(--accent)]/40 active:scale-95 cursor-pointer shadow-sm"
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--text)] truncate max-w-[240px]">{deck.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowExport(true)} id="export-deck-btn">
              <Download size={14} />
              Export
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowImport(true)} id="import-deck-btn">
              <Upload size={14} />
              Import
            </Button>
            <Button
              id="learn-this-deck-btn"
              size="sm"
              onClick={() => setView('learn', activeDeckId)}
              disabled={activeCards.length === 0}
            >
              Learn
            </Button>
            <Button
              id="study-this-deck-btn"
              variant="outline"
              size="sm"
              onClick={() => setView('study', activeDeckId)}
              disabled={activeCards.length === 0}
            >
              Study
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="w-full max-w-5xl mx-auto px-6 md:px-12 py-8">
        {/* Deck Meta */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 mb-8"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
                Deck Title
              </label>
              <input
                id="deck-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleSaveMeta()}
                placeholder="Enter deck title..."
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-lg font-semibold focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 placeholder-[var(--text-muted)] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
                Description
              </label>
              <textarea
                id="deck-desc-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => handleSaveMeta()}
                rows={2}
                placeholder="What's this deck about?"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 placeholder-[var(--text-muted)] resize-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
                Folder (Optional)
              </label>
              <select
                id="deck-folder-select"
                value={folderId ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? e.target.value : null;
                  setFolderId(val);
                  handleSaveMeta(val);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all cursor-pointer"
              >
                <option value="">No Folder (Main Page)</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>
            {saved && (
              <p className="text-xs text-[var(--success)] font-semibold">✓ Saved</p>
            )}
          </div>
        </motion.div>

        {/* Cards Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[var(--text)]">
            Cards
            <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">
              ({activeCards.length})
            </span>
          </h2>
          <Button id="add-card-btn" size="sm" onClick={handleAddCard}>
            <Plus size={14} />
            Add Card
          </Button>
        </div>

        <CardList
          cards={activeCards}
          onUpdate={updateCard}
          onDelete={(id) => removeCard(id, activeDeckId)}
          onReorder={reorderCards}
        />

        {/* Add Card (bottom) */}
        {activeCards.length > 0 && (
          <div className="mt-4 text-center">
            <Button variant="ghost" id="add-card-bottom-btn" onClick={handleAddCard}>
              <Plus size={14} />
              Add Another Card
            </Button>
          </div>
        )}
      </main>

      {/* Modals */}
      <BulkImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImport={(cards) => bulkImportCards(activeDeckId, cards)}
      />
      <BulkExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        deck={deck}
        cards={activeCards}
      />
    </div>
  );
}
