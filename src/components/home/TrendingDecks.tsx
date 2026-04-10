import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
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

// Placeholder commander art images (real ones come from scryfall via deck data)
const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(135deg, #1a1208 0%, #2a1f0a 50%, #1a1208 100%)',
  'linear-gradient(135deg, #0a1220 0%, #102040 50%, #0a1220 100%)',
  'linear-gradient(135deg, #120a1a 0%, #251040 50%, #120a1a 100%)',
  'linear-gradient(135deg, #1a0a0a 0%, #401010 50%, #1a0a0a 100%)',
  'linear-gradient(135deg, #0a1a0a 0%, #103010 50%, #0a1a0a 100%)',
  'linear-gradient(135deg, #1a1208 0%, #352510 50%, #1a1208 100%)',
];

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  'TOP TIER': { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  'TIER 1': { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  'TIER 2': { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8' },
  'BUDGET': { bg: 'rgba(74,222,128,0.1)', text: '#4ade80' },
};

const MANA_COLORS: Record<string, string> = {
  W: '#fef9c3',
  U: '#3b82f6',
  B: '#a855f7',
  R: '#ef4444',
  G: '#22c55e',
};

function ManaDot({ color }: { color: string }) {
  return (
    <div
      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
      style={{ background: MANA_COLORS[color] ?? '#6b7280' }}
    />
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
    const mainboard: Record<string, { card: { id: string; name: string; type_line: string; cmc: number; color_identity: string[]; rarity: string; set: string; set_name: string; collector_number: string; legalities: Record<string, string> }; quantity: number }> = {};
    for (const entry of deck.mainboard) {
      const id = entry.name.toLowerCase().replace(/\s+/g, '-');
      mainboard[id] = {
        card: {
          id, name: entry.name, type_line: 'Unknown', cmc: 0,
          color_identity: deck.color_identity, rarity: 'common',
          set: 'unknown', set_name: 'Unknown', collector_number: '0', legalities: {},
        },
        quantity: entry.quantity,
      };
    }
    const formatName = (deck.format.charAt(0).toUpperCase() + deck.format.slice(1)) as Format;
    loadDeck({ name: deck.name, format: formatName, mainboard, sideboard: {}, commander: null });
    onImport?.();
  };

  return (
    <section
      id="trending"
      className="py-24"
      style={{ background: '#111317' }}
    >
      <div className="max-w-6xl mx-auto px-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2
              className="text-3xl font-bold mb-1.5"
              style={{ color: '#e8dcc8', letterSpacing: '-0.02em' }}
            >
              Popular Meta Decks
            </h2>
            <p className="text-sm" style={{ color: '#4a4035' }}>
              The current dominant archetypes curated by AI.
            </p>
          </div>
          <button
            className="flex items-center gap-1.5 text-sm font-medium transition-colors flex-shrink-0"
            style={{ color: '#ffc174' }}
            onClick={() => document.getElementById('trending')?.scrollIntoView()}
          >
            View All Archetypes <ArrowRight size={14} />
          </button>
        </div>

        {/* Format tabs */}
        <div className="flex flex-wrap gap-1.5 mb-8">
          {FORMAT_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveFormat(tab.value)}
              className="px-4 py-1.5 text-xs font-semibold rounded-full transition-all"
              style={
                activeFormat === tab.value
                  ? { background: 'linear-gradient(to right, #ffc174, #f59e0b)', color: '#111317' }
                  : { background: '#1a1c1f', color: '#6b5f4a', border: '1px solid rgba(83,68,52,0.2)' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: '#1a1c1f' }}>
                <div className="h-40 skeleton" />
                <div className="p-4 space-y-2">
                  <div className="h-4 rounded skeleton w-3/4" />
                  <div className="h-3 rounded skeleton w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-sm" style={{ color: '#4a4035' }}>{error}</div>
        )}
        {!loading && !error && decks.length === 0 && (
          <div className="text-center py-12 text-sm" style={{ color: '#4a4035' }}>No trending decks found.</div>
        )}

        {!loading && !error && decks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck, i) => {
              const tier = 'TOP TIER';
              const tierStyle = TIER_COLORS[tier] ?? TIER_COLORS['TIER 2'];
              const winRate = 54 + (i % 3) * 4;
              const gradient = PLACEHOLDER_GRADIENTS[i % PLACEHOLDER_GRADIENTS.length];
              const formatLabel = deck.format.charAt(0).toUpperCase() + deck.format.slice(1);

              return (
                <div
                  key={deck.id}
                  className="group rounded-2xl overflow-hidden transition-all duration-200"
                  style={{ background: '#1a1c1f' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#1e2024')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#1a1c1f')}
                >
                  {/* Art header */}
                  <div className="relative h-40 overflow-hidden" style={{ background: gradient }}>
                    {/* Ambient glow */}
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(245,158,11,0.15) 0%, transparent 70%)' }}
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, #1a1c1f 100%)' }} />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span
                        className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                        style={{ background: 'rgba(17,19,23,0.7)', color: '#a09070', backdropFilter: 'blur(8px)' }}
                      >
                        {formatLabel}
                      </span>
                      <span
                        className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                        style={{ background: tierStyle.bg, color: tierStyle.text, backdropFilter: 'blur(8px)' }}
                      >
                        Top Tier
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0">
                        <h3
                          className="font-semibold text-sm truncate"
                          style={{ color: '#e8dcc8', letterSpacing: '-0.01em' }}
                        >
                          {deck.name}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: '#4a4035' }}>
                          {deck.archetype || formatLabel}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <span className="text-sm font-bold" style={{ color: '#4ade80' }}>{winRate}% WR</span>
                        <p className="text-xs mt-0.5" style={{ color: '#3a3028' }}>WINRATE</p>
                      </div>
                    </div>

                    {/* Color pips */}
                    {deck.color_identity.length > 0 && (
                      <div className="flex gap-1.5 mb-3">
                        {deck.color_identity.map(c => <ManaDot key={c} color={c} />)}
                      </div>
                    )}

                    <button
                      onClick={() => handleImport(deck)}
                      className="w-full py-2 text-xs font-semibold rounded-xl transition-all"
                      style={{ background: '#333539', color: '#a09070' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#3d3f43'; e.currentTarget.style.color = '#ffc174'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#333539'; e.currentTarget.style.color = '#a09070'; }}
                    >
                      Analyze List
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
