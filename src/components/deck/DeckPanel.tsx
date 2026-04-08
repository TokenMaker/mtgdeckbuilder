import React, { useState } from 'react';
import { Trash2, BarChart2, List } from 'lucide-react';
import { useDeckContext } from '../../context/DeckContext';
import { groupDeckCards } from '../../utils/cardGrouping';
import { getCardImageUri } from '../../utils/formatRules';
import type { ScryfallCard } from '../../utils/formatRules';
import { DeckGroup } from './DeckGroup';
import { DeckStats } from './DeckStats';
import { ManaCurveChart } from './ManaCurveChart';
import { DeckCardRow } from './DeckCardRow';

interface DeckPanelProps {
  onCardClick: (card: ScryfallCard) => void;
}

export function DeckPanel({ onCardClick }: DeckPanelProps) {
  const {
    mainboard,
    sideboard,
    commander,
    format,
    totalCards,
    removeCard,
    updateQuantity,
    setCommander,
    clearDeck,
    validationErrors,
  } = useDeckContext();

  const [tab, setTab] = useState<'list' | 'stats'>('list');
  const grouped = groupDeckCards(mainboard);
  const sideboardCards = Object.values(sideboard);
  const hasSideboard = sideboardCards.length > 0;

  const maxSize = format === 'Commander' ? 100 : 60;
  const isValid = validationErrors.filter(e => e.type === 'error').length === 0 && totalCards >= maxSize;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800 flex-shrink-0">
        <div>
          <p className="text-xs font-bold text-zinc-200 uppercase tracking-wider" style={{ fontFamily: 'Cinzel, serif' }}>
            Deck List
          </p>
          <p className={`text-xs font-semibold mt-0.5 ${
            isValid && totalCards > 0 ? 'text-green-400' : totalCards > maxSize ? 'text-red-400' : 'text-zinc-500'
          }`}>
            {totalCards} / {maxSize} cards
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTab('list')}
            className={`p-1.5 rounded-lg transition-colors ${tab === 'list' ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
            title="Card list"
          >
            <List size={14} />
          </button>
          <button
            onClick={() => setTab('stats')}
            className={`p-1.5 rounded-lg transition-colors ${tab === 'stats' ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
            title="Stats"
          >
            <BarChart2 size={14} />
          </button>
          <button
            onClick={clearDeck}
            className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors ml-1"
            title="Clear deck"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {tab === 'list' ? (
          <>
            {/* Commander */}
            {commander && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-amber-500/80 uppercase tracking-wider px-2 mb-1">
                  Commander
                </p>
                <div className="group flex items-center gap-2 p-1.5 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                  <img
                    src={getCardImageUri(commander, 'small')}
                    alt={commander.name}
                    className="w-10 h-14 object-cover rounded border border-amber-500/20 flex-shrink-0 cursor-pointer hover:border-amber-500/60 transition-colors"
                    onClick={() => onCardClick(commander)}
                    onError={e => { (e.target as HTMLImageElement).src = 'https://cards.scryfall.io/back.jpg'; }}
                  />
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onCardClick(commander)}>
                    <p className="text-xs font-semibold text-amber-300 truncate">{commander.name}</p>
                    <p className="text-xs text-zinc-600 truncate">{commander.type_line}</p>
                  </div>
                  <button
                    onClick={() => setCommander(null)}
                    className="flex-shrink-0 text-xs text-zinc-600 hover:text-red-400 px-2 py-1 rounded hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Main deck groups */}
            {grouped.length === 0 && !commander ? (
              <div className="text-center py-12 px-3">
                <p className="text-zinc-500 text-sm mb-1">Your deck is empty</p>
                <p className="text-zinc-600 text-xs">Use the AI chat to find cards and add them to your deck</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {grouped.map(group => (
                  <DeckGroup
                    key={group.group}
                    group={group}
                    onRemove={(id) => removeCard(id)}
                    onQuantityChange={(id, qty) => updateQuantity(id, qty)}
                    onCardClick={onCardClick}
                  />
                ))}
              </div>
            )}

            {/* Sideboard */}
            {hasSideboard && (
              <div className="mt-3 border-t border-zinc-800 pt-3">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2 mb-1">
                  Sideboard ({sideboardCards.reduce((s, dc) => s + dc.quantity, 0)})
                </p>
                {sideboardCards.map(dc => (
                  <DeckCardRow
                    key={dc.card.id}
                    deckCard={dc}
                    onRemove={() => removeCard(dc.card.id, 'sideboard')}
                    onQuantityChange={(qty) => updateQuantity(dc.card.id, qty, 'sideboard')}
                    onCardClick={() => onCardClick(dc.card)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4 pt-1">
            {/* Mana curve */}
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Mana Curve</p>
              <ManaCurveChart mainboard={mainboard} />
            </div>

            {/* Color + warnings */}
            <DeckStats
              mainboard={mainboard}
              commander={commander}
              validationErrors={validationErrors}
            />
          </div>
        )}
      </div>
    </div>
  );
}
