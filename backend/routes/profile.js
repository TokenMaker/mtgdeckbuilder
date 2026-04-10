import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getCommanderArt(commander) {
  if (!commander) return null;
  return (
    commander.image_uris?.art_crop ||
    commander.image_uris?.normal ||
    commander.card_faces?.[0]?.image_uris?.art_crop ||
    commander.card_faces?.[0]?.image_uris?.normal ||
    null
  );
}

function getRank(totalDecks) {
  if (totalDecks >= 31) return 'Mythic Curator';
  if (totalDecks >= 16) return 'Master Brewer';
  if (totalDecks >= 6) return 'Deck Curator';
  return 'Aspiring Archivist';
}

async function buildProfile(sb, userId, username, joinedAt, includePrivate = false) {
  let deckQuery = sb
    .from('decks')
    .select('id, name, format, card_count, updated_at, is_public, commander')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (!includePrivate) {
    deckQuery = deckQuery.eq('is_public', true);
  }

  const { data: decks, error: decksError } = await deckQuery;
  if (decksError) throw decksError;

  const deckList = decks || [];
  const deckIds = deckList.map(d => d.id);

  let allMatches = [];
  let recentMatches = [];

  if (deckIds.length > 0) {
    const { data: matches } = await sb
      .from('matches')
      .select('id, deck_id, result, played_at')
      .in('deck_id', deckIds)
      .order('played_at', { ascending: true });
    allMatches = matches || [];

    const { data: recent } = await sb
      .from('matches')
      .select('id, deck_id, result, opponent_archetype, notes, played_at')
      .in('deck_id', deckIds)
      .order('played_at', { ascending: false })
      .limit(15);

    const deckNameMap = Object.fromEntries(deckList.map(d => [d.id, d.name]));
    recentMatches = (recent || []).map(m => ({
      ...m,
      deck_name: deckNameMap[m.deck_id] || 'Unknown Deck',
    }));
  }

  // Per-deck stats
  const deckStats = {};
  for (const match of allMatches) {
    if (!deckStats[match.deck_id]) deckStats[match.deck_id] = { wins: 0, losses: 0, draws: 0 };
    if (match.result === 'win') deckStats[match.deck_id].wins++;
    else if (match.result === 'loss') deckStats[match.deck_id].losses++;
    else deckStats[match.deck_id].draws++;
  }

  const wins = allMatches.filter(m => m.result === 'win').length;
  const losses = allMatches.filter(m => m.result === 'loss').length;
  const draws = allMatches.filter(m => m.result === 'draw').length;

  const formatCounts = {};
  for (const deck of deckList) {
    formatCounts[deck.format] = (formatCounts[deck.format] || 0) + 1;
  }
  const favoriteFormat = Object.entries(formatCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || '';

  const winRateHistory = computeWinRateHistory(allMatches);

  const decksWithStats = deckList.map(d => ({
    id: d.id,
    name: d.name,
    format: d.format,
    card_count: d.card_count,
    updated_at: d.updated_at,
    is_public: d.is_public ?? false,
    wins: deckStats[d.id]?.wins || 0,
    losses: deckStats[d.id]?.losses || 0,
    draws: deckStats[d.id]?.draws || 0,
    commander_name: d.commander?.name || null,
    commander_image: getCommanderArt(d.commander),
  }));

  return {
    username,
    joined_at: joinedAt,
    rank: getRank(deckList.length),
    stats: {
      totalDecks: deckList.length,
      totalMatches: allMatches.length,
      wins,
      losses,
      draws,
      favoriteFormat,
    },
    decks: decksWithStats,
    winRateHistory,
    recentMatches,
  };
}

// GET /api/profile/me  — authenticated, shows all decks
router.get('/me', async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.status(503).json({ error: 'Database not configured' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data: { user }, error } = await sb.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid token' });

    const username =
      user.user_metadata?.username ||
      user.email?.split('@')[0] ||
      'Archivist';

    const profile = await buildProfile(sb, user.id, username, user.created_at, true);
    res.json(profile);
  } catch (err) {
    console.error('Profile /me error:', err.message);
    res.status(500).json({ error: 'Failed to load profile', details: err.message });
  }
});

// PATCH /api/profile/me  — update username
router.patch('/me', async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.status(503).json({ error: 'Database not configured' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { username } = req.body;
  if (!username || typeof username !== 'string' || username.trim().length < 2) {
    return res.status(400).json({ error: 'Username must be at least 2 characters' });
  }
  const clean = username.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  if (clean.length < 2) return res.status(400).json({ error: 'Username must contain letters, numbers, _ or -' });

  try {
    const { data: { user }, error } = await sb.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid token' });

    // Check uniqueness
    const { data: users } = await sb.auth.admin.listUsers();
    const taken = (users?.users || []).some(u =>
      u.id !== user.id && u.user_metadata?.username === clean
    );
    if (taken) return res.status(409).json({ error: 'Username already taken' });

    const { error: updateError } = await sb.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, username: clean },
    });
    if (updateError) throw updateError;

    res.json({ username: clean });
  } catch (err) {
    console.error('Profile PATCH /me error:', err.message);
    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
});

// GET /api/profile/:username — public
router.get('/:username', async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.status(503).json({ error: 'Database not configured' });

  const { username } = req.params;

  try {
    const { data: users, error: usersError } = await sb.auth.admin.listUsers();
    if (usersError) throw usersError;

    const user = users.users.find(u =>
      u.user_metadata?.username === username ||
      u.email?.split('@')[0] === username
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    const profile = await buildProfile(sb, user.id, username, user.created_at, false);
    res.json(profile);
  } catch (err) {
    console.error('Profile error:', err.message);
    res.status(500).json({ error: 'Failed to load profile', details: err.message });
  }
});

function computeWinRateHistory(matches) {
  if (matches.length < 2) return [];

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
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
}

export default router;
