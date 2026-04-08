import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function getSupabase() {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return null;
}

// All deck routes require authentication
router.use(requireAuth);

// GET /api/decks - list all decks for user
router.get('/', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });

  const { data, error } = await supabase
    .from('decks')
    .select('id, name, format, card_count, updated_at, commander_name')
    .eq('user_id', req.user.id)
    .order('updated_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/decks/:id - get single deck
router.get('/:id', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });

  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (error) return res.status(404).json({ error: 'Deck not found' });
  res.json(data);
});

// POST /api/decks - create deck
router.post('/', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });

  const { name, format, mainboard, sideboard, commander, notes } = req.body;

  if (!name) return res.status(400).json({ error: 'Deck name is required' });

  const cardCount = Object.values(mainboard || {}).reduce((sum, qty) => sum + qty, 0);
  const commanderName = commander?.name || null;

  const { data, error } = await supabase
    .from('decks')
    .insert({
      user_id: req.user.id,
      name,
      format: format || 'Standard',
      mainboard: mainboard || {},
      sideboard: sideboard || {},
      commander: commander || null,
      notes: notes || '',
      card_count: cardCount,
      commander_name: commanderName,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT /api/decks/:id - update deck
router.put('/:id', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });

  const { name, format, mainboard, sideboard, commander, notes } = req.body;
  const cardCount = Object.values(mainboard || {}).reduce((sum, qty) => sum + qty, 0);

  const { data, error } = await supabase
    .from('decks')
    .update({
      name,
      format,
      mainboard: mainboard || {},
      sideboard: sideboard || {},
      commander: commander || null,
      notes: notes || '',
      card_count: cardCount,
      commander_name: commander?.name || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Deck not found' });
  res.json(data);
});

// DELETE /api/decks/:id - delete deck
router.delete('/:id', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });

  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

export default router;
