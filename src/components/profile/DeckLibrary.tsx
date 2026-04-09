import { DeckCard } from './DeckCard';
import type { DeckCardData } from './DeckCard';

interface DeckLibraryProps {
  decks: DeckCardData[];
}

export function DeckLibrary({ decks }: DeckLibraryProps) {
  if (decks.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <p className="text-lg mb-2">No decks yet</p>
        <p className="text-sm">This player hasn&apos;t saved any decks.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-zinc-100 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
        Deck Library
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {decks.map(deck => (
          <DeckCard key={deck.id} deck={deck} />
        ))}
      </div>
    </div>
  );
}
