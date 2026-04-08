import { AppBar, Toolbar, Typography, Chip, Box, IconButton, Tooltip } from '@mui/material';
import { Delete as DeleteIcon, AutoAwesome as SparkleIcon } from '@mui/icons-material';
import useDeckStore from '../store/useDeckStore';

export default function Header() {
  const commander = useDeckStore(s => s.commander);
  const getCardCount = useDeckStore(s => s.getCardCount);
  const clearDeck = useDeckStore(s => s.clearDeck);
  const count = getCardCount();

  const chipColor = count === 100 ? 'success' : count > 100 ? 'error' : 'default';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'linear-gradient(180deg, rgba(13,13,20,0.98) 0%, rgba(13,13,20,0.92) 100%)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(201, 169, 78, 0.08)',
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <SparkleIcon sx={{ color: 'primary.main', fontSize: 28 }} />
        <Typography
          variant="h6"
          sx={{
            background: 'linear-gradient(135deg, #c9a94e 0%, #e0c876 50%, #c9a94e 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            fontSize: '1.15rem',
          }}
        >
          COMMANDER FORGE
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {commander && (
          <Chip
            label={`Color Identity: ${commander.color_identity.length > 0 ? commander.color_identity.join(' ') : 'C'}`}
            size="small"
            sx={{
              bgcolor: 'rgba(201, 169, 78, 0.1)',
              border: '1px solid rgba(201, 169, 78, 0.2)',
              color: 'primary.light',
              fontWeight: 600,
            }}
          />
        )}

        <Chip
          id="card-counter"
          label={`${count} / 100`}
          color={chipColor}
          variant={count === 100 ? 'filled' : 'outlined'}
          sx={{
            fontWeight: 700,
            fontSize: '0.9rem',
            minWidth: 80,
            ...(count === 100 && {
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { boxShadow: '0 0 0 0 rgba(76,175,125,0.4)' },
                '50%': { boxShadow: '0 0 0 6px rgba(76,175,125,0)' },
              },
            }),
          }}
        />

        <Tooltip title="Clear Deck">
          <IconButton
            onClick={clearDeck}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'error.main' }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
