import { useState } from 'react';
import {
  Drawer, Box, Typography, IconButton, Tooltip, List, ListItem, ListItemText,
  ListItemAvatar, Avatar, Divider, useMediaQuery, Chip, Tabs, Tab
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import useDeckStore from '../store/useDeckStore';
import { getCardImageUri, getCardTypeBucket, TYPE_ORDER } from '../api/scryfall';
import type { ScryfallCard } from '../api/scryfall';
import DeckStats from './DeckStats';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const DRAWER_WIDTH = 340;

export default function DeckDrawer({ open, onClose }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const commander = useDeckStore(s => s.commander);
  const cards = useDeckStore(s => s.cards);
  const removeCard = useDeckStore(s => s.removeCard);
  const getCardCount = useDeckStore(s => s.getCardCount);

  const [tab, setTab] = useState(0);

  // Group cards by type
  const grouped = cards.reduce<Record<string, ScryfallCard[]>>((acc, card) => {
    const bucket = getCardTypeBucket(card);
    if (!acc[bucket]) acc[bucket] = [];
    acc[bucket].push(card);
    return acc;
  }, {});

  // Sort within each group
  Object.values(grouped).forEach(arr => arr.sort((a, b) => a.cmc - b.cmc || a.name.localeCompare(b.name)));

  const count = getCardCount();

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      {/* Header */}
      <Box sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(201, 169, 78, 0.08)',
        bgcolor: 'rgba(201, 169, 78, 0.03)',
      }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Deck List
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {count} / 100 cards
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{
          minHeight: 36,
          borderBottom: '1px solid rgba(201, 169, 78, 0.06)',
          '& .MuiTab-root': {
            minHeight: 36,
            fontSize: '0.72rem',
            fontWeight: 600,
            textTransform: 'none',
            color: 'text.secondary',
            '&.Mui-selected': { color: 'primary.main' },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: 'primary.main',
            height: 2,
          },
        }}
      >
        <Tab label="Cards" />
        <Tab label="Analytics" />
      </Tabs>

      <Box sx={{ overflow: 'auto', flex: 1 }}>
        {tab === 0 ? (
          <>
            {/* Commander section */}
            {commander && (
              <Box sx={{ p: 1.5 }}>
                <Typography variant="caption" sx={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'primary.main',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                }}>
                  Commander
                </Typography>
                <ListItem
                  sx={{
                    bgcolor: 'rgba(201, 169, 78, 0.06)',
                    borderRadius: 1,
                    mt: 0.5,
                    border: '1px solid rgba(201, 169, 78, 0.1)',
                    px: 1,
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Tooltip
                      title={
                        <Box
                          component="img"
                          src={getCardImageUri(commander, 0, 'normal')}
                          alt={commander.name}
                          sx={{ width: 200, height: 'auto', borderRadius: '8px', display: 'block' }}
                        />
                      }
                      placement="left"
                      enterDelay={500}
                      slotProps={{ tooltip: { sx: { p: 0, bgcolor: 'transparent', boxShadow: '0 20px 60px rgba(0,0,0,0.9)', maxWidth: 'none' } } }}
                    >
                      <Avatar
                        src={getCardImageUri(commander, 0, 'small')}
                        variant="rounded"
                        sx={{ width: 32, height: 44, borderRadius: 0.5, cursor: 'pointer' }}
                      />
                    </Tooltip>
                  </ListItemAvatar>
                  <ListItemText
                    primary={commander.name}
                    slotProps={{
                      primary: { sx: { fontSize: '0.8rem', fontWeight: 600 } },
                    }}
                  />
                </ListItem>
              </Box>
            )}

            <Divider sx={{ borderColor: 'rgba(201, 169, 78, 0.06)' }} />

            {/* Card groups */}
            {TYPE_ORDER.filter(t => grouped[t]?.length).map(typeName => (
              <Box key={typeName} sx={{ px: 1.5, py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'text.secondary',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                  }}>
                    {typeName}
                  </Typography>
                  <Chip
                    label={grouped[typeName].length}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      bgcolor: 'rgba(255,255,255,0.06)',
                    }}
                  />
                </Box>
                <List dense disablePadding>
                  {grouped[typeName].map(card => (
                    <ListItem
                      key={card.id}
                      sx={{
                        borderRadius: 0.75,
                        mb: 0.25,
                        py: 0.25,
                        px: 0.75,
                        '&:hover': {
                          bgcolor: 'rgba(201, 169, 78, 0.06)',
                        },
                      }}
                      secondaryAction={
                        <Tooltip title="Remove" arrow>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => removeCard(card.id)}
                            sx={{
                              opacity: 0.4,
                              '&:hover': { opacity: 1, color: 'error.main' },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      }
                    >
                      <ListItemAvatar sx={{ minWidth: 32 }}>
                        <Tooltip
                          title={
                            <Box
                              component="img"
                              src={getCardImageUri(card, 0, 'normal')}
                              alt={card.name}
                              sx={{ width: 200, height: 'auto', borderRadius: '8px', display: 'block' }}
                            />
                          }
                          placement="left"
                          enterDelay={500}
                          slotProps={{ tooltip: { sx: { p: 0, bgcolor: 'transparent', boxShadow: '0 20px 60px rgba(0,0,0,0.9)', maxWidth: 'none' } } }}
                        >
                          <Avatar
                            src={getCardImageUri(card, 0, 'small')}
                            variant="rounded"
                            sx={{ width: 24, height: 34, borderRadius: 0.5, cursor: 'pointer' }}
                          />
                        </Tooltip>
                      </ListItemAvatar>
                      <ListItemText
                        primary={card.name}
                        slotProps={{
                          primary: { sx: { fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}

            {cards.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center', opacity: 0.4 }}>
                <Typography variant="body2">
                  No cards added yet
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Search and add cards to build your deck
                </Typography>
              </Box>
            )}
          </>
        ) : (
          /* Analytics tab */
          <DeckStats cards={cards} commander={commander} />
        )}
      </Box>
    </Drawer>
  );
}
