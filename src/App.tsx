import { useState, useCallback } from 'react';
import { DeckProvider, useDeckContext } from './context/DeckContext';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { Header } from './components/layout/Header';
import { ThreePanelLayout } from './components/layout/ThreePanelLayout';
import { ChatPanel } from './components/chat/ChatPanel';
import { CardGrid } from './components/cards/CardGrid';
import { CardDetailModal } from './components/cards/CardDetailModal';
import { DeckPanel } from './components/deck/DeckPanel';
import { LoginModal } from './components/auth/LoginModal';
import { SignupModal } from './components/auth/SignupModal';
import { ExportModal } from './components/decks/ExportModal';
import { SavedDecksModal } from './components/decks/SavedDecksModal';
import { useChat } from './hooks/useChat';
import { useScryfall } from './hooks/useScryfall';
import type { ScryfallCard, Format } from './utils/formatRules';
import { decksApi } from './services/api';

type Modal = 'login' | 'signup' | 'export' | 'savedDecks' | null;

function AppContent() {
  const { format, addCard, getDeckSummary, mainboard, sideboard, commander, name, setCommander } = useDeckContext();
  const { user, getToken } = useAuth();
  const { messages, loading: chatLoading, sendMessage } = useChat();
  const { cards, loading: cardsLoading, error: cardsError, totalCards, hasMore, loadMore, setCards, clearResults } = useScryfall();

  const [modal, setModal] = useState<Modal>(null);
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [, setSaveLoading] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChatSend = useCallback(async (message: string) => {
    const token = user ? await getToken() ?? undefined : undefined;
    const deckSummary = getDeckSummary();
    const result = await sendMessage(message, format, deckSummary, token);

    if (result.cards.length > 0) {
      setCards(result.cards);
      setHasSearched(true);
    }

    // Auto-add all cards when AI builds a full deck list
    if (result.isDeckBuild && result.cards.length > 0) {
      let addedCount = 0;
      for (const card of result.cards) {
        const qty = (card as ScryfallCard & { _deckQuantity?: number })._deckQuantity ?? 1;
        addCard(card, qty);
        addedCount += qty;
      }
      showToast(`Added ${addedCount} cards to your deck!`);
    }
  }, [format, sendMessage, getDeckSummary, user, getToken, setCards, addCard]);

  const handleCardAdd = useCallback((card: ScryfallCard, quantity = 1) => {
    addCard(card, quantity);
    showToast(`Added ${card.name}`);
  }, [addCard]);

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      const token = await getToken();
      if (!token) { setModal('login'); return; }

      const totalCount = Object.values(mainboard).reduce((s, dc) => s + dc.quantity, 0) + (commander ? 1 : 0);
      await decksApi.create({
        name,
        format,
        mainboard: mainboard as any,
        sideboard: sideboard as any,
        commander: commander as any,
        card_count: totalCount,
      }, token);
      showToast('Deck saved!');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <Header
        onSave={handleSave}
        onExport={() => setModal('export')}
        onMyDecks={() => setModal('savedDecks')}
        onLogin={() => setModal('login')}
        onClearDeck={() => { clearResults(); setHasSearched(false); }}
      />

      {/* Main content — below header */}
      <div className="flex-1 overflow-hidden pt-14">
        <ThreePanelLayout
          chatPanel={
            <ChatPanel
              messages={messages}
              loading={chatLoading}
              onSend={handleChatSend}
              onCardChipClick={setSelectedCard}
            />
          }
          cardPanel={
            <CardGrid
              cards={cards}
              loading={cardsLoading}
              error={cardsError}
              totalCards={totalCards}
              hasMore={hasMore}
              format={format as Format}
              onCardClick={setSelectedCard}
              onCardAdd={handleCardAdd}
              onLoadMore={loadMore}
              hasSearched={hasSearched}
            />
          }
          deckPanel={
            <DeckPanel onCardClick={setSelectedCard} />
          }
        />
      </div>

      {/* Card detail modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          format={format as Format}
          onClose={() => setSelectedCard(null)}
          onAddToDeck={(card, qty) => {
            // If Commander format and no commander yet, ask if this should be commander
            if (format === 'Commander' && !commander && card.type_line.toLowerCase().includes('legendary')) {
              setCommander(card);
              showToast(`${card.name} set as Commander`);
            } else {
              handleCardAdd(card, qty);
            }
            setSelectedCard(null);
          }}
        />
      )}

      {/* Auth modals */}
      {modal === 'login' && (
        <LoginModal onClose={() => setModal(null)} onSwitchToSignup={() => setModal('signup')} />
      )}
      {modal === 'signup' && (
        <SignupModal onClose={() => setModal(null)} onSwitchToLogin={() => setModal('login')} />
      )}
      {modal === 'export' && <ExportModal onClose={() => setModal(null)} />}
      {modal === 'savedDecks' && <SavedDecksModal onClose={() => setModal(null)} />}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-xl transition-all ${
          toast.type === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-zinc-800 border border-zinc-700 text-zinc-100'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DeckProvider>
        <AppContent />
      </DeckProvider>
    </AuthProvider>
  );
}
