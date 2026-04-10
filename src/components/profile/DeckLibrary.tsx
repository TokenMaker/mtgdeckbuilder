import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { DeckCard } from './DeckCard';
import type { ProfileDeck } from '../../services/api';

interface DeckLibraryProps {
  decks: ProfileDeck[];
  isOwnProfile?: boolean;
}

export function DeckLibrary({ decks, isOwnProfile }: DeckLibraryProps) {
  const navigate = useNavigate();

  if (decks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#292931] flex items-center justify-center mb-4">
          <Plus size={24} className="text-zinc-500" />
        </div>
        <p className="text-zinc-400 font-semibold mb-1" style={{ fontFamily: 'Capriola, sans-serif' }}>
          No Decks Yet
        </p>
        <p className="text-sm text-zinc-600 mb-6">
          {isOwnProfile ? 'Start building your archive.' : 'This archivist has no public decks.'}
        </p>
        {isOwnProfile && (
          <button
            onClick={() => navigate('/builder')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-200 to-amber-500 text-zinc-900 hover:from-amber-100 hover:to-amber-400 transition-all"
          >
            Build Your First Deck
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-zinc-200" style={{ fontFamily: 'Capriola, sans-serif', letterSpacing: '-0.01em' }}>
          Active Decks Archive
          <span className="ml-2 text-sm font-normal text-zinc-500">({decks.length})</span>
        </h2>
        {isOwnProfile && (
          <button
            onClick={() => navigate('/builder')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-200 to-amber-500 text-zinc-900"
          >
            <Plus size={13} /> New Deck
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {decks.map(deck => (
          <DeckCard key={deck.id} deck={deck} isOwn={isOwnProfile} />
        ))}
      </div>
    </div>
  );
}
