import { X, Plus, Minus } from 'lucide-react';
import type { DeckCard } from '../../utils/formatRules';
import { getCardImageUri } from '../../utils/formatRules';

interface DeckCardRowProps {
  deckCard: DeckCard;
  onRemove: () => void;
  onQuantityChange: (qty: number) => void;
  onCardClick: () => void;
  showQuantityControls?: boolean;
}

export function DeckCardRow({
  deckCard,
  onRemove,
  onQuantityChange,
  onCardClick,
  showQuantityControls = true,
}: DeckCardRowProps) {
  const { card, quantity } = deckCard;
  const imageUrl = getCardImageUri(card, 'small');

  return (
    <div className="group flex items-center gap-1.5 py-1 px-1 rounded-lg hover:bg-zinc-800/60 transition-colors">
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-8 h-11 cursor-pointer" onClick={onCardClick}>
        <img
          src={imageUrl}
          alt={card.name}
          className="w-full h-full object-cover rounded border border-zinc-700/50 group-hover:border-amber-500/30 transition-colors"
          onError={e => { (e.target as HTMLImageElement).src = 'https://cards.scryfall.io/back.jpg'; }}
          loading="lazy"
        />
      </div>

      {/* Name + type */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onCardClick}>
        <p className="text-xs text-zinc-200 font-medium truncate leading-tight">{card.name}</p>
        <p className="text-xs text-zinc-600 truncate leading-tight">{card.type_line.split('—')[0].trim()}</p>
      </div>

      {/* Quantity controls */}
      {showQuantityControls && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onQuantityChange(quantity - 1)}
            className="w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 rounded transition-colors"
          >
            <Minus size={10} />
          </button>
          <span className="w-5 text-center text-xs text-zinc-300 font-semibold">{quantity}</span>
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            className="w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 rounded transition-colors"
          >
            <Plus size={10} />
          </button>
        </div>
      )}

      {/* Qty badge (shown when not hovering) */}
      {showQuantityControls && (
        <span className="text-xs text-amber-500/80 font-bold w-5 text-center group-hover:hidden flex-shrink-0">
          {quantity}x
        </span>
      )}

      {/* Remove */}
      <button
        onClick={onRemove}
        className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors opacity-0 group-hover:opacity-100"
      >
        <X size={11} />
      </button>
    </div>
  );
}
