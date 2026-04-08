import React from 'react';
import { Plus } from 'lucide-react';
import type { ScryfallCard } from '../../utils/formatRules';
import { getLegalityStatus, getCardImageUri } from '../../utils/formatRules';
import type { Format } from '../../utils/formatRules';

interface CardThumbnailProps {
  card: ScryfallCard;
  format: Format;
  position: 'left' | 'center' | 'right';
  onClick: () => void;
  onAdd: () => void;
}

const LEGALITY_COLORS: Record<string, string> = {
  legal: 'text-green-400 bg-green-400/10 border-green-400/20',
  banned: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  restricted: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  not_legal: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const LEGALITY_LABELS: Record<string, string> = {
  legal: 'Legal',
  banned: 'Banned',
  restricted: 'Restricted',
  not_legal: 'Not Legal',
};

export function CardThumbnail({ card, format, position, onClick, onAdd }: CardThumbnailProps) {
  const legality = getLegalityStatus(card, format);
  const legalityColor = LEGALITY_COLORS[legality];
  const imageUrl = getCardImageUri(card, 'normal');

  return (
    <div
      className={`card-zoom-container card-zoom-${position} group relative cursor-pointer`}
    >
      {/* Card image with zoom */}
      <div
        className="relative overflow-visible"
        onClick={onClick}
      >
        <img
          src={imageUrl}
          alt={card.name}
          className="card-zoom-img w-full rounded-lg border border-zinc-700 group-hover:border-amber-500/50 transition-colors"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://cards.scryfall.io/back.jpg';
          }}
          loading="lazy"
        />

        {/* Add button overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-400 text-black rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-150 shadow-lg z-10"
          title="Add to deck"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Card name + legality */}
      <div className="mt-1.5 px-0.5">
        <p className="text-xs text-zinc-200 truncate font-medium leading-tight">{card.name}</p>
        <div className="flex items-center justify-between mt-0.5 gap-1">
          <span className="text-xs text-zinc-500 truncate">{card.type_line.split('—')[0].trim()}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded border whitespace-nowrap flex-shrink-0 ${legalityColor}`}>
            {LEGALITY_LABELS[legality]}
          </span>
        </div>
      </div>
    </div>
  );
}
