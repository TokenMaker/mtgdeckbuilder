import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { getChatResponse } from '../services/claudeService.js';
import { searchCards, getCardByName } from '../services/scryfallService.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

const FREE_LIMIT = 20;
const PREMIUM_LIMIT = 100;
const UNAUTH_LIMIT = 5;

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function getUsageCount(sb, userId) {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await sb
    .from('chat_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('date', today)
    .single();
  return data?.count || 0;
}

async function incrementUsage(sb, userId) {
  const today = new Date().toISOString().split('T')[0];
  await sb.rpc('increment_chat_usage', { p_user_id: userId, p_date: today }).catch(async () => {
    // Fallback: upsert manually
    const current = await getUsageCount(sb, userId);
    await sb.from('chat_usage').upsert(
      { user_id: userId, date: today, count: current + 1 },
      { onConflict: 'user_id,date' }
    );
  });
}

// Fetch a single card by name, return null on failure
async function fetchCardByName(name) {
  try {
    return await getCardByName(name);
  } catch {
    return null;
  }
}

// Fetch all deck list cards in parallel batches
async function fetchDeckListCards(deckList) {
  const BATCH_SIZE = 8;
  const results = [];

  for (let i = 0; i < deckList.length; i += BATCH_SIZE) {
    const batch = deckList.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(entry => fetchCardByName(entry.name).then(card => card ? { card, quantity: entry.quantity || 1 } : null))
    );
    results.push(...batchResults.filter(Boolean));

    if (i + BATCH_SIZE < deckList.length) {
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }

  return results;
}

// GET /api/chat/usage — get today's usage
router.get('/usage', optionalAuth, async (req, res) => {
  const sb = getSupabase();
  if (!sb || !req.user) {
    return res.json({ messagesUsedToday: 0, messagesLimit: req.user ? FREE_LIMIT : UNAUTH_LIMIT });
  }

  try {
    const count = await getUsageCount(sb, req.user.id);
    res.json({ messagesUsedToday: count, messagesLimit: FREE_LIMIT });
  } catch (err) {
    res.json({ messagesUsedToday: 0, messagesLimit: FREE_LIMIT, error: err.message });
  }
});

router.post('/', optionalAuth, async (req, res) => {
  const { message, format, deckSummary, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      error: 'AI service not configured',
      message: 'The AI assistant requires an OpenAI API key.',
    });
  }

  const sb = getSupabase();

  // Check and enforce usage limits
  let messagesUsedToday = 0;
  let messagesLimit = req.user ? FREE_LIMIT : UNAUTH_LIMIT;

  if (sb && req.user) {
    messagesUsedToday = await getUsageCount(sb, req.user.id);
    if (messagesUsedToday >= messagesLimit) {
      return res.status(429).json({
        limitReached: true,
        messagesUsedToday,
        messagesLimit,
        error: 'Daily message limit reached',
      });
    }
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
      const deckCards = await fetchDeckListCards(aiResponse.deckList);
      cards = deckCards.map(({ card, quantity }) => ({ ...card, _deckQuantity: quantity }));
    } else if (aiResponse.scryfallQuery) {
      try {
        const scryfallData = await searchCards(aiResponse.scryfallQuery);
        cards = (scryfallData.data || []).slice(0, 20);
      } catch (scryfallError) {
        console.error('Scryfall search failed:', scryfallError.message);
      }
    }

    // Increment usage after successful response
    if (sb && req.user) {
      await incrementUsage(sb, req.user.id);
      messagesUsedToday++;
    }

    res.json({
      message: aiResponse.message,
      action: aiResponse.action || 'answer',
      scryfallQuery: aiResponse.scryfallQuery || null,
      deckList: aiResponse.deckList || null,
      cards,
      messagesUsedToday,
      messagesLimit,
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
