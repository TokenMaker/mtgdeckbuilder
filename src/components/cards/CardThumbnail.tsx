import { Plus } from 'lucide-react';
import type { ScryfallCard } from '../../utils/formatRules';
import { getLegalityStatus, getCardImageUri } from '../../utils/formatRules';
import type { Format } from '../../utils/formatRules';

interface CardThumbnailProps {
  card: ScryfallCard;
  format: Format;
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

export function CardThumbnail({ card, format, onClick, onAdd }: CardThumbnailProps) {
  const legality = getLegalityStatus(card, format);
  const legalityColor = LEGALITY_COLORS[legality];
  const imageUrl = getCardImageUri(card, 'normal');

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(card));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="group relative cursor-pointer">
      {/* Card image */}
      <div
        className="relative"
        draggable
        onDragStart={handleDragStart}
        onClick={onClick}
      >
        <img
          src={imageUrl}
          alt={card.name}
          className="w-full rounded-lg border border-zinc-700 group-hover:border-amber-500/50 transition-colors"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://cards.scryfall.io/back.jpg';
          }}
          loading="lazy"
          draggable={false}
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

        {/* Drag hint */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="text-xs bg-black/70 text-zinc-300 px-2 py-0.5 rounded">drag to deck</span>
        </div>
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
