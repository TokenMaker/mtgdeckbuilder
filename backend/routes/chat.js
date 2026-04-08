import { Router } from 'express';
import { getChatResponse } from '../services/claudeService.js';
import { searchCards, getCardByName } from '../services/scryfallService.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Fetch a single card by name, return null on failure (don't break whole deck)
async function fetchCardByName(name) {
  try {
    return await getCardByName(name);
  } catch {
    return null;
  }
}

// Fetch all deck list cards in parallel batches to stay within rate limits
async function fetchDeckListCards(deckList) {
  const BATCH_SIZE = 8;
  const results = [];

  for (let i = 0; i < deckList.length; i += BATCH_SIZE) {
    const batch = deckList.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(entry => fetchCardByName(entry.name).then(card => card ? { card, quantity: entry.quantity || 1 } : null))
    );
    results.push(...batchResults.filter(Boolean));

    // Small delay between batches to respect Scryfall rate limits
    if (i + BATCH_SIZE < deckList.length) {
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }

  return results;
}

router.post('/', optionalAuth, async (req, res) => {
  const { message, format, deckSummary, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      error: 'AI service not configured',
      message: 'The AI assistant requires an OpenAI API key. Please configure OPENAI_API_KEY in backend/.env',
    });
  }

  try {
    const aiResponse = await getChatResponse({
      message,
      format: format || 'Standard',
      deckSummary: deckSummary || 'Empty deck',
      history: history || [],
    });

    let cards = [];

    if (aiResponse.deckList && Array.isArray(aiResponse.deckList) && aiResponse.deckList.length > 0) {
      // Build deck mode — fetch each card by name in parallel
      const deckCards = await fetchDeckListCards(aiResponse.deckList);
      // Return flat card array with quantity injected for the frontend to add
      cards = deckCards.map(({ card, quantity }) => ({ ...card, _deckQuantity: quantity }));
    } else if (aiResponse.scryfallQuery) {
      // Search mode — single query
      try {
        const scryfallData = await searchCards(aiResponse.scryfallQuery);
        cards = (scryfallData.data || []).slice(0, 20);
      } catch (scryfallError) {
        console.error('Scryfall search failed:', scryfallError.message);
      }
    }

    res.json({
      message: aiResponse.message,
      action: aiResponse.action || 'answer',
      scryfallQuery: aiResponse.scryfallQuery || null,
      deckList: aiResponse.deckList || null,
      cards,
    });
  } catch (error) {
    console.error('Chat error:', error);

    if (error.message?.includes('API key') || error.status === 401) {
      return res.status(401).json({ error: 'Invalid OpenAI API key' });
    }

    res.status(500).json({ error: 'Failed to get AI response', details: error.message });
  }
});

export default router;
