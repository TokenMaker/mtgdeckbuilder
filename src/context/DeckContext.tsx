import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ScryfallCard, DeckCard, Format } from '../utils/formatRules';
import { validateDeck, hasUnlimitedCopies, FORMAT_RULES, VINTAGE_RESTRICTED } from '../utils/formatRules';

const STORAGE_KEY = 'mtg-deck-builder-deck';

interface DeckState {
  name: string;
  format: Format;
  mainboard: Record<string, DeckCard>;
  sideboard: Record<string, DeckCard>;
  commander: ScryfallCard | null;
}

interface DeckContextValue extends DeckState {
  setDeckName: (name: string) => void;
  setFormat: (format: Format) => void;
  addCard: (card: ScryfallCard, quantity?: number, zone?: 'mainboard' | 'sideboard') => void;
  removeCard: (cardId: string, zone?: 'mainboard' | 'sideboard') => void;
  updateQuantity: (cardId: string, quantity: number, zone?: 'mainboard' | 'sideboard') => void;
  setCommander: (card: ScryfallCard | null) => void;
  clearDeck: () => void;
  loadDeck: (deck: DeckState) => void;
  totalCards: number;
  validationErrors: ReturnType<typeof validateDeck>;
  getDeckSummary: () => string;
}

const DeckContext = createContext<DeckContextValue | null>(null);

const DEFAULT_STATE: DeckState = {
  name: 'New Deck',
  format: 'Standard',
  mainboard: {},
  sideboard: {},
  commander: null,
};

function loadFromStorage(): DeckState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_STATE, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_STATE;
}

export function DeckProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DeckState>(loadFromStorage);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const setDeckName = useCallback((name: string) => {
    setState(s => ({ ...s, name }));
  }, []);

  const setFormat = useCallback((format: Format) => {
    setState(s => ({ ...s, format }));
  }, []);

  const addCard = useCallback((card: ScryfallCard, quantity = 1, zone: 'mainboard' | 'sideboard' = 'mainboard') => {
    setState(s => {
      const zoneData = { ...s[zone] };
      const existing = zoneData[card.id];
      const rules = FORMAT_RULES[s.format];

      let newQty = (existing?.quantity || 0) + quantity;

      // Enforce limits
      if (!hasUnlimitedCopies(card)) {
        let maxAllowed = rules.maxCopies;
        if (s.format === 'Vintage' && VINTAGE_RESTRICTED.has(card.name)) maxAllowed = 1;
        newQty = Math.min(newQty, maxAllowed);
      }

      zoneData[card.id] = { card, quantity: newQty };
      return { ...s, [zone]: zoneData };
    });
  }, []);

  const removeCard = useCallback((cardId: string, zone: 'mainboard' | 'sideboard' = 'mainboard') => {
    setState(s => {
      const zoneData = { ...s[zone] };
      delete zoneData[cardId];
      return { ...s, [zone]: zoneData };
    });
  }, []);

  const updateQuantity = useCallback((cardId: string, quantity: number, zone: 'mainboard' | 'sideboard' = 'mainboard') => {
    setState(s => {
      if (quantity <= 0) {
        const zoneData = { ...s[zone] };
        delete zoneData[cardId];
        return { ...s, [zone]: zoneData };
      }
      const zoneData = { ...s[zone] };
      if (zoneData[cardId]) {
        zoneData[cardId] = { ...zoneData[cardId], quantity };
      }
      return { ...s, [zone]: zoneData };
    });
  }, []);

  const setCommander = useCallback((card: ScryfallCard | null) => {
    setState(s => ({ ...s, commander: card }));
  }, []);

  const clearDeck = useCallback(() => {
    setState({ ...DEFAULT_STATE });
  }, []);

  const loadDeck = useCallback((deck: DeckState) => {
    setState(deck);
  }, []);

  const totalCards = Object.values(state.mainboard).reduce((sum, dc) => sum + dc.quantity, 0)
    + (state.commander ? 1 : 0);

  const validationErrors = validateDeck({
    name: state.name,
    format: state.format,
    mainboard: state.mainboard,
    sideboard: state.sideboard,
    commander: state.commander,
  });

  const getDeckSummary = useCallback(() => {
    const mainCards = Object.values(state.mainboard);
    if (mainCards.length === 0 && !state.commander) return 'Empty deck';

    const total = mainCards.reduce((sum, dc) => sum + dc.quantity, 0);
    const typeGroups: Record<string, number> = {};
    for (const { card, quantity } of mainCards) {
      const type = card.type_line.split('—')[0].trim();
      typeGroups[type] = (typeGroups[type] || 0) + quantity;
    }

    const summary = [`${total} cards in ${state.format}`];
    if (state.commander) summary.push(`Commander: ${state.commander.name}`);

    const topTypes = Object.entries(typeGroups)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => `${count} ${type}`)
      .join(', ');
    if (topTypes) summary.push(topTypes);

    // Add some card names for context
    const cardNames = mainCards.slice(0, 5).map(dc => dc.card.name).join(', ');
    if (cardNames) summary.push(`Includes: ${cardNames}${mainCards.length > 5 ? '...' : ''}`);

    return summary.join(' | ');
  }, [state]);

  return (
    <DeckContext.Provider value={{
      ...state,
      setDeckName,
      setFormat,
      addCard,
      removeCard,
      updateQuantity,
      setCommander,
      clearDeck,
      loadDeck,
      totalCards,
      validationErrors,
      getDeckSummary,
    }}>
      {children}
    </DeckContext.Provider>
  );
}

export function useDeckContext() {
  const ctx = useContext(DeckContext);
  if (!ctx) throw new Error('useDeckContext must be used within DeckProvider');
  return ctx;
}
