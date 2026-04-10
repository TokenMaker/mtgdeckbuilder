import { Router } from 'express';
import { searchCards, getCardByName, getCardById, getRandomCard } from '../services/scryfallService.js';

const router = Router();

// Search cards
router.get('/search', async (req, res) => {
  const { q, page = 1 } = req.query;

  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  try {
    const data = await searchCards(q.trim(), parseInt(page));
    res.json(data);
  } catch (error) {
    console.error('Scryfall search error:', error.message);

    // Scryfall returns 404/422 when nothing matches — surface as a clean empty result
    if (error.message?.includes('No cards found') || error.message?.includes('404') || error.message?.includes('422')) {
      return res.status(404).json({ error: 'No cards found for that search', details: error.message });
    }

    res.status(500).json({ error: 'Scryfall search failed', details: error.message });
  }
});

// Get card by name (fuzzy)
router.get('/named', async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Name parameter is required' });
  }

  try {
    const card = await getCardByName(name);
    res.json(card);
  } catch (error) {
    console.error('Scryfall named error:', error.message);
    res.status(404).json({ error: 'Card not found', details: error.message });
  }
});

// Get card by ID
router.get('/cards/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const card = await getCardById(id);
    res.json(card);
  } catch (error) {
    console.error('Scryfall card error:', error.message);
    res.status(404).json({ error: 'Card not found', details: error.message });
  }
});

// Random card
router.get('/random', async (req, res) => {
  const { q } = req.query;

  try {
    const card = await getRandomCard(q);
    res.json(card);
  } catch (error) {
    console.error('Scryfall random error:', error.message);
    res.status(500).json({ error: 'Failed to get random card', details: error.message });
  }
});

export default router;
