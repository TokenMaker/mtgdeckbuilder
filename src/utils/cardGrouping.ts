import type { DeckCard } from './formatRules';

export type CardGroup = 'Commander' | 'Creatures' | 'Instants' | 'Sorceries' | 'Enchantments' | 'Artifacts' | 'Planeswalkers' | 'Battles' | 'Lands' | 'Other';

const GROUP_ORDER: CardGroup[] = [
  'Commander',
  'Creatures',
  'Instants',
  'Sorceries',
  'Enchantments',
  'Artifacts',
  'Planeswalkers',
  'Battles',
  'Lands',
  'Other',
];

export function getCardGroup(typeLine: string): Exclude<CardGroup, 'Commander'> {
  const lower = typeLine.toLowerCase();

  if (lower.includes('creature')) return 'Creatures';
  if (lower.includes('instant')) return 'Instants';
  if (lower.includes('sorcery')) return 'Sorceries';
  if (lower.includes('enchantment')) return 'Enchantments';
  if (lower.includes('artifact')) return 'Artifacts';
  if (lower.includes('planeswalker')) return 'Planeswalkers';
  if (lower.includes('battle')) return 'Battles';
  if (lower.includes('land')) return 'Lands';

  return 'Other';
}

export interface GroupedCards {
  group: CardGroup;
  cards: DeckCard[];
  totalCount: number;
}

export function groupDeckCards(
  mainboard: Record<string, DeckCard>,
  commanderId?: string
): GroupedCards[] {
  const groups: Map<CardGroup, DeckCard[]> = new Map();

  for (const deckCard of Object.values(mainboard)) {
    const group = getCardGroup(deckCard.card.type_line);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(deckCard);
  }

  // Sort cards within each group alphabetically
  for (const cards of groups.values()) {
    cards.sort((a, b) => a.card.name.localeCompare(b.card.name));
  }

  return GROUP_ORDER
    .filter(g => g !== 'Commander')
    .filter(g => groups.has(g))
    .map(g => ({
      group: g,
      cards: groups.get(g)!,
      totalCount: groups.get(g)!.reduce((sum, dc) => sum + dc.quantity, 0),
    }));
}

export function getDeckColorCounts(mainboard: Record<string, DeckCard>): Record<string, number> {
  const counts: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };

  for (const { card, quantity } of Object.values(mainboard)) {
    const colors = card.colors || [];
    if (colors.length === 0) {
      counts.C += quantity;
    } else {
      for (const color of colors) {
        if (color in counts) counts[color] += quantity;
      }
    }
  }

  return counts;
}

export function getManaCurveData(mainboard: Record<string, DeckCard>): Array<{ cmc: string; count: number }> {
  const curve: Record<number, number> = {};

  for (const { card, quantity } of Object.values(mainboard)) {
    // Only count non-lands
    if (!card.type_line.toLowerCase().includes('land')) {
      const cmc = Math.min(card.cmc || 0, 7); // Cap at 7+
      curve[cmc] = (curve[cmc] || 0) + quantity;
    }
  }

  const result = [];
  for (let i = 0; i <= 7; i++) {
    if (curve[i] || i <= 5) {
      result.push({
        cmc: i === 7 ? '7+' : String(i),
        count: curve[i] || 0,
      });
    }
  }

  return result;
}
