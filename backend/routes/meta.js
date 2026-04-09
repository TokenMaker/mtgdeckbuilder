import { Router } from 'express';
import { scrapeTrending } from '../services/metaScraper.js';

const router = Router();

// GET /api/meta/trending?format=modern&source=mtgtop8
router.get('/trending', async (req, res) => {
  const { format, source: _source } = req.query;

  try {
    const decks = await scrapeTrending(format || '');
    res.json(decks);
  } catch (err) {
    console.error('Meta trending error:', err.message);
    res.status(500).json({ error: 'Failed to fetch trending decks', details: err.message });
  }
});

// POST /api/meta/import — format a deck for saving
router.post('/import', (req, res) => {
  const deck = req.body;

  if (!deck || !deck.name) {
    return res.status(400).json({ error: 'Deck name is required' });
  }

  // Return formatted deck
  res.json({
    id: deck.id || `imported-${Date.now()}`,
    name: deck.name,
    format: deck.format || 'modern',
    archetype: deck.archetype || '',
    source: deck.source || 'import',
    source_url: deck.source_url || '',
    color_identity: deck.color_identity || [],
    mainboard: deck.mainboard || [],
    sideboard: deck.sideboard || [],
  });
});

export default router;
