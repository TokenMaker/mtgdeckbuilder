import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { GroupedCards } from '../../utils/cardGrouping';
import type { ScryfallCard } from '../../utils/formatRules';
import { DeckCardRow } from './DeckCardRow';

interface DeckGroupProps {
  group: GroupedCards;
  onRemove: (cardId: string) => void;
  onQuantityChange: (cardId: string, qty: number) => void;
  onCardClick: (card: ScryfallCard) => void;
}

export function DeckGroup({ group, onRemove, onQuantityChange, onCardClick }: DeckGroupProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mb-1">
      {/* Group header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-2 py-1 hover:bg-zinc-800/50 rounded-lg transition-colors group"
      >
        <div className="flex items-center gap-1.5">
          {expanded
            ? <ChevronDown size={13} className="text-zinc-600" />
            : <ChevronRight size={13} className="text-zinc-600" />
          }
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            {group.group}
          </span>
        </div>
        <span className="text-xs font-bold text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-full">
          {group.totalCount}
        </span>
      </button>

      {/* Cards */}
      {expanded && (
        <div className="ml-1">
          {group.cards.map(deckCard => (
            <DeckCardRow
              key={deckCard.card.id}
              deckCard={deckCard}
              onRemove={() => onRemove(deckCard.card.id)}
              onQuantityChange={(qty) => onQuantityChange(deckCard.card.id, qty)}
              onCardClick={() => onCardClick(deckCard.card)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
