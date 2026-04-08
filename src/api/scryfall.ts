export interface ScryfallCard {
  id: string;
  name: string;
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  colors?: string[];
  color_identity: string[];
  keywords?: string[];
  legalities: Record<string, string>;
  set: string;
  set_name: string;
  rarity: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  card_faces?: Array<{
    name: string;
    mana_cost: string;
    type_line: string;
    oracle_text?: string;
    image_uris?: {
      small: string;
      normal: string;
      large: string;
      png: string;
      art_crop: string;
      border_crop: string;
    };
    power?: string;
    toughness?: string;
  }>;
  layout: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  produced_mana?: string[];
  prices: Record<string, string | null>;
  all_parts?: Array<{
    object: string;
    id: string;
    component: string;
    name: string;
    type_line: string;
    uri: string;
  }>;
}

export interface ScryfallSearchResult {
  object: string;
  total_cards: number;
  has_more: boolean;
  next_page?: string;
  data: ScryfallCard[];
}

const SCRYFALL_API = 'https://api.scryfall.com';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 100) {
    await delay(100 - elapsed);
  }
  lastRequestTime = Date.now();
  return fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });
}

export async function searchCards(
  query: string,
  colorIdentity?: string[]
): Promise<ScryfallSearchResult> {
  if (!query.trim()) {
    return { object: 'list', total_cards: 0, has_more: false, data: [] };
  }

  let fullQuery = query.trim();

  if (colorIdentity && colorIdentity.length > 0) {
    const colors = colorIdentity.join('');
    fullQuery += ` id<=${colors}`;
  }

  fullQuery += ' f:commander';

  const url = `${SCRYFALL_API}/cards/search?q=${encodeURIComponent(fullQuery)}&order=edhrec&unique=cards`;

  const response = await rateLimitedFetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      return { object: 'list', total_cards: 0, has_more: false, data: [] };
    }
    throw new Error(`Scryfall API error: ${response.status}`);
  }

  return response.json();
}

export async function searchCommanders(query: string): Promise<ScryfallSearchResult> {
  if (!query.trim()) {
    return { object: 'list', total_cards: 0, has_more: false, data: [] };
  }

  const fullQuery = `${query.trim()} is:commander f:commander`;
  const url = `${SCRYFALL_API}/cards/search?q=${encodeURIComponent(fullQuery)}&order=edhrec&unique=cards`;

  const response = await rateLimitedFetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      return { object: 'list', total_cards: 0, has_more: false, data: [] };
    }
    throw new Error(`Scryfall API error: ${response.status}`);
  }

  return response.json();
}

export function getCardImageUri(card: ScryfallCard, face: number = 0, size: 'small' | 'normal' | 'large' = 'normal'): string {
  if (card.image_uris) {
    return card.image_uris[size];
  }
  if (card.card_faces && card.card_faces[face]?.image_uris) {
    return card.card_faces[face].image_uris![size];
  }
  return '';
}

export function isBasicLand(card: ScryfallCard): boolean {
  return card.type_line.includes('Basic') && card.type_line.includes('Land');
}

export function isDoubleFaced(card: ScryfallCard): boolean {
  return !!(card.card_faces && card.card_faces.length > 1 && !card.image_uris);
}

export function getCardTypeBucket(card: ScryfallCard): string {
  const typeLine = card.type_line.toLowerCase();
  if (typeLine.includes('creature')) return 'Creatures';
  if (typeLine.includes('instant')) return 'Instants';
  if (typeLine.includes('sorcery')) return 'Sorceries';
  if (typeLine.includes('enchantment')) return 'Enchantments';
  if (typeLine.includes('artifact')) return 'Artifacts';
  if (typeLine.includes('planeswalker')) return 'Planeswalkers';
  if (typeLine.includes('land')) return 'Lands';
  if (typeLine.includes('battle')) return 'Battles';
  return 'Other';
}

export const TYPE_ORDER = [
  'Creatures',
  'Planeswalkers',
  'Instants',
  'Sorceries',
  'Enchantments',
  'Artifacts',
  'Battles',
  'Lands',
  'Other',
];

export const MANA_COLORS: Record<string, string> = {
  W: '#f9faf4',
  U: '#0e68ab',
  B: '#150b00',
  R: '#d3202a',
  G: '#00733e',
};

export const MANA_DISPLAY_COLORS: Record<string, string> = {
  W: '#f9f5dd',
  U: '#4596e0',
  B: '#a88ec2',
  R: '#e85454',
  G: '#4caf7d',
  C: '#9e9e9e',
};

export interface TokenInfo {
  name: string;
  type_line: string;
  sourceCard: string;
}

export function extractTokensFromDeck(cards: ScryfallCard[], commander: ScryfallCard | null): TokenInfo[] {
  const tokenMap = new Map<string, TokenInfo>();
  const allCards = commander ? [commander, ...cards] : cards;

  for (const card of allCards) {
    if (card.all_parts) {
      for (const part of card.all_parts) {
        if (part.component === 'token' || part.type_line.toLowerCase().includes('emblem')) {
          const key = part.name + '|' + part.type_line;
          if (!tokenMap.has(key)) {
            tokenMap.set(key, {
              name: part.name,
              type_line: part.type_line,
              sourceCard: card.name,
            });
          }
        }
      }
    }
    // Also parse oracle text for common token patterns
    const oracleText = card.oracle_text || '';
    if (card.card_faces) {
      for (const face of card.card_faces) {
        if (face.oracle_text) {
          parseTokensFromText(face.oracle_text, card.name, tokenMap);
        }
      }
    } else {
      parseTokensFromText(oracleText, card.name, tokenMap);
    }
  }

  return Array.from(tokenMap.values());
}

function parseTokensFromText(text: string, sourceName: string, tokenMap: Map<string, TokenInfo>) {
  // Match patterns like "create a 1/1 white Soldier creature token"
  const tokenRegex = /create[s]?\s+(?:a|an|\w+)?\s*(\d+\/\d+)\s+([\w\s,/]+?)\s+(creature|artifact|enchantment)\s+token/gi;
  let match;
  while ((match = tokenRegex.exec(text)) !== null) {
    const stats = match[1];
    const descriptor = match[2].trim();
    const type = match[3];
    const name = `${descriptor} ${type} (${stats})`;
    const key = name;
    if (!tokenMap.has(key)) {
      tokenMap.set(key, {
        name,
        type_line: `Token ${type}`,
        sourceCard: sourceName,
      });
    }
  }

  // Match emblem creation
  if (text.toLowerCase().includes('emblem')) {
    const emblemRegex = /gets? an emblem/i;
    if (emblemRegex.test(text)) {
      const key = `Emblem — ${sourceName}`;
      if (!tokenMap.has(key)) {
        tokenMap.set(key, {
          name: `Emblem — ${sourceName}`,
          type_line: 'Emblem',
          sourceCard: sourceName,
        });
      }
    }
  }
}

export function getColorDistribution(cards: ScryfallCard[], commander: ScryfallCard | null): Record<string, number> {
  const dist: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
  const allCards = commander ? [commander, ...cards] : cards;

  for (const card of allCards) {
    // Skip lands for color distribution
    if (card.type_line.toLowerCase().includes('land')) continue;

    const colors = card.colors || card.color_identity;
    if (!colors || colors.length === 0) {
      dist['C']++;
    } else {
      for (const c of colors) {
        if (dist[c] !== undefined) dist[c]++;
      }
    }
  }
  return dist;
}

export function getManaCurve(cards: ScryfallCard[], commander: ScryfallCard | null): Record<string, number> {
  const curve: Record<string, number> = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7+': 0 };
  const allCards = commander ? [commander, ...cards] : cards;

  for (const card of allCards) {
    if (card.type_line.toLowerCase().includes('land')) continue;
    const cmc = Math.floor(card.cmc);
    if (cmc >= 7) {
      curve['7+']++;
    } else {
      curve[String(cmc)]++;
    }
  }
  return curve;
}

export function getSubtypeDistribution(cards: ScryfallCard[], commander: ScryfallCard | null): Record<string, number> {
  const dist: Record<string, number> = {};
  const allCards = commander ? [commander, ...cards] : cards;

  for (const card of allCards) {
    const typeLine = card.type_line;
    // Subtypes come after the em-dash
    const dashIndex = typeLine.indexOf('—');
    if (dashIndex === -1) continue;
    const subtypes = typeLine.slice(dashIndex + 1).trim().split(/\s+/);
    for (const sub of subtypes) {
      const clean = sub.trim();
      if (clean && clean !== '//' && clean.length > 1) {
        dist[clean] = (dist[clean] || 0) + 1;
      }
    }
  }

  return dist;
}
