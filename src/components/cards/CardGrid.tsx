import { Search } from 'lucide-react';
import type { ScryfallCard, Format } from '../../utils/formatRules';
import { CardThumbnail } from './CardThumbnail';

interface CardGridProps {
  cards: ScryfallCard[];
  loading: boolean;
  error: string | null;
  totalCards: number;
  hasMore: boolean;
  format: Format;
  onCardClick: (card: ScryfallCard) => void;
  onCardAdd: (card: ScryfallCard) => void;
  onLoadMore: () => void;
  hasSearched: boolean;
}

function SkeletonCard() {
  return (
    <div className="space-y-2">
      <div className="skeleton rounded-lg" style={{ paddingBottom: '139%' }} />
      <div className="skeleton h-3 rounded w-3/4" />
      <div className="skeleton h-3 rounded w-1/2" />
    </div>
  );
}

export function CardGrid({
  cards,
  loading,
  error,
  totalCards,
  hasMore,
  format,
  onCardClick,
  onCardAdd,
  onLoadMore,
  hasSearched,
}: CardGridProps) {
  // Determine zoom origin per column position in a 3-col grid
  function getPosition(index: number): 'left' | 'center' | 'right' {
    const col = index % 3;
    if (col === 0) return 'left';
    if (col === 1) return 'center';
    return 'right';
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
        <div className="w-12 h-12 bg-red-400/10 rounded-full flex items-center justify-center mb-3">
          <Search size={20} className="text-red-400" />
        </div>
        <p className="text-red-400 font-medium mb-1">Search failed</p>
        <p className="text-sm text-zinc-500">{error}</p>
      </div>
    );
  }

  if (!hasSearched && cards.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
        <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
          <Search size={24} className="text-amber-500/60" />
        </div>
        <h3 className="text-zinc-300 font-semibold mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
          Find Your Cards
        </h3>
        <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
          Ask the AI assistant to search for cards, or type a card name above to browse results.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Results header */}
      {hasSearched && (
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <span className="text-xs text-zinc-500">
            {totalCards > 0 ? `${cards.length} of ${totalCards.toLocaleString()} results` : 'No results'}
          </span>
          <span className="text-xs text-zinc-600 capitalize">{format}</span>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-3 gap-3 pb-4">
          {cards.map((card, i) => (
            <CardThumbnail
              key={card.id}
              card={card}
              format={format}
              position={getPosition(i)}
              onClick={() => onCardClick(card)}
              onAdd={() => onCardAdd(card)}
            />
          ))}

          {/* Loading skeletons */}
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} />
          ))}
        </div>

        {/* Load more */}
        {hasMore && !loading && (
          <div className="flex justify-center pb-4">
            <button
              onClick={onLoadMore}
              className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-lg transition-colors"
            >
              Load more
            </button>
          </div>
        )}

        {/* Empty after search */}
        {hasSearched && cards.length === 0 && !loading && (
          <div className="text-center py-12 text-zinc-500 text-sm">
            No cards found. Try a different search.
          </div>
        )}
      </div>
    </div>
  );
}
