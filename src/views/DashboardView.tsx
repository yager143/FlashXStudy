import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  BookOpen,
  Folder as FolderIcon,
  FolderPlus,
  ArrowLeft,
  Pencil,
  Trash2,
} from 'lucide-react';

import { useAppStore } from '../store/useAppStore';
import DeckCard from '../components/dashboard/DeckCard';
import FolderCard from '../components/dashboard/FolderCard';
import SearchBar from '../components/dashboard/SearchBar';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';
import Modal from '../components/ui/Modal';

export default function DashboardView() {
  const navigate = useNavigate();
  const {
    decks,
    folders,
    selectedFolderId,
    setSelectedFolderId,
    loadDecks,
    loadFolders,
    createDeck,
    deleteDeck,
    createFolder,
    renameFolder,
    deleteFolder,
    setView,
  } = useAppStore();

  const [search, setSearch] = useState('');

  // Create Deck Modal State
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [newDeckFolderId, setNewDeckFolderId] = useState<string>('');
  const [creatingDeck, setCreatingDeck] = useState(false);

  // Create Folder Modal State
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  // Rename Folder Modal State
  const [renamingFolder, setRenamingFolder] = useState<{ id: string; name: string } | null>(null);
  const [renameInput, setRenameInput] = useState('');

  useEffect(() => {
    loadDecks();
    loadFolders();
  }, [loadDecks, loadFolders]);

  // Current Active Folder (if drilled down)
  const activeFolder = selectedFolderId
    ? folders.find(f => f.id === selectedFolderId)
    : null;

  // Decks filtering
  const displayedDecks = selectedFolderId
    ? decks.filter(d => d.folderId === selectedFolderId)
    : decks;

  const filteredDecks = displayedDecks.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Handle Create Deck
  const handleCreateDeck = async () => {
    if (!newDeckTitle.trim()) return;
    setCreatingDeck(true);
    const assignedFolder = newDeckFolderId ? newDeckFolderId : null;
    const id = await createDeck(newDeckTitle.trim(), newDeckDesc.trim(), assignedFolder);
    setCreatingDeck(false);
    setShowCreateDeck(false);
    setNewDeckTitle('');
    setNewDeckDesc('');
    setNewDeckFolderId('');
    setView('deck-overview', id);
    navigate(`/deck/${id}`);
  };

  // Handle Create Folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreatingFolder(true);
    await createFolder(newFolderName.trim());
    setCreatingFolder(false);
    setShowCreateFolder(false);
    setNewFolderName('');
  };

  // Handle Rename Folder
  const handleSaveRename = async () => {
    if (!renamingFolder || !renameInput.trim()) return;
    await renameFolder(renamingFolder.id, renameInput.trim());
    setRenamingFolder(null);
    setRenameInput('');
  };

  // Handle Delete Folder
  const handleDeleteFolder = async (id: string, name: string) => {
    if (confirm(`Delete folder "${name}"? Decks inside will NOT be deleted and will move to the main page.`)) {
      await deleteFolder(id);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* App Header (No lightning bolt logo) */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-[var(--text)]">
              Flash<span className="text-[var(--accent)]">X</span>Study
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Dedicated Larger Search Bar Section */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)]/30 py-6 px-6 md:px-12 w-full">
        <div className="mx-auto w-full max-w-2xl flex justify-center">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search decks and study sets…"
            large
          />
        </div>
      </div>

      <main className="w-full max-w-7xl mx-auto px-6 md:px-12 py-8 space-y-10">
        {activeFolder ? (
          /* =========================================================================
             FOLDER VIEW (Drill-down view inside a selected folder)
             ========================================================================= */
          <div className="space-y-8">
            {/* Folder Header & Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                {/* Back button with ONLY backwards arrow */}
                <button
                  id="back-to-dashboard-btn"
                  onClick={() => setSelectedFolderId(null)}
                  className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Back"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-400/15 text-amber-400 border border-amber-400/30">
                    <FolderIcon size={20} />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
                      {activeFolder.name}
                    </h1>
                    <p className="text-xs text-[var(--text-muted)] font-semibold mt-0.5">
                      {displayedDecks.length} {displayedDecks.length === 1 ? 'deck' : 'decks'} in this folder
                    </p>
                  </div>
                </div>
              </div>

              {/* Folder Actions */}
              <div className="flex items-center gap-2">
                <Button
                  id="folder-rename-btn"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRenamingFolder(activeFolder);
                    setRenameInput(activeFolder.name);
                  }}
                  className="rounded-lg"
                >
                  <Pencil size={14} />
                  <span>Rename</span>
                </Button>

                <Button
                  id="folder-delete-btn"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteFolder(activeFolder.id, activeFolder.name)}
                  className="text-[var(--danger)] hover:bg-rose-500/10 rounded-lg"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </Button>

                <Button
                  id="add-deck-to-folder-btn"
                  size="sm"
                  onClick={() => {
                    setNewDeckFolderId(activeFolder.id);
                    setShowCreateDeck(true);
                  }}
                  className="rounded-lg"
                >
                  <Plus size={15} />
                  <span>New Deck</span>
                </Button>
              </div>
            </div>

            {/* Folder Decks Grid */}
            <div className="space-y-6">
              {filteredDecks.length === 0 ? (
                <div className="p-12 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-center space-y-3">
                  <div className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center bg-amber-400/10 text-amber-400 mb-2">
                    <BookOpen size={24} />
                  </div>
                  <h3 className="font-bold text-[var(--text)] text-base">
                    {search ? 'No matching decks in this folder' : 'No decks in this folder yet'}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                    {search
                      ? 'Try another search query.'
                      : 'Create a new deck here or move existing decks into this folder using the 3-dots menu.'}
                  </p>
                  {!search && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setNewDeckFolderId(activeFolder.id);
                        setShowCreateDeck(true);
                      }}
                      className="rounded-lg"
                    >
                      <Plus size={14} />
                      <span>Add Deck to {activeFolder.name}</span>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredDecks.map(deck => (
                    <DeckCard
                      key={deck.id}
                      deck={deck}
                      onLearn={(id) => {
                        setView('deck-overview', id);
                        navigate(`/deck/${id}`);
                      }}
                      onEdit={(id) => {
                        setView('editor', id);
                        navigate(`/editor/${id}`);
                      }}
                      onDelete={(id) => {
                        if (confirm(`Delete "${deck.title}"? This cannot be undone.`)) {
                          deleteDeck(id);
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* =========================================================================
             MAIN DASHBOARD VIEW (Folders on Top, Divider, Decks Below)
             ========================================================================= */
          <>
            {/* ===================================================================
                TOP SECTION: FOLDERS
                =================================================================== */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderIcon size={18} className="text-amber-400" />
                  <h2 className="text-lg font-bold text-[var(--text)] tracking-tight">
                    Folders
                  </h2>
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]">
                    {folders.length}
                  </span>
                </div>

                <Button
                  id="create-folder-btn"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateFolder(true)}
                  className="rounded-lg hover:border-amber-400/50 hover:text-amber-400"
                >
                  <FolderPlus size={15} className="text-amber-400" />
                  <span>Create Folder</span>
                </Button>
              </div>

              {/* Folders Grid */}
              {folders.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)]/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-400/10 text-amber-400 border border-amber-400/20 shrink-0">
                      <FolderPlus size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[var(--text)]">Organize with Folders</h4>
                      <p className="text-xs text-[var(--text-muted)]">
                        Group related decks by subject, class, or topic.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCreateFolder(true)}
                    className="rounded-lg border-amber-400/40 text-amber-400 hover:bg-amber-400/10"
                  >
                    <Plus size={14} />
                    <span>New Folder</span>
                  </Button>
                </div>
              ) : (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {folders.map(folder => {
                    const deckCountInFolder = decks.filter(d => d.folderId === folder.id).length;
                    return (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        deckCount={deckCountInFolder}
                        onClick={() => setSelectedFolderId(folder.id)}
                        onRename={(id, name) => {
                          setRenamingFolder({ id, name });
                          setRenameInput(name);
                        }}
                        onDelete={(id, name) => handleDeleteFolder(id, name)}
                      />
                    );
                  })}
                </div>
              )}
            </section>

            {/* ===================================================================
                HORIZONTAL DIVIDER LINE
                =================================================================== */}
            <div className="relative py-2">
              <hr className="border-t border-[var(--border)]" />
              <span className="absolute left-1/2 -translate-x-1/2 -top-1 px-3 bg-[var(--bg)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] border border-[var(--border)] rounded-md">
                Decks
              </span>
            </div>

            {/* ===================================================================
                BOTTOM SECTION: DECKS
                =================================================================== */}
            <section className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[var(--text)] tracking-tight">
                    Decks
                  </h2>
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]">
                    {decks.length}
                  </span>
                </div>

                <Button
                  id="create-deck-btn"
                  onClick={() => {
                    setNewDeckFolderId('');
                    setShowCreateDeck(true);
                  }}
                  size="md"
                  className="rounded-lg"
                >
                  <Plus size={16} />
                  <span>New Deck</span>
                </Button>
              </div>

              {/* Decks Grid */}
              {filteredDecks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <BookOpen size={28} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <h3 className="text-base font-semibold text-[var(--text)] mb-1">
                    {search ? 'No matching decks' : 'No decks yet'}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mb-5 max-w-xs">
                    {search
                      ? 'Try a different search term.'
                      : 'Create your first study deck to get started!'}
                  </p>
                  {!search && (
                    <Button
                      id="create-first-deck-btn"
                      onClick={() => {
                        setNewDeckFolderId('');
                        setShowCreateDeck(true);
                      }}
                      size="sm"
                      className="rounded-lg"
                    >
                      <Plus size={15} />
                      <span>Create Your First Deck</span>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-100">
                  {filteredDecks.map(deck => (
                    <DeckCard
                      key={deck.id}
                      deck={deck}
                      onLearn={(id) => {
                        setView('deck-overview', id);
                        navigate(`/deck/${id}`);
                      }}
                      onEdit={(id) => {
                        setView('editor', id);
                        navigate(`/editor/${id}`);
                      }}
                      onDelete={(id) => {
                        if (confirm(`Delete "${deck.title}"? This cannot be undone.`)) {
                          deleteDeck(id);
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* =========================================================================
          CREATE DECK MODAL
          ========================================================================= */}
      <Modal
        isOpen={showCreateDeck}
        onClose={() => setShowCreateDeck(false)}
        title="Create New Deck"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
              Deck Title *
            </label>
            <input
              id="new-deck-title-input"
              type="text"
              value={newDeckTitle}
              onChange={(e) => setNewDeckTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateDeck(); }}
              placeholder="e.g., Spanish Vocabulary"
              autoFocus
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 placeholder-[var(--text-muted)] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
              Description (optional)
            </label>
            <textarea
              id="new-deck-desc-input"
              value={newDeckDesc}
              onChange={(e) => setNewDeckDesc(e.target.value)}
              rows={2}
              placeholder="What are you studying?"
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 placeholder-[var(--text-muted)] resize-none transition-all"
            />
          </div>

          {/* Folder Selector Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
              Folder (Optional)
            </label>
            <select
              id="new-deck-folder-select"
              value={newDeckFolderId}
              onChange={(e) => setNewDeckFolderId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all cursor-pointer"
            >
              <option value="">No Folder (Main Page)</option>
              {folders.map(f => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" id="cancel-create-deck-btn" onClick={() => setShowCreateDeck(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button
              id="confirm-create-deck-btn"
              onClick={handleCreateDeck}
              disabled={!newDeckTitle.trim() || creatingDeck}
              className="rounded-lg"
            >
              {creatingDeck ? 'Creating…' : 'Create Deck'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          CREATE FOLDER MODAL
          ========================================================================= */}
      <Modal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        title="Create New Folder"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
              Folder Name *
            </label>
            <input
              id="new-folder-name-input"
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); }}
              placeholder="e.g., Biology 101, Fall Semester"
              autoFocus
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 placeholder-[var(--text-muted)] transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreateFolder(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button
              id="confirm-create-folder-btn"
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim() || creatingFolder}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
            >
              {creatingFolder ? 'Creating…' : 'Create Folder'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          RENAME FOLDER MODAL
          ========================================================================= */}
      <Modal
        isOpen={renamingFolder !== null}
        onClose={() => setRenamingFolder(null)}
        title="Rename Folder"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
              Folder Name *
            </label>
            <input
              id="rename-folder-input"
              type="text"
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveRename(); }}
              autoFocus
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 placeholder-[var(--text-muted)] transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setRenamingFolder(null)} className="rounded-lg">
              Cancel
            </Button>
            <Button
              id="confirm-rename-folder-btn"
              onClick={handleSaveRename}
              disabled={!renameInput.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
