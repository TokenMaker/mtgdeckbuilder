import React, { useState } from 'react';
import { X, Plus, Minus, BookOpen } from 'lucide-react';
import type { ScryfallCard, Format } from '../../utils/formatRules';
import { getLegalityStatus } from '../../utils/formatRules';
import { CardImage } from './CardImage';

interface CardDetailModalProps {
  card: ScryfallCard;
  format: Format;
  onClose: () => void;
  onAddToDeck: (card: ScryfallCard, quantity: number) => void;
}

const FORMATS_TO_SHOW: Format[] = ['Standard', 'Pioneer', 'Modern', 'Legacy', 'Vintage', 'Commander', 'Pauper'];

const LEGALITY_STYLE: Record<string, string> = {
  legal: 'text-green-400 bg-green-400/10',
  banned: 'text-orange-400 bg-orange-400/10',
  restricted: 'text-amber-400 bg-amber-400/10',
  not_legal: 'text-zinc-500 bg-zinc-800',
};

const MANA_COLORS: Record<string, string> = {
  W: 'bg-yellow-100 text-yellow-900',
  U: 'bg-blue-600 text-white',
  B: 'bg-zinc-800 text-white border border-zinc-600',
  R: 'bg-red-600 text-white',
  G: 'bg-green-700 text-white',
  C: 'bg-zinc-500 text-white',
};

function parseManaSymbols(manaCost: string) {
  if (!manaCost) return null;
  const symbols = manaCost.match(/\{[^}]+\}/g) || [];
  return symbols.map((sym, i) => {
    const inner = sym.slice(1, -1);
    const colorClass = MANA_COLORS[inner] || 'bg-zinc-600 text-white';
    return (
      <span
        key={i}
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${colorClass}`}
      >
        {inner.length <= 2 ? inner : inner[0]}
      </span>
    );
  });
}

export function CardDetailModal({ card, format, onClose, onAddToDeck }: CardDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const legality = getLegalityStatus(card, format);

  const currentFace = card.card_faces?.[0];
  const displayMana = card.mana_cost || currentFace?.mana_cost || '';
  const displayOracle = card.oracle_text || currentFace?.oracle_text || '';
  const displayType = card.type_line || currentFace?.type_line || '';

  const rarityColors: Record<string, string> = {
    common: 'text-zinc-400',
    uncommon: 'text-slate-300',
    rare: 'text-amber-400',
    mythic: 'text-orange-400',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">{card.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-sm font-medium ${rarityColors[card.rarity] || 'text-zinc-400'}`}>
                {card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-sm text-zinc-400">{card.set_name}</span>
              <span className="text-zinc-600">•</span>
              <span className={`text-sm px-2 py-0.5 rounded ${LEGALITY_STYLE[legality]}`}>
                {legality.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())} in {format}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-4 p-4">
          {/* Card Image */}
          <div className="flex-shrink-0 w-48">
            <CardImage
              card={card}
              size="normal"
              className="w-full rounded-lg border border-zinc-700"
            />
          </div>

          {/* Card Details */}
          <div className="flex-1 min-w-0">
            {/* Mana + Type */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-0.5">
                {parseManaSymbols(displayMana)}
              </div>
              <span className="text-zinc-500">•</span>
              <span className="text-sm text-zinc-300">CMC {card.cmc}</span>
            </div>
            <p className="text-sm text-zinc-300 mb-3 font-medium">{displayType}</p>

            {/* Oracle Text */}
            {displayOracle && (
              <div className="bg-zinc-800 rounded-lg p-3 mb-3">
                <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line">{displayOracle}</p>
              </div>
            )}

            {/* Color Identity */}
            {card.color_identity && card.color_identity.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-zinc-500">Color Identity:</span>
                <div className="flex gap-1">
                  {card.color_identity.map(c => (
                    <span
                      key={c}
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${MANA_COLORS[c] || 'bg-zinc-600 text-white'}`}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            {card.prices?.usd && (
              <p className="text-sm text-zinc-400 mb-3">
                <span className="text-zinc-500">Price: </span>
                <span className="text-green-400 font-medium">${card.prices.usd}</span>
                {card.prices.usd_foil && (
                  <span className="text-zinc-500 ml-2">foil: <span className="text-amber-400">${card.prices.usd_foil}</span></span>
                )}
              </p>
            )}

            {/* Add to Deck */}
            {legality !== 'banned' && legality !== 'not_legal' && (
              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-1">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="text-zinc-400 hover:text-zinc-200 p-1 rounded transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-zinc-100 font-medium w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(4, q + 1))}
                    className="text-zinc-400 hover:text-zinc-200 p-1 rounded transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={() => { onAddToDeck(card, quantity); onClose(); }}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Add {quantity}x to Deck
                </button>
              </div>
            )}

            {(legality === 'banned' || legality === 'not_legal') && (
              <div className="mt-4 p-3 bg-red-400/10 border border-red-400/20 rounded-lg">
                <p className="text-sm text-red-400">
                  This card is {legality.replace('_', ' ')} in {format}.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Legality Grid */}
        <div className="px-4 pb-4">
          <div className="border-t border-zinc-800 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={14} className="text-zinc-500" />
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Format Legality</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {FORMATS_TO_SHOW.map(fmt => {
                const fmtLegality = getLegalityStatus(card, fmt);
                return (
                  <div key={fmt} className={`rounded px-2 py-1 text-center ${LEGALITY_STYLE[fmtLegality]}`}>
                    <div className="text-xs font-medium">{fmt}</div>
                    <div className="text-xs opacity-75">{fmtLegality.replace('_', ' ')}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
