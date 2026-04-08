import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Box, Typography, IconButton,
  Tabs, Tab, Chip, Stack
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import { getCardImageUri, isDoubleFaced } from '../api/scryfall';
import type { ScryfallCard } from '../api/scryfall';
import useDeckStore from '../store/useDeckStore';

interface Props {
  card: ScryfallCard | null;
  open: boolean;
  onClose: () => void;
}

export default function CardDetailDialog({ card, open, onClose }: Props) {
  const [faceIndex, setFaceIndex] = useState(0);
  const addCard = useDeckStore(s => s.addCard);
  const canAddCard = useDeckStore(s => s.canAddCard);

  if (!card) return null;

  const hasFaces = isDoubleFaced(card);
  const face = hasFaces && card.card_faces ? card.card_faces[faceIndex] : null;
  const check = canAddCard(card);

  const displayName = face?.name || card.name;
  const displayType = face?.type_line || card.type_line;
  const displayText = face?.oracle_text || card.oracle_text || '';
  const displayMana = face?.mana_cost || card.mana_cost || '';
  const displayPower = face?.power || card.power;
  const displayToughness = face?.toughness || card.toughness;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          border: '1px solid rgba(201, 169, 78, 0.1)',
        },
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pb: 1,
      }}>
        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
          {card.name}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {hasFaces && (
          <Tabs
            value={faceIndex}
            onChange={(_, v) => setFaceIndex(v)}
            sx={{ mb: 2, minHeight: 32 }}
          >
            {card.card_faces?.map((f, i) => (
              <Tab key={i} label={f.name} sx={{ minHeight: 32, textTransform: 'none', fontSize: '0.8rem' }} />
            ))}
          </Tabs>
        )}

        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box
            component="img"
            src={getCardImageUri(card, faceIndex, 'normal')}
            alt={displayName}
            sx={{
              width: { xs: '100%', sm: 240 },
              borderRadius: '10px',
              flexShrink: 0,
            }}
          />

          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
              {displayType}
            </Typography>
            {displayMana && (
              <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'primary.light', mb: 1 }}>
                {displayMana}
              </Typography>
            )}

            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                mb: 2,
                lineHeight: 1.6,
                color: 'text.primary',
              }}
            >
              {displayText}
            </Typography>

            {displayPower && displayToughness && (
              <Chip
                label={`${displayPower} / ${displayToughness}`}
                size="small"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  bgcolor: 'rgba(201,169,78,0.1)',
                  border: '1px solid rgba(201,169,78,0.2)',
                }}
              />
            )}

            {card.loyalty && !hasFaces && (
              <Chip
                label={`Loyalty: ${card.loyalty}`}
                size="small"
                sx={{ mb: 2, fontWeight: 700 }}
              />
            )}

            <Stack direction="row" spacing={0.5} sx={{ mb: 2 }}>
              <Chip label={card.set_name} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
              <Chip label={card.rarity} size="small" variant="outlined" sx={{ fontSize: '0.7rem', textTransform: 'capitalize' }} />
            </Stack>

            <Box
              component="button"
              onClick={() => { addCard(card); onClose(); }}
              disabled={!check.allowed}
              sx={{
                width: '100%',
                py: 1,
                px: 2,
                border: 'none',
                borderRadius: 1,
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: check.allowed ? 'pointer' : 'not-allowed',
                background: check.allowed
                  ? 'linear-gradient(135deg, #4caf7d 0%, #66bb8a 100%)'
                  : 'rgba(255,255,255,0.06)',
                color: check.allowed ? '#fff' : 'rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                transition: 'all 0.15s ease',
                '&:hover:not(:disabled)': {
                  background: 'linear-gradient(135deg, #5dc08a 0%, #77cc9b 100%)',
                },
              }}
            >
              <AddIcon sx={{ fontSize: 18 }} />
              {check.allowed ? 'Add to Deck' : check.reason}
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
