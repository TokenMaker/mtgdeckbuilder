import { Router } from 'express';
import { getChatResponse } from '../services/claudeService.js';
import { searchCards } from '../services/scryfallService.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

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
    const tier = req.user ? 'premium' : 'free';

    const aiResponse = await getChatResponse({
      message,
      format: format || 'Standard',
      deckSummary: deckSummary || 'Empty deck',
      tier,
      history: history || [],
    });

    let cards = [];
    if (aiResponse.scryfallQuery) {
      try {
        const scryfallData = await searchCards(aiResponse.scryfallQuery);
        cards = scryfallData.data || [];
        // Limit to first 20 cards for performance
        cards = cards.slice(0, 20);
      } catch (scryfallError) {
        console.error('Scryfall search failed:', scryfallError.message);
        // Don't fail the whole request if Scryfall fails
      }
    }

    res.json({
      ...aiResponse,
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
