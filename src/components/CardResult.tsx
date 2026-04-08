import { useState, forwardRef } from 'react';
import {
  Box, Typography, IconButton, Tooltip, Chip
} from '@mui/material';
import {
  Add as AddIcon,
  FlipCameraAndroid as FlipIcon,
} from '@mui/icons-material';
import { getCardImageUri, isDoubleFaced } from '../api/scryfall';
import type { ScryfallCard } from '../api/scryfall';
import useDeckStore from '../store/useDeckStore';

interface Props {
  card: ScryfallCard;
}

const CardResult = forwardRef<HTMLDivElement, Props>(({ card }, ref) => {
  const addCard = useDeckStore(s => s.addCard);
  const canAddCard = useDeckStore(s => s.canAddCard);
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);

  const check = canAddCard(card);
  const hasMultipleFaces = isDoubleFaced(card);
  const currentFace = flipped ? 1 : 0;
  const imageUrl = getCardImageUri(card, currentFace, 'normal');

  const zoomImage = getCardImageUri(card, currentFace, 'large');

  return (
    <Tooltip
      title={
        <Box
          component="img"
          src={zoomImage}
          alt={card.name}
          sx={{ width: 220, height: 'auto', borderRadius: '10px', display: 'block' }}
        />
      }
      placement="right"
      enterDelay={600}
      enterNextDelay={300}
      slotProps={{
        tooltip: {
          sx: {
            p: 0,
            bgcolor: 'transparent',
            boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
            maxWidth: 'none',
          },
        },
      }}
    >
    <Box
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { if (check.allowed) addCard(card); }}
      sx={{
        position: 'relative',
        borderRadius: '10px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': {
          transform: 'translateY(-4px) scale(1.02)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5), 0 0 15px rgba(201,169,78,0.1)',
        },
      }}
    >
      <Box
        component="img"
        src={imageUrl}
        alt={card.name}
        loading="lazy"
        sx={{
          width: '100%',
          display: 'block',
          borderRadius: '10px',
        }}
      />

      {/* Hover overlay */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
          p: 1,
          pt: 3,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.15s ease',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 0.5,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: '0.72rem',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {card.name}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.25 }}>
          {hasMultipleFaces && (
            <IconButton
              size="small"
              onClick={e => { e.stopPropagation(); setFlipped(!flipped); }}
              sx={{
                bgcolor: 'rgba(0,0,0,0.6)',
                color: 'white',
                width: 26,
                height: 26,
                '&:hover': { bgcolor: 'rgba(201,169,78,0.3)' },
              }}
            >
              <FlipIcon sx={{ fontSize: 14 }} />
            </IconButton>
          )}
          <Tooltip title={check.allowed ? 'Add to deck' : check.reason} arrow>
            <span>
              <IconButton
                size="small"
                onClick={e => { e.stopPropagation(); addCard(card); }}
                disabled={!check.allowed}
                sx={{
                  bgcolor: check.allowed ? 'rgba(76,175,125,0.8)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  width: 26,
                  height: 26,
                  '&:hover': { bgcolor: 'rgba(76,175,125,1)' },
                  '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' },
                }}
              >
                <AddIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Already in deck indicator */}
      {!check.allowed && check.reason?.includes('already') && (
        <Chip
          label="IN DECK"
          size="small"
          sx={{
            position: 'absolute',
            top: 6,
            right: 6,
            bgcolor: 'rgba(201,169,78,0.85)',
            color: '#0d0d14',
            fontWeight: 700,
            fontSize: '0.6rem',
            height: 20,
          }}
        />
      )}
    </Box>
    </Tooltip>
  );
});

CardResult.displayName = 'CardResult';
export default CardResult;
