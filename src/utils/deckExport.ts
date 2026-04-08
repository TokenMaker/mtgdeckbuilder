import type { Deck, DeckCard } from './formatRules';

function sortedCards(cards: Record<string, DeckCard>): DeckCard[] {
  return Object.values(cards).sort((a, b) => a.card.name.localeCompare(b.card.name));
}

export function exportToArena(deck: Deck): string {
  const lines: string[] = [];

  if (deck.commander) {
    lines.push('Commander');
    lines.push(`1 ${deck.commander.name}`);
    lines.push('');
  }

  lines.push('Deck');
  for (const { card, quantity } of sortedCards(deck.mainboard)) {
    lines.push(`${quantity} ${card.name}`);
  }

  const sideboardCards = sortedCards(deck.sideboard);
  if (sideboardCards.length > 0) {
    lines.push('');
    lines.push('Sideboard');
    for (const { card, quantity } of sideboardCards) {
      lines.push(`${quantity} ${card.name}`);
    }
  }

  return lines.join('\n');
}

export function exportToMTGO(deck: Deck): string {
  const lines: string[] = [];

  if (deck.commander) {
    lines.push('// Commander');
    lines.push(`1 ${deck.commander.name}`);
    lines.push('');
  }

  // Group by card type for MTGO format
  const mainboardCards = sortedCards(deck.mainboard);
  lines.push('// Main Deck');
  for (const { card, quantity } of mainboardCards) {
    lines.push(`${quantity} ${card.name}`);
  }

  const sideboardCards = sortedCards(deck.sideboard);
  if (sideboardCards.length > 0) {
    lines.push('');
    lines.push('// Sideboard');
    for (const { card, quantity } of sideboardCards) {
      lines.push(`${quantity} ${card.name}`);
    }
  }

  return lines.join('\n');
}

export function exportToText(deck: Deck): string {
  const lines: string[] = [];
  const totalCards = Object.values(deck.mainboard).reduce((sum, dc) => sum + dc.quantity, 0);

  lines.push(`// ${deck.name}`);
  lines.push(`// Format: ${deck.format}`);
  lines.push(`// Cards: ${totalCards}`);
  lines.push('');

  return exportToMTGO(deck).split('\n').slice(0).join('\n');
}

export type ExportFormat = 'arena' | 'mtgo' | 'text';

export function exportDeck(deck: Deck, format: ExportFormat): string {
  switch (format) {
    case 'arena': return exportToArena(deck);
    case 'mtgo': return exportToMTGO(deck);
    case 'text': return exportToText(deck);
    default: return exportToArena(deck);
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const success = document.execCommand('copy');
    document.body.removeChild(el);
    return success;
  }
}

export function downloadAsFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
