import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isBasicLand } from '../api/scryfall';
import type { ScryfallCard } from '../api/scryfall';

export interface DeckState {
  commander: ScryfallCard | null;
  cards: ScryfallCard[];
  notification: { message: string; severity: 'error' | 'warning' | 'success' | 'info' } | null;

  setCommander: (card: ScryfallCard | null) => void;
  addCard: (card: ScryfallCard) => void;
  removeCard: (cardId: string) => void;
  clearDeck: () => void;
  clearNotification: () => void;

  getCardCount: () => number;
  getColorIdentity: () => string[];
  canAddCard: (card: ScryfallCard) => { allowed: boolean; reason?: string };
}

const useDeckStore = create<DeckState>()(
  persist(
    (set, get) => ({
      commander: null,
      cards: [],
      notification: null,

      setCommander: (card) => {
        set({ commander: card, cards: [], notification: card ? {
          message: `Commander set to ${card.name}! Color identity: ${card.color_identity.length > 0 ? card.color_identity.join('') : 'Colorless'}`,
          severity: 'success'
        } : null });
      },

      addCard: (card) => {
        const state = get();
        const check = state.canAddCard(card);
        if (!check.allowed) {
          set({ notification: { message: check.reason!, severity: 'warning' } });
          return;
        }
        set({
          cards: [...state.cards, card],
          notification: {
            message: `Added ${card.name} to deck`,
            severity: 'info'
          }
        });
      },

      removeCard: (cardId) => {
        const state = get();
        const idx = state.cards.findIndex(c => c.id === cardId);
        if (idx === -1) return;
        const removedName = state.cards[idx].name;
        const newCards = [...state.cards];
        newCards.splice(idx, 1);
        set({
          cards: newCards,
          notification: { message: `Removed ${removedName}`, severity: 'info' }
        });
      },

      clearDeck: () => {
        set({ cards: [], commander: null, notification: { message: 'Deck cleared', severity: 'info' } });
      },

      clearNotification: () => {
        set({ notification: null });
      },

      getCardCount: () => {
        const state = get();
        return state.cards.length + (state.commander ? 1 : 0);
      },

      getColorIdentity: () => {
        const state = get();
        return state.commander?.color_identity ?? [];
      },

      canAddCard: (card) => {
        const state = get();

        if (!state.commander) {
          return { allowed: false, reason: 'Select a commander first!' };
        }

        // Check total count (99 cards + 1 commander = 100)
        if (state.cards.length >= 99) {
          return { allowed: false, reason: 'Deck is full! (100/100)' };
        }

        // Singleton rule - no duplicates except basic lands
        if (!isBasicLand(card)) {
          const isDuplicate = state.cards.some(c => c.name === card.name) ||
                              state.commander.name === card.name;
          if (isDuplicate) {
            return { allowed: false, reason: `${card.name} is already in the deck! Commander is singleton format.` };
          }
        }

        // Color identity check
        const commanderColors = state.commander.color_identity;
        const cardColors = card.color_identity;
        const isColorValid = cardColors.every(c => commanderColors.includes(c));
        if (!isColorValid) {
          return {
            allowed: false,
            reason: `${card.name} has color identity [${cardColors.join('')}] outside your commander's [${commanderColors.join('')}]`
          };
        }

        return { allowed: true };
      },
    }),
    {
      name: 'mtg-deck-storage',
      partialize: (state) => ({
        commander: state.commander,
        cards: state.cards,
      }),
    }
  )
);

export default useDeckStore;
