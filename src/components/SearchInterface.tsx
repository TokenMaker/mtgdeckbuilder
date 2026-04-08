import { useState, useCallback, useRef } from 'react';
import {
  Box, TextField, Typography, InputAdornment, CircularProgress,
  Grid, Fade, Alert
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { searchCards } from '../api/scryfall';
import type { ScryfallCard } from '../api/scryfall';
import useDeckStore from '../store/useDeckStore';
import CardResult from './CardResult';

export default function SearchInterface() {
  const commander = useDeckStore(s => s.commander);
  const getColorIdentity = useDeckStore(s => s.getColorIdentity);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ScryfallCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setResults([]);
      setTotalResults(0);
      setHasSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setHasSearched(true);
      try {
        const colorIdentity = getColorIdentity();
        const result = await searchCards(value, colorIdentity.length > 0 ? colorIdentity : undefined);
        setResults(result.data);
        setTotalResults(result.total_cards);
      } catch {
        setResults([]);
        setTotalResults(0);
      }
      setLoading(false);
    }, 350);
  }, [getColorIdentity]);

  if (!commander) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        gap: 2,
        opacity: 0.5,
      }}>
        <Typography variant="h5" sx={{ color: 'text.secondary' }}>
          ⚔️
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select a Commander to start building your deck
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TextField
        id="card-search"
        fullWidth
        value={query}
        onChange={e => handleSearch(e.target.value)}
        onClick={() => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          setQuery('');
        }}
        placeholder={`Search cards in ${commander.color_identity.length > 0 ? commander.color_identity.join('') : 'colorless'} identity...`}
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
          mb: 2,
          '& .MuiOutlinedInput-root': {
            bgcolor: 'rgba(201, 169, 78, 0.04)',
          },
        }}
      />

      {hasSearched && !loading && results.length === 0 && (
        <Alert severity="info" sx={{ mb: 2, bgcolor: 'rgba(69, 150, 224, 0.08)' }}>
          No cards found matching your search.
        </Alert>
      )}

      {totalResults > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
          Showing {results.length} of {totalResults} results
        </Typography>
      )}

      <Grid container spacing={1.5}>
        {results.map((card, i) => (
          <Grid key={card.id} size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }}>
            <Fade in timeout={150 + i * 30}>
              <div>
                <CardResult card={card} />
              </div>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
