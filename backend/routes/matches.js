import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// GET /api/matches/:deckId
router.get('/:deckId', requireAuth, async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.status(503).json({ error: 'Database not configured' });

  const { deckId } = req.params;
  const userId = req.user.id;

  try {
    const { data, error } = await sb
      .from('matches')
      .select('*')
      .eq('deck_id', deckId)
      .eq('user_id', userId)
      .order('played_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch matches', details: err.message });
  }
});

// POST /api/matches
router.post('/', requireAuth, async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.status(503).json({ error: 'Database not configured' });

  const { deck_id, result, opponent_archetype, format, notes } = req.body;
  const userId = req.user.id;

  if (!deck_id || !result) {
    return res.status(400).json({ error: 'deck_id and result are required' });
  }

  if (!['win', 'loss', 'draw'].includes(result)) {
    return res.status(400).json({ error: 'result must be win, loss, or draw' });
  }

  try {
    const { data, error } = await sb
      .from('matches')
      .insert({
        user_id: userId,
        deck_id,
        result,
        opponent_archetype: opponent_archetype || null,
        format: format || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create match', details: err.message });
  }
});

// DELETE /api/matches/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const sb = getSupabase();
  if (!sb) return res.status(503).json({ error: 'Database not configured' });

  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { error } = await sb
      .from('matches')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete match', details: err.message });
  }
});

export default router;
