import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { ScryfallCard } from '../../utils/formatRules';
import { getCardImageUri } from '../../utils/formatRules';

const FALLBACK_IMAGE = 'https://cards.scryfall.io/back.jpg';

interface CardImageProps {
  card: ScryfallCard;
  size?: 'small' | 'normal' | 'large';
  className?: string;
  alt?: string;
}

export function CardImage({ card, size = 'normal', className = '', alt }: CardImageProps) {
  const isDoubleFaced = !card.image_uris && card.card_faces && card.card_faces.length >= 2;
  const [faceIndex, setFaceIndex] = useState(0);
  const [imgError, setImgError] = useState(false);

  function getImageUrl(): string {
    if (imgError) return FALLBACK_IMAGE;
    if (isDoubleFaced && card.card_faces) {
      const face = card.card_faces[faceIndex];
      return face.image_uris?.[size] || FALLBACK_IMAGE;
    }
    return getCardImageUri(card, size);
  }

  const imageUrl = getImageUrl();
  const displayAlt = alt || (isDoubleFaced && card.card_faces ? card.card_faces[faceIndex].name : card.name);

  return (
    <div className="relative">
      <img
        src={imageUrl}
        alt={displayAlt}
        className={className}
        onError={() => setImgError(true)}
        loading="lazy"
      />
      {isDoubleFaced && card.card_faces && card.card_faces.length >= 2 && !imgError && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setFaceIndex(prev => prev === 0 ? 1 : 0);
          }}
          className="absolute bottom-2 right-2 bg-zinc-900/90 hover:bg-zinc-800 text-amber-400 rounded-full p-1.5 transition-colors shadow-lg border border-zinc-700"
          title="Flip card"
        >
          <RefreshCw size={14} />
        </button>
      )}
    </div>
  );
}
