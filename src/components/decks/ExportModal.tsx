import { useState } from 'react';
import { X, Copy, Download, Check } from 'lucide-react';
import { useDeckContext } from '../../context/DeckContext';
import { exportDeck, copyToClipboard, downloadAsFile } from '../../utils/deckExport';
import type { ExportFormat } from '../../utils/deckExport';

interface ExportModalProps {
  onClose: () => void;
}

const FORMAT_LABELS: Record<ExportFormat, string> = {
  arena: 'MTG Arena',
  mtgo: 'MTGO',
  text: 'Plain Text',
};

export function ExportModal({ onClose }: ExportModalProps) {
  const { name, format, mainboard, sideboard, commander } = useDeckContext();
  const [exportFormat, setExportFormat] = useState<ExportFormat>('arena');
  const [copied, setCopied] = useState(false);

  const deck = { name, format, mainboard, sideboard, commander };
  const exportedText = exportDeck(deck, exportFormat);

  const handleCopy = async () => {
    const ok = await copyToClipboard(exportedText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const filename = `${name.replace(/\s+/g, '-').toLowerCase()}-${format.toLowerCase()}.txt`;
    downloadAsFile(exportedText, filename);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-zinc-100" style={{ fontFamily: 'Capriola, sans-serif' }}>Export Deck</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{name} · {format}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Format picker */}
        <div className="flex gap-2 px-4 pt-4 flex-shrink-0">
          {(Object.keys(FORMAT_LABELS) as ExportFormat[]).map(f => (
            <button
              key={f}
              onClick={() => setExportFormat(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                exportFormat === f
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-700'
              }`}
            >
              {FORMAT_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Text area */}
        <div className="flex-1 overflow-hidden p-4">
          <textarea
            readOnly
            value={exportedText}
            className="w-full h-full min-h-[200px] bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 font-mono leading-relaxed outline-none resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-4 pb-4 flex-shrink-0">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 rounded-xl text-sm font-medium transition-colors"
          >
            {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-sm font-semibold transition-colors"
          >
            <Download size={15} />
            Download .txt
          </button>
        </div>
      </div>
    </div>
  );
}
