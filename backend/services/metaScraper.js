import * as cheerio from 'cheerio';

// Simple in-memory LRU cache
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function cacheSet(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
  // Limit cache size
  if (cache.size > 50) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
}

// MTGTop8 format codes
const FORMAT_CODES = {
  standard: 'ST',
  modern: 'MO',
  pioneer: 'PI',
  legacy: 'LE',
  vintage: 'VI',
  commander: 'EDH',
  pauper: 'PAU',
};

// Static mock data fallback
const MOCK_DECKS = {
  modern: [
    {
      id: 'mock-modern-1',
      name: 'Murktide Regent',
      format: 'modern',
      archetype: 'Tempo',
      source: 'mock',
      source_url: '',
      color_identity: ['U', 'R'],
      mainboard: [
        { name: 'Murktide Regent', quantity: 4 },
        { name: 'Dragon\'s Rage Channeler', quantity: 4 },
        { name: 'Ragavan, Nimble Pilferer', quantity: 4 },
        { name: 'Lightning Bolt', quantity: 4 },
        { name: 'Counterspell', quantity: 4 },
        { name: 'Consider', quantity: 4 },
        { name: 'Mishra\'s Bauble', quantity: 4 },
        { name: 'Expressive Iteration', quantity: 4 },
        { name: 'Unholy Heat', quantity: 4 },
        { name: 'Fiery Islet', quantity: 2 },
        { name: 'Steam Vents', quantity: 2 },
        { name: 'Scalding Tarn', quantity: 4 },
        { name: 'Flooded Strand', quantity: 2 },
        { name: 'Island', quantity: 8 },
        { name: 'Mountain', quantity: 2 },
      ],
      sideboard: [],
    },
    {
      id: 'mock-modern-2',
      name: 'Amulet Titan',
      format: 'modern',
      archetype: 'Combo/Ramp',
      source: 'mock',
      source_url: '',
      color_identity: ['G', 'U'],
      mainboard: [
        { name: 'Primeval Titan', quantity: 4 },
        { name: 'Amulet of Vigor', quantity: 4 },
        { name: 'Cultivator Colossus', quantity: 1 },
        { name: 'Arboreal Grazer', quantity: 4 },
        { name: 'Azusa, Lost but Seeking', quantity: 3 },
        { name: 'Summoner\'s Pact', quantity: 4 },
        { name: 'Engineered Explosives', quantity: 1 },
        { name: 'Explore', quantity: 4 },
        { name: 'Ancient Stirrings', quantity: 4 },
        { name: 'Tolaria West', quantity: 4 },
        { name: 'Simic Growth Chamber', quantity: 4 },
        { name: 'Boros Garrison', quantity: 2 },
        { name: 'Forest', quantity: 10 },
        { name: 'Gemstone Mine', quantity: 4 },
        { name: 'Misty Rainforest', quantity: 2 },
      ],
      sideboard: [],
    },
  ],
  standard: [
    {
      id: 'mock-standard-1',
      name: 'Domain Ramp',
      format: 'standard',
      archetype: 'Ramp',
      source: 'mock',
      source_url: '',
      color_identity: ['W', 'U', 'B', 'R', 'G'],
      mainboard: [
        { name: 'Atraxa, Grand Unifier', quantity: 4 },
        { name: 'Sunfall', quantity: 4 },
        { name: 'Up the Beanstalk', quantity: 4 },
        { name: 'Lay Down Arms', quantity: 4 },
        { name: 'Make Your Mark', quantity: 4 },
        { name: 'Sunken Citadel', quantity: 4 },
        { name: 'Restless Anchorage', quantity: 4 },
        { name: 'Plaza of Heroes', quantity: 4 },
        { name: 'Forest', quantity: 4 },
        { name: 'Plains', quantity: 4 },
        { name: 'Island', quantity: 4 },
        { name: 'Swamp', quantity: 4 },
        { name: 'Mountain', quantity: 4 },
        { name: 'Mirrex', quantity: 4 },
        { name: 'Faerie Mastermind', quantity: 4 },
      ],
      sideboard: [],
    },
  ],
  pioneer: [
    {
      id: 'mock-pioneer-1',
      name: 'Lotus Field Combo',
      format: 'pioneer',
      archetype: 'Combo',
      source: 'mock',
      source_url: '',
      color_identity: ['U', 'G'],
      mainboard: [
        { name: 'Lotus Field', quantity: 4 },
        { name: 'Thespian\'s Stage', quantity: 4 },
        { name: 'Hidden Strings', quantity: 4 },
        { name: 'Pore Over the Pages', quantity: 4 },
        { name: 'Bala Ged Recovery', quantity: 3 },
        { name: 'Spelunking', quantity: 4 },
        { name: 'Arboreal Grazer', quantity: 4 },
        { name: 'Emergent Ultimatum', quantity: 2 },
        { name: 'Dig Through Time', quantity: 4 },
        { name: 'Impulse', quantity: 4 },
        { name: 'Forest', quantity: 8 },
        { name: 'Island', quantity: 4 },
        { name: 'Yavimaya Coast', quantity: 4 },
        { name: 'Botanical Sanctum', quantity: 3 },
        { name: 'Otawara, Soaring City', quantity: 2 },
      ],
      sideboard: [],
    },
  ],
  legacy: [
    {
      id: 'mock-legacy-1',
      name: 'UR Delver',
      format: 'legacy',
      archetype: 'Tempo',
      source: 'mock',
      source_url: '',
      color_identity: ['U', 'R'],
      mainboard: [
        { name: 'Delver of Secrets', quantity: 4 },
        { name: 'Dragon\'s Rage Channeler', quantity: 4 },
        { name: 'Murktide Regent', quantity: 4 },
        { name: 'Brainstorm', quantity: 4 },
        { name: 'Ponder', quantity: 4 },
        { name: 'Daze', quantity: 4 },
        { name: 'Force of Will', quantity: 4 },
        { name: 'Price of Progress', quantity: 2 },
        { name: 'Lightning Bolt', quantity: 4 },
        { name: 'Mishra\'s Bauble', quantity: 4 },
        { name: 'Volcanic Island', quantity: 4 },
        { name: 'Scalding Tarn', quantity: 4 },
        { name: 'Fiery Islet', quantity: 4 },
        { name: 'Island', quantity: 4 },
        { name: 'Wasteland', quantity: 4 },
      ],
      sideboard: [],
    },
  ],
  commander: [
    {
      id: 'mock-commander-1',
      name: 'Atraxa Superfriends',
      format: 'commander',
      archetype: 'Planeswalkers',
      source: 'mock',
      source_url: '',
      color_identity: ['W', 'U', 'B', 'G'],
      mainboard: [
        { name: 'Atraxa, Praetors\' Voice', quantity: 1 },
        { name: 'Doubling Season', quantity: 1 },
        { name: 'Teferi, Hero of Dominaria', quantity: 1 },
        { name: 'Liliana Vess', quantity: 1 },
        { name: 'Garruk Wildspeaker', quantity: 1 },
        { name: 'Sol Ring', quantity: 1 },
        { name: 'Arcane Signet', quantity: 1 },
        { name: 'Command Tower', quantity: 1 },
        { name: 'Forest', quantity: 12 },
        { name: 'Island', quantity: 12 },
        { name: 'Plains', quantity: 10 },
        { name: 'Swamp', quantity: 10 },
      ],
      sideboard: [],
    },
  ],
  vintage: [],
  pauper: [],
};

async function fetchPage(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MTGDeckBuilder/1.0)',
      'Accept': 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function scrapeDeckList(deckUrl) {
  try {
    const html = await fetchPage(deckUrl);
    const $ = cheerio.load(html);
    const cards = [];

    // MTGTop8 deck list structure
    $('.hover_tr').each((_, el) => {
      const text = $(el).text().trim();
      const match = text.match(/^(\d+)\s+(.+)$/);
      if (match) {
        cards.push({ name: match[2].trim(), quantity: parseInt(match[1], 10) });
      }
    });

    // Alternate selector
    if (cards.length === 0) {
      $('div.O14').each((_, el) => {
        const qty = parseInt($(el).prev().text().trim(), 10);
        const name = $(el).text().trim();
        if (name && !isNaN(qty)) {
          cards.push({ name, quantity: qty });
        }
      });
    }

    return cards;
  } catch {
    return [];
  }
}

export async function scrapeTop8(format = 'modern') {
  const cacheKey = `trending:${format}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const formatCode = FORMAT_CODES[format.toLowerCase()] || 'MO';

  try {
    const url = `https://www.mtgtop8.com/format?f=${formatCode}`;
    const html = await fetchPage(url);
    const $ = cheerio.load(html);
    const decks = [];

    // Parse deck entries from the results table
    $('table.Stable tr').each((i, row) => {
      if (i === 0) return; // skip header

      const cells = $(row).find('td');
      if (cells.length < 3) return;

      const nameEl = cells.eq(0).find('a').first();
      const deckName = nameEl.text().trim();
      if (!deckName) return;

      const href = nameEl.attr('href') || '';
      const archetype = cells.eq(1).text().trim();
      const pilot = cells.eq(2).text().trim();

      // Extract color identity from colored dots/symbols
      const colors = [];
      cells.eq(0).find('img[src*="mana"]').each((_, img) => {
        const src = $(img).attr('src') || '';
        const colorMatch = src.match(/\/([WUBRG])\.png/i);
        if (colorMatch) colors.push(colorMatch[1].toUpperCase());
      });

      const deckId = `top8-${format}-${i}-${Date.now()}`;
      const fullUrl = href.startsWith('http') ? href : `https://www.mtgtop8.com/${href}`;

      decks.push({
        id: deckId,
        name: deckName,
        format: format.toLowerCase(),
        archetype: archetype || '',
        pilot: pilot || '',
        source: 'mtgtop8',
        source_url: fullUrl,
        color_identity: [...new Set(colors)],
        mainboard: [],
        sideboard: [],
      });
    });

    // Attempt to fetch deck lists for first 6 decks
    const topDecks = decks.slice(0, 6);
    await Promise.all(
      topDecks.map(async (deck) => {
        if (deck.source_url) {
          deck.mainboard = await scrapeDeckList(deck.source_url);
        }
      })
    );

    if (topDecks.length === 0) {
      throw new Error('No decks found in HTML');
    }

    cacheSet(cacheKey, topDecks);
    return topDecks;
  } catch (err) {
    console.warn(`MTGTop8 scraping failed for ${format}: ${err.message}. Using mock data.`);
    const fallback = MOCK_DECKS[format.toLowerCase()] || MOCK_DECKS.modern;
    cacheSet(cacheKey, fallback);
    return fallback;
  }
}

export async function scrapeTrending(format) {
  if (format && format !== '') {
    return scrapeTop8(format);
  }

  // No format specified — get a mix
  const formats = ['modern', 'standard', 'pioneer', 'legacy'];
  const results = await Promise.allSettled(formats.map(f => scrapeTop8(f)));

  const combined = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      combined.push(...result.value.slice(0, 3));
    }
  }

  return combined;
}
