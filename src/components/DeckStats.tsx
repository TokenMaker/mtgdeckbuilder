import { useMemo } from 'react';
import { Box, Typography, Chip, Stack, Divider, Tooltip } from '@mui/material';
import {
  getCardTypeBucket, TYPE_ORDER, MANA_DISPLAY_COLORS,
  getColorDistribution, getManaCurve, getSubtypeDistribution,
  extractTokensFromDeck,
} from '../api/scryfall';
import type { ScryfallCard } from '../api/scryfall';

interface Props {
  cards: ScryfallCard[];
  commander: ScryfallCard | null;
}

const CURVE_KEYS = ['0', '1', '2', '3', '4', '5', '6', '7+'];
const COLOR_LABELS: Record<string, string> = {
  W: 'White', U: 'Blue', B: 'Black', R: 'Red', G: 'Green', C: 'Colorless',
};

export default function DeckStats({ cards, commander }: Props) {
  const colorDist = useMemo(() => getColorDistribution(cards, commander), [cards, commander]);
  const manaCurve = useMemo(() => getManaCurve(cards, commander), [cards, commander]);
  const subtypeDist = useMemo(() => getSubtypeDistribution(cards, commander), [cards, commander]);
  const tokens = useMemo(() => extractTokensFromDeck(cards, commander), [cards, commander]);

  // Type distribution
  const typeDist = useMemo(() => {
    const all = commander ? [commander, ...cards] : cards;
    const dist: Record<string, number> = {};
    for (const card of all) {
      const bucket = getCardTypeBucket(card);
      dist[bucket] = (dist[bucket] || 0) + 1;
    }
    return dist;
  }, [cards, commander]);

  // Top subtypes (sorted by count, top 8)
  const topSubtypes = useMemo(() => {
    return Object.entries(subtypeDist)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [subtypeDist]);

  // Color total for percentages
  const colorTotal = Object.values(colorDist).reduce((s, v) => s + v, 0);

  // Mana curve max for scaling bars
  const curveMax = Math.max(...Object.values(manaCurve), 1);

  if (cards.length === 0 && !commander) return null;

  return (
    <Box sx={{ px: 1.5, py: 1 }}>
      {/* ─── Type Distribution ─── */}
      <SectionHeader label="Card Types" />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
        {TYPE_ORDER.filter(t => typeDist[t]).map(typeName => (
          <Chip
            key={typeName}
            label={`${typeName} ${typeDist[typeName]}`}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.65rem',
              fontWeight: 600,
              bgcolor: 'rgba(201, 169, 78, 0.08)',
              border: '1px solid rgba(201, 169, 78, 0.12)',
              color: 'text.secondary',
            }}
          />
        ))}
      </Box>

      {/* Top subtypes */}
      {topSubtypes.length > 0 && (
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary', mb: 0.5, display: 'block' }}>
            Top Subtypes
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4 }}>
            {topSubtypes.map(([name, count]) => (
              <Chip
                key={name}
                label={`${name} ×${count}`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.6rem',
                  fontWeight: 500,
                  bgcolor: 'rgba(255,255,255,0.04)',
                  color: 'text.secondary',
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      <Divider sx={{ borderColor: 'rgba(201, 169, 78, 0.06)', my: 1 }} />

      {/* ─── Color Distribution ─── */}
      <SectionHeader label="Color Distribution" />
      {colorTotal > 0 ? (
        <>
          {/* Color bar */}
          <Box sx={{
            display: 'flex',
            borderRadius: 1,
            overflow: 'hidden',
            height: 10,
            mb: 1,
          }}>
            {(['W', 'U', 'B', 'R', 'G', 'C'] as const).filter(c => colorDist[c] > 0).map(c => (
              <Tooltip
                key={c}
                title={`${COLOR_LABELS[c]}: ${colorDist[c]} (${Math.round(colorDist[c] / colorTotal * 100)}%)`}
                arrow
              >
                <Box sx={{
                  width: `${(colorDist[c] / colorTotal) * 100}%`,
                  bgcolor: MANA_DISPLAY_COLORS[c],
                  transition: 'width 0.3s ease',
                  minWidth: colorDist[c] > 0 ? 4 : 0,
                }} />
              </Tooltip>
            ))}
          </Box>

          {/* Color labels */}
          <Stack direction="row" flexWrap="wrap" spacing={0.5} sx={{ mb: 1.5 }} useFlexGap>
            {(['W', 'U', 'B', 'R', 'G', 'C'] as const).filter(c => colorDist[c] > 0).map(c => (
              <Box key={c} sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <Box sx={{
                  width: 8, height: 8, borderRadius: '50%',
                  bgcolor: MANA_DISPLAY_COLORS[c],
                  flexShrink: 0,
                }} />
                <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                  {c} {colorDist[c]}
                </Typography>
              </Box>
            ))}
          </Stack>
        </>
      ) : (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem', mb: 1.5, display: 'block' }}>
          No non-land cards yet
        </Typography>
      )}

      <Divider sx={{ borderColor: 'rgba(201, 169, 78, 0.06)', my: 1 }} />

      {/* ─── Mana Curve ─── */}
      <SectionHeader label="Mana Curve" />
      <Box sx={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '3px',
        height: 64,
        mb: 0.5,
      }}>
        {CURVE_KEYS.map(key => {
          const val = manaCurve[key];
          const pct = curveMax > 0 ? (val / curveMax) * 100 : 0;
          return (
            <Tooltip key={key} title={`CMC ${key}: ${val} card${val !== 1 ? 's' : ''}`} arrow>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                {val > 0 && (
                  <Typography variant="caption" sx={{ fontSize: '0.55rem', color: 'primary.light', fontWeight: 700, mb: '2px' }}>
                    {val}
                  </Typography>
                )}
                <Box sx={{
                  width: '100%',
                  height: `${Math.max(pct, val > 0 ? 6 : 0)}%`,
                  background: val > 0
                    ? 'linear-gradient(180deg, rgba(201,169,78,0.6) 0%, rgba(201,169,78,0.2) 100%)'
                    : 'rgba(255,255,255,0.03)',
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.3s ease',
                  minHeight: 2,
                }} />
              </Box>
            </Tooltip>
          );
        })}
      </Box>
      <Box sx={{ display: 'flex', gap: '3px', mb: 1.5 }}>
        {CURVE_KEYS.map(key => (
          <Box key={key} sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ fontSize: '0.55rem', color: 'text.secondary', fontWeight: 600 }}>
              {key}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Average MV */}
      {(() => {
        const allCards = commander ? [commander, ...cards] : cards;
        const nonLands = allCards.filter(c => !c.type_line.toLowerCase().includes('land'));
        const avgMv = nonLands.length > 0
          ? (nonLands.reduce((s, c) => s + c.cmc, 0) / nonLands.length).toFixed(2)
          : '0.00';
        return (
          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary', display: 'block', mb: 1.5 }}>
            Avg. Mana Value: <Box component="span" sx={{ color: 'primary.light', fontWeight: 700 }}>{avgMv}</Box>
          </Typography>
        );
      })()}

      {/* ─── Tokens & Emblems ─── */}
      {tokens.length > 0 && (
        <>
          <Divider sx={{ borderColor: 'rgba(201, 169, 78, 0.06)', my: 1 }} />
          <SectionHeader label="Tokens & Emblems" />
          <Stack spacing={0.5}>
            {tokens.map((token, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 0.4,
                  px: 0.75,
                  borderRadius: 0.75,
                  bgcolor: 'rgba(201, 169, 78, 0.04)',
                  border: '1px solid rgba(201, 169, 78, 0.06)',
                }}
              >
                <Box sx={{
                  width: 6, height: 6, borderRadius: '50%',
                  bgcolor: token.type_line === 'Emblem' ? '#e8a54e' : '#7b5ea7',
                  flexShrink: 0,
                }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" sx={{
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {token.name}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.55rem', color: 'text.secondary' }}>
                    from {token.sourceCard}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <Typography variant="caption" sx={{
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: 'primary.main',
      fontWeight: 700,
      fontSize: '0.6rem',
      mb: 0.75,
      display: 'block',
    }}>
      {label}
    </Typography>
  );
}
