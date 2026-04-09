import { useState, useEffect } from 'react';
import { metaApi, type TrendingDeck } from '../../services/api';
import { useDeckContext } from '../../context/DeckContext';
import type { Format } from '../../utils/formatRules';

const FORMAT_TABS: Array<{ label: string; value: string }> = [
  { label: 'All', value: '' },
  { label: 'Modern', value: 'modern' },
  { label: 'Standard', value: 'standard' },
  { label: 'Pioneer', value: 'pioneer' },
  { label: 'Legacy', value: 'legacy' },
  { label: 'Commander', value: 'commander' },
];

const COLOR_MAP: Record<string, string> = {
  W: 'bg-yellow-50 text-yellow-900 border-yellow-200',
  U: 'bg-blue-500 text-white border-blue-400',
  B: 'bg-zinc-800 text-zinc-100 border-zinc-600',
  R: 'bg-red-500 text-white border-red-400',
  G: 'bg-green-600 text-white border-green-500',
};

const COLOR_SYMBOLS: Record<string, string> = { W: 'W', U: 'U', B: 'B', R: 'R', G: 'G' };

function ColorPip({ color }: { color: string }) {
  const cls = COLOR_MAP[color] || 'bg-zinc-600 text-zinc-200 border-zinc-500';
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full border text-xs font-bold ${cls}`}>
      {COLOR_SYMBOLS[color] || color}
    </span>
  );
}

interface TrendingDecksProps {
  onImport?: () => void;
}

export function TrendingDecks({ onImport }: TrendingDecksProps) {
  const [activeFormat, setActiveFormat] = useState('');
  const [decks, setDecks] = useState<TrendingDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { loadDeck } = useDeckContext();

  useEffect(() => {
    setLoading(true);
    setError(null);
    metaApi.getTrending(activeFormat || undefined)
      .then(data => setDecks(data))
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [activeFormat]);

  const handleImport = (deck: TrendingDeck) => {
    // Build mainboard from the deck
    const mainboard: Record<string, { card: { id: string; name: string; type_line: string; cmc: number; color_identity: string[]; rarity: string; set: string; set_name: string; collector_number: string; legalities: Record<string, string> }; quantity: number }> = {};
    for (const entry of deck.mainboard) {
      const id = entry.name.toLowerCase().replace(/\s+/g, '-');
      mainboard[id] = {
        card: {
          id,
          name: entry.name,
          type_line: 'Unknown',
          cmc: 0,
          color_identity: deck.color_identity,
          rarity: 'common',
          set: 'unknown',
          set_name: 'Unknown',
          collector_number: '0',
          legalities: {},
        },
        quantity: entry.quantity,
      };
    }
    const formatName = deck.format.charAt(0).toUpperCase() + deck.format.slice(1) as Format;
    loadDeck({ name: deck.name, format: formatName, mainboard, sideboard: {}, commander: null });
    onImport?.();
  };

  return (
    <section id="trending" className="py-24 bg-zinc-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2
              className="text-4xl font-bold text-zinc-100 mb-2"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              What the Meta is Playing
            </h2>
            <p className="text-zinc-400">
              Trending decks sourced from MTGTop8
            </p>
          </div>

          {/* Format tabs */}
          <div className="flex flex-wrap gap-1.5">
            {FORMAT_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveFormat(tab.value)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  activeFormat === tab.value
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 border border-zinc-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-3/4 mb-3" />
                <div className="h-3 bg-zinc-800 rounded w-1/2 mb-2" />
                <div className="h-3 bg-zinc-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-zinc-500">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && decks.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            <p>No trending decks found for this format.</p>
          </div>
        )}

        {!loading && !error && decks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map(deck => (
              <div
                key={deck.id}
                className="group bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-5 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-zinc-100 font-semibold text-sm truncate mb-1 group-hover:text-amber-400 transition-colors">
                      {deck.name}
                    </h3>
                    {deck.archetype && (
                      <p className="text-zinc-500 text-xs truncate">{deck.archetype}</p>
                    )}
                  </div>
                  <span className="ml-2 flex-shrink-0 text-xs px-2 py-0.5 bg-amber-500/15 text-amber-400 rounded-full border border-amber-500/30">
                    {deck.format}
                  </span>
                </div>

                {/* Color pips */}
                {deck.color_identity.length > 0 && (
                  <div className="flex gap-1 mb-4">
                    {deck.color_identity.map(c => (
                      <ColorPip key={c} color={c} />
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600">
                    {deck.mainboard.length > 0 ? `${deck.mainboard.reduce((s, c) => s + c.quantity, 0)} cards` : 'List unavailable'}
                  </span>
                  <button
                    onClick={() => handleImport(deck)}
                    className="text-xs px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:border-amber-500/50 rounded-lg transition-colors"
                  >
                    Import
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
