import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box, TextField, Typography, Paper, CircularProgress,
  InputAdornment, Card, CardMedia, CardActionArea, Fade, Chip, Stack
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import { searchCommanders, getCardImageUri } from '../api/scryfall';
import type { ScryfallCard } from '../api/scryfall';
import useDeckStore from '../store/useDeckStore';

export default function CommanderSlot() {
  const commander = useDeckStore(s => s.commander);
  const setCommander = useDeckStore(s => s.setCommander);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ScryfallCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await searchCommanders(value);
        setResults(result.data.slice(0, 12));
        setShowDropdown(true);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 350);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectCommander = (card: ScryfallCard) => {
    setCommander(card);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  const removeCommander = () => {
    setCommander(null);
  };

  return (
    <Box ref={containerRef} sx={{ position: 'relative', mb: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'primary.main' }}>
        Commander
      </Typography>

      {commander ? (
        <Fade in>
          <Card
            sx={{
              display: 'flex',
              bgcolor: 'rgba(201, 169, 78, 0.04)',
              border: '1px solid rgba(201, 169, 78, 0.15)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <CardMedia
              component="img"
              image={getCardImageUri(commander, 0, 'normal')}
              alt={commander.name}
              sx={{ width: 160, minHeight: 220, objectFit: 'cover' }}
            />
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
              <Typography variant="h6" sx={{ fontSize: '1.05rem', mb: 0.5 }}>
                {commander.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {commander.type_line}
              </Typography>
              {commander.oracle_text && (
                <Box
                  sx={{
                    mb: 1.5,
                    maxHeight: 100,
                    overflowY: 'auto',
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'rgba(0,0,0,0.25)',
                    border: '1px solid rgba(201,169,78,0.08)',
                    '&::-webkit-scrollbar': { width: 4 },
                    '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(201,169,78,0.2)', borderRadius: 2 },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontStyle: 'italic',
                      color: 'text.secondary',
                      fontSize: '0.7rem',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {commander.oracle_text}
                  </Typography>
                </Box>
              )}
              <Stack direction="row" spacing={0.5} sx={{ mb: 1.5 }}>
                {commander.color_identity.map(c => (
                  <Chip
                    key={c}
                    label={c}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      height: 22,
                      bgcolor: `${getManaColor(c)}22`,
                      color: getManaColor(c),
                      border: `1px solid ${getManaColor(c)}44`,
                    }}
                  />
                ))}
                {commander.color_identity.length === 0 && (
                  <Chip label="C" size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                )}
              </Stack>
              <Chip
                label="Change Commander"
                size="small"
                onClick={removeCommander}
                onDelete={removeCommander}
                deleteIcon={<CloseIcon />}
                sx={{
                  alignSelf: 'flex-start',
                  bgcolor: 'rgba(232,85,84,0.1)',
                  color: 'error.main',
                  border: '1px solid rgba(232,85,84,0.2)',
                  '&:hover': { bgcolor: 'rgba(232,85,84,0.2)' },
                }}
              />
            </Box>
          </Card>
        </Fade>
      ) : (
        <TextField
          id="commander-search"
          fullWidth
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search for a legendary creature..."
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: loading ? (
                <InputAdornment position="end">
                  <CircularProgress size={18} sx={{ color: 'primary.main' }} />
                </InputAdornment>
              ) : null,
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(201, 169, 78, 0.04)',
            },
          }}
        />
      )}

      {showDropdown && results.length > 0 && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1200,
            mt: 0.5,
            maxHeight: 400,
            overflow: 'auto',
            border: '1px solid rgba(201, 169, 78, 0.12)',
          }}
        >
          {results.map(card => (
            <CardActionArea
              key={card.id}
              onClick={() => selectCommander(card)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1,
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                '&:hover': { bgcolor: 'rgba(201, 169, 78, 0.06)' },
              }}
            >
              <Box
                component="img"
                src={getCardImageUri(card, 0, 'small')}
                alt={card.name}
                sx={{ width: 40, height: 56, borderRadius: 0.5, objectFit: 'cover' }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {card.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {card.type_line}
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.25}>
                {card.color_identity.map(c => (
                  <Box
                    key={c}
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: getManaColor(c),
                      opacity: 0.8,
                    }}
                  />
                ))}
              </Stack>
            </CardActionArea>
          ))}
        </Paper>
      )}
    </Box>
  );
}

function getManaColor(c: string): string {
  const map: Record<string, string> = {
    W: '#f9f5dd',
    U: '#4596e0',
    B: '#a88ec2',
    R: '#e85454',
    G: '#4caf7d',
  };
  return map[c] || '#888';
}
