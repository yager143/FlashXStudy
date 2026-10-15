import { useState } from 'react';
import { Upload, Eye } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (cards: { term: string; definition: string }[]) => void;
}

export default function BulkImportModal({ isOpen, onClose, onImport }: BulkImportModalProps) {
  const [rawText, setRawText] = useState('');
  const [termDefDelimiter, setTermDefDelimiter] = useState('\\t');
  const [cardDelimiter, setCardDelimiter] = useState('\\n');
  const [showPreview, setShowPreview] = useState(false);

  const parseCards = (text: string): { term: string; definition: string }[] => {
    const tdSep = termDefDelimiter === '\\t' ? '\t' : termDefDelimiter === '\\n' ? '\n' : termDefDelimiter;
    const cardSep = cardDelimiter === '\\n' ? '\n' : cardDelimiter === '\\n\\n' ? '\n\n' : cardDelimiter;

    return text
      .split(cardSep)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const idx = line.indexOf(tdSep);
        if (idx === -1) return null;
        return {
          term: line.slice(0, idx).trim(),
          definition: line.slice(idx + tdSep.length).trim(),
        };
      })
      .filter(Boolean) as { term: string; definition: string }[];
  };

  const preview = parseCards(rawText);

  const handleImport = () => {
    if (preview.length === 0) return;
    onImport(preview);
    setRawText('');
    setShowPreview(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Import Cards" maxWidth="max-w-3xl">
      <div className="space-y-5">
        {/* Delimiter Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
              Term ↔ Definition Delimiter
            </label>
            <select
              id="td-delimiter-select"
              value={termDefDelimiter}
              onChange={(e) => setTermDefDelimiter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="\\t">Tab (Quizlet default)</option>
              <option value=",">Comma</option>
              <option value=" - "> Dash ( - )</option>
              <option value=":">Colon</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
              Card Separator
            </label>
            <select
              id="card-delimiter-select"
              value={cardDelimiter}
              onChange={(e) => setCardDelimiter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="\\n">Newline (one per line)</option>
              <option value="\\n\\n">Double newline (blank line)</option>
              <option value=";">Semicolon</option>
            </select>
          </div>
        </div>

        {/* Raw Text Input */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
            Paste Cards Here
          </label>
          <textarea
            id="bulk-import-textarea"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={8}
            placeholder={`Mitochondria\tPowerhouse of the cell\nNucleus\tControl center of the cell\nRibosome\tProtein synthesis`}
            className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm font-mono focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 resize-none placeholder-[var(--text-muted)] transition-all"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Paste directly from Quizlet export or Google Docs
          </p>
        </div>

        {/* Live Preview */}
        {rawText.trim() && (
          <div>
            <button
              id="toggle-preview-btn"
              onClick={() => setShowPreview(v => !v)}
              className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)] hover:underline mb-2 cursor-pointer"
            >
              <Eye size={14} />
              {showPreview ? 'Hide' : 'Show'} Preview ({preview.length} cards parsed)
            </button>
            {showPreview && (
              <div className="max-h-48 overflow-y-auto rounded-xl border border-[var(--border)] divide-y divide-[var(--border)]">
                {preview.slice(0, 20).map((c, i) => (
                  <div key={i} className="grid grid-cols-2 gap-4 px-4 py-2.5 text-sm">
                    <span className="text-[var(--text)] font-medium truncate">{c.term}</span>
                    <span className="text-[var(--text-muted)] truncate">{c.definition}</span>
                  </div>
                ))}
                {preview.length > 20 && (
                  <div className="px-4 py-2 text-xs text-[var(--text-muted)]">
                    +{preview.length - 20} more cards…
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" id="import-cancel-btn" onClick={onClose}>Cancel</Button>
          <Button
            id="bulk-import-btn"
            onClick={handleImport}
            disabled={preview.length === 0}
          >
            <Upload size={15} />
            Import {preview.length > 0 ? `${preview.length} Cards` : 'Cards'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
