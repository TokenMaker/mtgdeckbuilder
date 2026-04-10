import { LRUCache } from 'lru-cache';

// LRU cache: max 500 entries, TTL 10 minutes
const cache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 10,
});

// Rate limiting: track last request time
let lastRequestTime = 0;
const RATE_LIMIT_MS = 100; // 100ms between requests

async function rateLimitedFetch(url) {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < RATE_LIMIT_MS) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS - timeSinceLast));
  }
  lastRequestTime = Date.now();

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'MTG-AI-Deck-Builder/1.0 (contact@example.com)',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ details: response.statusText }));
    throw new Error(error.details || `Scryfall API error: ${response.status}`);
  }

  return response.json();
}

/**
 * If the user typed a plain word/phrase (no Scryfall operators like o:, t:, c:, etc.)
 * expand it to match both card names and oracle text so keywords like "landfall",
 * "cascade", "trample", etc. return useful results.
 */
function buildScryfallQuery(query) {
  // Already a structured Scryfall query — pass through as-is
  if (query.includes(':')) return query;

  // Plain text: wrap multi-word phrases in quotes, then search name OR oracle text
  const term = query.includes(' ') ? `"${query}"` : query;
  return `(name:${term} OR o:${term})`;
}

export async function searchCards(query, page = 1) {
  const cacheKey = `search:${query}:${page}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const scryfallQuery = buildScryfallQuery(query);
  const encodedQuery = encodeURIComponent(scryfallQuery);
  const url = `https://api.scryfall.com/cards/search?q=${encodedQuery}&page=${page}&order=edhrec&unique=cards`;

  const data = await rateLimitedFetch(url);
  cache.set(cacheKey, data);
  return data;
}

export async function getCardByName(name) {
  const cacheKey = `named:${name.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const encodedName = encodeURIComponent(name);
  const url = `https://api.scryfall.com/cards/named?fuzzy=${encodedName}`;

  const data = await rateLimitedFetch(url);
  cache.set(cacheKey, data);
  return data;
}

export async function getCardById(id) {
  const cacheKey = `card:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const url = `https://api.scryfall.com/cards/${id}`;
  const data = await rateLimitedFetch(url);
  cache.set(cacheKey, data);
  return data;
}

export async function getRandomCard(query = '') {
  const url = query
    ? `https://api.scryfall.com/cards/random?q=${encodeURIComponent(query)}`
    : 'https://api.scryfall.com/cards/random';
  return rateLimitedFetch(url);
}

export function getCacheStats() {
  return {
    size: cache.size,
    max: cache.max,
  };
}
