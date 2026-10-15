import { Download } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { Card, Deck } from '../../types';

interface BulkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: Deck;
  cards: Card[];
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function BulkExportModal({ isOpen, onClose, deck, cards }: BulkExportModalProps) {
  const exportTxt = () => {
    const content = cards.map(c => `${c.term}\t${c.definition}`).join('\n');
    downloadFile(`${deck.title.replace(/\s+/g, '_')}.txt`, content, 'text/plain');
    onClose();
  };

  const exportCsv = () => {
    const header = 'Term,Definition\n';
    const rows = cards.map(c => `"${c.term.replace(/"/g, '""')}","${c.definition.replace(/"/g, '""')}"`).join('\n');
    downloadFile(`${deck.title.replace(/\s+/g, '_')}.csv`, header + rows, 'text/csv');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Deck" maxWidth="max-w-md">
      <div className="space-y-4">
        <p className="text-sm text-[var(--text-muted)]">
          Export <span className="text-[var(--text)] font-semibold">"{deck.title}"</span> ({cards.length} cards) in your preferred format.
        </p>

        <div className="space-y-3">
          <div
            id="export-txt-btn"
            role="button"
            tabIndex={0}
            className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--accent)]/40 cursor-pointer group transition-all"
            onClick={exportTxt}
            onKeyDown={(e) => { if (e.key === 'Enter') exportTxt(); }}
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)]/20 transition-colors">
              <Download size={18} />
            </div>
            <div>
              <p className="font-semibold text-sm text-[var(--text)]">Tab-Separated (.txt)</p>
              <p className="text-xs text-[var(--text-muted)]">Compatible with Anki, Quizlet, and most flashcard apps</p>
            </div>
          </div>

          <div
            id="export-csv-btn"
            role="button"
            tabIndex={0}
            className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--success)]/40 cursor-pointer group transition-all"
            onClick={exportCsv}
            onKeyDown={(e) => { if (e.key === 'Enter') exportCsv(); }}
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--success)]/10 flex items-center justify-center text-[var(--success)] group-hover:bg-[var(--success)]/20 transition-colors">
              <Download size={18} />
            </div>
            <div>
              <p className="font-semibold text-sm text-[var(--text)]">CSV (.csv)</p>
              <p className="text-xs text-[var(--text-muted)]">Import into Google Sheets or Excel</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="ghost" id="export-close-btn" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}
