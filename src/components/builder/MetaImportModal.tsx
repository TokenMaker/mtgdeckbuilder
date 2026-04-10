import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { metaApi, type TrendingDeck } from '../../services/api';
import { useDeckContext } from '../../context/DeckContext';
import type { Format } from '../../utils/formatRules';

const FORMAT_TABS = [
  { label: 'All', value: '' },
  { label: 'Modern', value: 'modern' },
  { label: 'Standard', value: 'standard' },
  { label: 'Pioneer', value: 'pioneer' },
  { label: 'Legacy', value: 'legacy' },
  { label: 'Commander', value: 'commander' },
];

interface MetaImportModalProps {
  onClose: () => void;
  onImported: () => void;
}

export function MetaImportModal({ onClose, onImported }: MetaImportModalProps) {
  const [activeFormat, setActiveFormat] = useState('');
  const [decks, setDecks] = useState<TrendingDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  const { loadDeck } = useDeckContext();

  useEffect(() => {
    setLoading(true);
    metaApi.getTrending(activeFormat || undefined)
      .then(data => setDecks(data))
      .catch(() => setDecks([]))
      .finally(() => setLoading(false));
  }, [activeFormat]);

  const handleImport = async (deck: TrendingDeck) => {
    setImporting(deck.id);
    try {
      const imported = await metaApi.importDeck(deck);
      const mainboard: Record<string, { card: { id: string; name: string; type_line: string; cmc: number; color_identity: string[]; rarity: string; set: string; set_name: string; collector_number: string; legalities: Record<string, string> }; quantity: number }> = {};
      for (const entry of imported.mainboard) {
        const id = entry.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        mainboard[id] = {
          card: {
            id,
            name: entry.name,
            type_line: 'Unknown',
            cmc: 0,
            color_identity: imported.color_identity,
            rarity: 'common',
            set: 'unknown',
            set_name: 'Unknown',
            collector_number: '0',
            legalities: {},
          },
          quantity: entry.quantity,
        };
      }
      const formatName = (imported.format.charAt(0).toUpperCase() + imported.format.slice(1)) as Format;
      loadDeck({ name: imported.name, format: formatName, mainboard, sideboard: {}, commander: null });
      onImported();
      onClose();
    } catch {
      // ignore
    } finally {
      setImporting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-zinc-100 font-semibold" style={{ fontFamily: 'Capriola, sans-serif' }}>
              Import Meta Deck
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Trending decks from MTGTop8</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Format tabs */}
        <div className="flex gap-1.5 px-5 py-3 border-b border-zinc-800 flex-wrap">
          {FORMAT_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveFormat(tab.value)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                activeFormat === tab.value
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Deck list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!loading && decks.length === 0 && (
            <div className="text-center py-8 text-zinc-500 text-sm">
              No decks found for this format.
            </div>
          )}
          {!loading && decks.map(deck => (
            <div
              key={deck.id}
              className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 rounded-xl p-3 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-200 font-medium truncate">{deck.name}</p>
                <p className="text-xs text-zinc-500 truncate">{deck.archetype || deck.format}</p>
              </div>
              <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 flex-shrink-0">
                {deck.format}
              </span>
              <button
                onClick={() => handleImport(deck)}
                disabled={importing === deck.id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
              >
                {importing === deck.id ? (
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download size={12} />
                )}
                Import
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
