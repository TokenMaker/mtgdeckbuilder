import { Link } from 'react-router-dom';
import type { ProfileDeck } from '../../services/api';

interface DeckCardProps {
  deck: ProfileDeck;
  isOwn?: boolean;
}

const FORMAT_COLORS: Record<string, string> = {
  Commander: 'text-amber-300 bg-amber-400/10',
  Standard: 'text-sky-300 bg-sky-400/10',
  Modern: 'text-violet-300 bg-violet-400/10',
  Pioneer: 'text-emerald-300 bg-emerald-400/10',
  Legacy: 'text-rose-300 bg-rose-400/10',
  Vintage: 'text-orange-300 bg-orange-400/10',
  Pauper: 'text-zinc-300 bg-zinc-400/10',
};

export function DeckCard({ deck, isOwn }: DeckCardProps) {
  const totalMatches = deck.wins + deck.losses + deck.draws;
  const winRate = totalMatches > 0 ? Math.round((deck.wins / totalMatches) * 100) : null;
  const updated = new Date(deck.updated_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  const formatColor = FORMAT_COLORS[deck.format] || 'text-zinc-300 bg-zinc-400/10';

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-[#1e1f27] hover:bg-[#232330] transition-colors">
      {/* Commander art header */}
      <div className="relative h-28 overflow-hidden">
        {deck.commander_image ? (
          <img
            src={deck.commander_image}
            alt={deck.commander_name ?? ''}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-[#1e1f27]" />

        {/* Format badge */}
        <span className={`absolute top-2.5 left-2.5 text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded-md ${formatColor}`}>
          {deck.format}
        </span>
      </div>

      {/* Card body */}
      <div className="px-4 pb-4 pt-2">
        <h3
          className="font-bold text-zinc-100 text-sm truncate group-hover:text-amber-300 transition-colors"
          style={{ fontFamily: 'Capriola, sans-serif', letterSpacing: '-0.01em' }}
        >
          {deck.name}
        </h3>
        {deck.commander_name && (
          <p className="text-xs text-[#d3c5ac] mt-0.5 truncate">{deck.commander_name}</p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
          <span>{deck.card_count} cards</span>
          {winRate !== null && (
            <span className="text-amber-300 font-semibold">{winRate}% WR</span>
          )}
          {totalMatches > 0 && (
            <span className="ml-auto">
              <span className="text-green-400">{deck.wins}W</span>
              {' / '}
              <span className="text-red-400">{deck.losses}L</span>
              {deck.draws > 0 && <span> / {deck.draws}D</span>}
            </span>
          )}
        </div>

        {/* Win rate bar */}
        {winRate !== null && totalMatches >= 3 && (
          <div className="mt-2 h-0.5 bg-[#0d0e15] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-300 to-amber-500 rounded-full transition-all"
              style={{ width: `${winRate}%` }}
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-zinc-600">Updated {updated}</p>
          {isOwn && (
            <Link
              to={`/builder/${deck.id}`}
              className="text-xs px-3 py-1 rounded-lg bg-[#292931] text-zinc-300 hover:text-amber-300 hover:bg-[#292931] transition-colors"
              onClick={e => e.stopPropagation()}
            >
              Edit Deck
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
