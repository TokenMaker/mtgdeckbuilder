export type Format = 'Standard' | 'Modern' | 'Pioneer' | 'Legacy' | 'Vintage' | 'Commander' | 'Pauper';

export interface FormatRules {
  name: Format;
  minDeckSize: number;
  maxCopies: number;
  singleton: boolean;
  hasCommander: boolean;
  hasColorIdentity: boolean;
  commonsOnly: boolean;
  hasSideboard: boolean;
  maxSideboardSize: number;
  description: string;
}

export const FORMAT_RULES: Record<Format, FormatRules> = {
  Standard: {
    name: 'Standard',
    minDeckSize: 60,
    maxCopies: 4,
    singleton: false,
    hasCommander: false,
    hasColorIdentity: false,
    commonsOnly: false,
    hasSideboard: true,
    maxSideboardSize: 15,
    description: 'The most recent sets only. Competitive and balanced.',
  },
  Modern: {
    name: 'Modern',
    minDeckSize: 60,
    maxCopies: 4,
    singleton: false,
    hasCommander: false,
    hasColorIdentity: false,
    commonsOnly: false,
    hasSideboard: true,
    maxSideboardSize: 15,
    description: 'Sets from 8th Edition (2003) onwards. Fast and powerful.',
  },
  Pioneer: {
    name: 'Pioneer',
    minDeckSize: 60,
    maxCopies: 4,
    singleton: false,
    hasCommander: false,
    hasColorIdentity: false,
    commonsOnly: false,
    hasSideboard: true,
    maxSideboardSize: 15,
    description: 'Sets from Return to Ravnica (2012) onwards.',
  },
  Legacy: {
    name: 'Legacy',
    minDeckSize: 60,
    maxCopies: 4,
    singleton: false,
    hasCommander: false,
    hasColorIdentity: false,
    commonsOnly: false,
    hasSideboard: true,
    maxSideboardSize: 15,
    description: 'Nearly all cards legal. Highly powerful format.',
  },
  Vintage: {
    name: 'Vintage',
    minDeckSize: 60,
    maxCopies: 4,
    singleton: false,
    hasCommander: false,
    hasColorIdentity: false,
    commonsOnly: false,
    hasSideboard: true,
    maxSideboardSize: 15,
    description: 'All cards legal with restricted list (max 1 copy of restricted cards).',
  },
  Commander: {
    name: 'Commander',
    minDeckSize: 100,
    maxCopies: 1,
    singleton: true,
    hasCommander: true,
    hasColorIdentity: true,
    commonsOnly: false,
    hasSideboard: false,
    maxSideboardSize: 0,
    description: '100-card singleton with a legendary commander. Social multiplayer format.',
  },
  Pauper: {
    name: 'Pauper',
    minDeckSize: 60,
    maxCopies: 4,
    singleton: false,
    hasCommander: false,
    hasColorIdentity: false,
    commonsOnly: true,
    hasSideboard: true,
    maxSideboardSize: 15,
    description: 'Commons only. Budget-friendly and skill-intensive.',
  },
};

export const FORMATS: Format[] = ['Standard', 'Modern', 'Pioneer', 'Legacy', 'Vintage', 'Commander', 'Pauper'];

// Vintage restricted list (must have max 1 copy)
export const VINTAGE_RESTRICTED = new Set([
  'Ancestral Recall', 'Balance', 'Black Lotus', 'Brainstorm', 'Channel',
  'Demonic Consultation', 'Demonic Tutor', 'Dig Through Time', 'Flash',
  'Gitaxian Probe', 'Gush', 'Imperial Seal', 'Karn, the Great Creator',
  "Lady Zhurong, Warrior Queen", 'Library of Alexandria', 'Lion\'s Eye Diamond',
  'Lodestone Golem', 'Lotus Petal', 'Mana Crypt', 'Mana Vault',
  'Memory Jar', 'Merchant Scroll', 'Mind\'s Desire', 'Mox Emerald',
  'Mox Jet', 'Mox Pearl', 'Mox Ruby', 'Mox Sapphire', 'Mystical Tutor',
  'Necropotence', 'Ponder', 'Preordain', 'Sol Ring', 'Strip Mine',
  'Temporal Manipulation', 'Time Vault', 'Time Walk', 'Timetwister',
  'Tinker', 'Tolarian Academy', 'Trinisphere', 'Vampiric Tutor',
  'Wheel of Fortune', 'Windfall', 'Yawgmoth\'s Bargain', 'Yawgmoth\'s Will',
]);

export interface ScryfallCard {
  id: string;
  name: string;
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  colors?: string[];
  color_identity: string[];
  rarity: string;
  set: string;
  set_name: string;
  collector_number: string;
  legalities: Record<string, string>;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    art_crop: string;
  };
  card_faces?: Array<{
    name: string;
    mana_cost?: string;
    type_line?: string;
    oracle_text?: string;
    image_uris?: {
      small: string;
      normal: string;
      large: string;
      art_crop: string;
    };
  }>;
  prices?: {
    usd?: string;
    usd_foil?: string;
  };
  prints_search_uri?: string;
  related_uris?: Record<string, string>;
}

export interface DeckCard {
  card: ScryfallCard;
  quantity: number;
}

export interface Deck {
  name: string;
  format: Format;
  mainboard: Record<string, DeckCard>; // keyed by card id
  sideboard: Record<string, DeckCard>;
  commander?: ScryfallCard | null;
}

export function isBasicLand(card: ScryfallCard): boolean {
  return card.type_line?.includes('Basic Land') || false;
}

export function hasUnlimitedCopies(card: ScryfallCard): boolean {
  if (isBasicLand(card)) return true;
  const oracle = (card.oracle_text || '').toLowerCase();
  return oracle.includes('a deck can have any number of cards named') ||
    oracle.includes('any number of cards named');
}

export function getCardImageUri(card: ScryfallCard, size: 'small' | 'normal' | 'large' = 'normal'): string {
  if (card.image_uris) return card.image_uris[size];
  if (card.card_faces?.[0]?.image_uris) return card.card_faces[0].image_uris[size];
  return 'https://cards.scryfall.io/back.jpg';
}

export function getLegalityStatus(card: ScryfallCard, format: Format): 'legal' | 'banned' | 'restricted' | 'not_legal' {
  const formatKey = format.toLowerCase();
  const status = card.legalities?.[formatKey];
  if (status === 'legal') return 'legal';
  if (status === 'banned') return 'banned';
  if (status === 'restricted') return 'restricted';
  return 'not_legal';
}

export interface DeckValidationError {
  type: 'error' | 'warning';
  message: string;
}

export function validateDeck(deck: Deck): DeckValidationError[] {
  const errors: DeckValidationError[] = [];
  const rules = FORMAT_RULES[deck.format];

  if (!rules) return errors;

  const mainboardCards = Object.values(deck.mainboard);
  const totalCards = mainboardCards.reduce((sum, dc) => sum + dc.quantity, 0);
  const commanderCount = deck.commander ? 1 : 0;

  // Commander: deck size is 99 + 1 commander = 100
  const effectiveTotal = rules.hasCommander ? totalCards + commanderCount : totalCards;

  if (effectiveTotal < rules.minDeckSize) {
    errors.push({
      type: 'error',
      message: `Deck must have at least ${rules.minDeckSize} cards (currently ${effectiveTotal})`,
    });
  }

  if (rules.hasCommander && !deck.commander) {
    errors.push({
      type: 'warning',
      message: 'Commander format requires a commander',
    });
  }

  for (const { card, quantity } of mainboardCards) {
    const legalityStatus = getLegalityStatus(card, deck.format);

    if (legalityStatus === 'banned') {
      errors.push({ type: 'error', message: `${card.name} is banned in ${deck.format}` });
    } else if (legalityStatus === 'not_legal') {
      errors.push({ type: 'error', message: `${card.name} is not legal in ${deck.format}` });
    }

    if (!hasUnlimitedCopies(card)) {
      let maxAllowed = rules.maxCopies;
      if (deck.format === 'Vintage' && VINTAGE_RESTRICTED.has(card.name)) {
        maxAllowed = 1;
      }
      if (quantity > maxAllowed) {
        errors.push({
          type: 'error',
          message: `${card.name}: max ${maxAllowed} copies in ${deck.format} (have ${quantity})`,
        });
      }
    }

    if (rules.hasColorIdentity && deck.commander) {
      const commanderIdentity = new Set(deck.commander.color_identity);
      const cardIdentity = card.color_identity;
      const violation = cardIdentity.some(c => !commanderIdentity.has(c));
      if (violation && !isBasicLand(card)) {
        errors.push({
          type: 'error',
          message: `${card.name} has colors outside commander's color identity`,
        });
      }
    }

    if (rules.commonsOnly && card.rarity !== 'common') {
      errors.push({
        type: 'error',
        message: `${card.name} is not a common (Pauper requires commons only)`,
      });
    }
  }

  return errors;
}
