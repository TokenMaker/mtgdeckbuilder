import { Link } from 'react-router-dom';

export interface DeckCardData {
  id: string;
  name: string;
  format: string;
  card_count: number;
  updated_at: string;
  wins: number;
  losses: number;
  draws: number;
}

interface DeckCardProps {
  deck: DeckCardData;
}

export function DeckCard({ deck }: DeckCardProps) {
  const totalMatches = deck.wins + deck.losses + deck.draws;
  const winRate = totalMatches > 0 ? Math.round((deck.wins / totalMatches) * 100) : null;
  const updated = new Date(deck.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Link
      to={`/decks/${deck.id}`}
      className="block bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-5 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-zinc-100 text-sm truncate group-hover:text-amber-400 transition-colors" style={{ fontFamily: 'Cinzel, serif' }}>
            {deck.name}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">Updated {updated}</p>
        </div>
        <span className="ml-2 text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 flex-shrink-0">
          {deck.format}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span>{deck.card_count} cards</span>
        {winRate !== null && (
          <span className="text-amber-400 font-semibold">{winRate}% win rate</span>
        )}
        {totalMatches > 0 && (
          <span>{deck.wins}W / {deck.losses}L{deck.draws > 0 ? ` / ${deck.draws}D` : ''}</span>
        )}
      </div>
    </Link>
  );
}
