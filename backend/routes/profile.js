import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// GET /api/profile/:username
router.get('/:username', async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.status(503).json({ error: 'Database not configured' });

  const { username } = req.params;

  try {
    // Look up user by username (stored in user metadata or email prefix)
    // We query decks by looking at user email/metadata
    const { data: users, error: usersError } = await sb.auth.admin.listUsers();
    if (usersError) throw usersError;

    const user = users.users.find(u =>
      u.user_metadata?.username === username ||
      u.email?.split('@')[0] === username
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = user.id;
    const joinedAt = user.created_at;

    // Get decks
    const { data: decks, error: decksError } = await sb
      .from('decks')
      .select('id, name, format, card_count, updated_at, is_public')
      .eq('user_id', userId)
      .eq('is_public', true)
      .order('updated_at', { ascending: false });

    if (decksError) throw decksError;

    // Get matches for all decks
    const deckIds = (decks || []).map(d => d.id);
    let allMatches = [];
    if (deckIds.length > 0) {
      const { data: matches } = await sb
        .from('matches')
        .select('id, deck_id, result, played_at')
        .in('deck_id', deckIds)
        .order('played_at', { ascending: true });
      allMatches = matches || [];
    }

    // Compute per-deck stats
    const deckStats = {};
    for (const match of allMatches) {
      if (!deckStats[match.deck_id]) {
        deckStats[match.deck_id] = { wins: 0, losses: 0, draws: 0 };
      }
      if (match.result === 'win') deckStats[match.deck_id].wins++;
      else if (match.result === 'loss') deckStats[match.deck_id].losses++;
      else deckStats[match.deck_id].draws++;
    }

    // Global stats
    const wins = allMatches.filter(m => m.result === 'win').length;
    const losses = allMatches.filter(m => m.result === 'loss').length;
    const draws = allMatches.filter(m => m.result === 'draw').length;

    // Favorite format
    const formatCounts = {};
    for (const deck of (decks || [])) {
      formatCounts[deck.format] = (formatCounts[deck.format] || 0) + 1;
    }
    const favoriteFormat = Object.entries(formatCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || '';

    // Win rate history (rolling 7-day windows)
    const winRateHistory = computeWinRateHistory(allMatches);

    const decksWithStats = (decks || []).map(d => ({
      ...d,
      wins: deckStats[d.id]?.wins || 0,
      losses: deckStats[d.id]?.losses || 0,
      draws: deckStats[d.id]?.draws || 0,
    }));

    res.json({
      username,
      joined_at: joinedAt,
      stats: {
        totalDecks: (decks || []).length,
        totalMatches: allMatches.length,
        wins,
        losses,
        draws,
        favoriteFormat,
      },
      decks: decksWithStats,
      winRateHistory,
    });
  } catch (err) {
    console.error('Profile error:', err.message);
    res.status(500).json({ error: 'Failed to load profile', details: err.message });
  }
});

function computeWinRateHistory(matches) {
  if (matches.length < 2) return [];

  // Group by week
  const weekMap = {};
  for (const match of matches) {
    const d = new Date(match.played_at);
    const weekKey = getWeekStart(d);
    if (!weekMap[weekKey]) weekMap[weekKey] = { wins: 0, total: 0 };
    weekMap[weekKey].total++;
    if (match.result === 'win') weekMap[weekKey].wins++;
  }

  return Object.entries(weekMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { wins, total }]) => ({
      date,
      winRate: Math.round((wins / total) * 100),
      matchesPlayed: total,
    }));
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d.toISOString().split('T')[0];
}

export default router;
