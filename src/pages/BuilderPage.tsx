import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeckContext } from '../context/DeckContext';
import { useAuth } from '../components/auth/AuthProvider';
import { useChatLimit } from '../context/ChatLimitContext';
import { ResizablePanels } from '../components/layout/ResizablePanels';
import { ChatPanel } from '../components/chat/ChatPanel';
import { CardGrid } from '../components/cards/CardGrid';
import { CardDetailModal } from '../components/cards/CardDetailModal';
import { DeckPanel } from '../components/deck/DeckPanel';
import { LoginModal } from '../components/auth/LoginModal';
import { SignupModal } from '../components/auth/SignupModal';
import { ExportModal } from '../components/decks/ExportModal';
import { SavedDecksModal } from '../components/decks/SavedDecksModal';
import { BuilderHeader } from '../components/builder/BuilderHeader';
import { CardSearchBar } from '../components/builder/CardSearchBar';
import { MetaImportModal } from '../components/builder/MetaImportModal';
import { useChat } from '../hooks/useChat';
import { useScryfall } from '../hooks/useScryfall';
import type { ScryfallCard, Format } from '../utils/formatRules';
import { decksApi } from '../services/api';

type Modal = 'login' | 'signup' | 'export' | 'savedDecks' | 'metaImport' | null;

export function BuilderPage() {
  const { deckId } = useParams<{ deckId?: string }>();
  const navigate = useNavigate();
  const { format, addCard, getDeckSummary, mainboard, sideboard, commander, name, setCommander, loadDeck } = useDeckContext();
  const { user, getToken } = useAuth();
  const { setUsage } = useChatLimit();
  const { messages, loading: chatLoading, messagesUsedToday, messagesLimit, sendMessage } = useChat();
  const { cards, loading: cardsLoading, error: cardsError, totalCards, hasMore, loadMore, setCards, clearResults, search } = useScryfall();

  const [modal, setModal] = useState<Modal>(null);
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [, setSaveLoading] = useState(false);

  // Update chat limit context whenever usage changes
  useEffect(() => {
    if (messagesLimit > 0) {
      setUsage(messagesUsedToday, messagesLimit);
    }
  }, [messagesUsedToday, messagesLimit, setUsage]);

  // Load deck by id if provided
  useEffect(() => {
    if (!deckId) return;
    const load = async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const deck = await decksApi.get(deckId, token);
        if (deck) {
          loadDeck({
            name: deck.name,
            format: deck.format as Format,
            mainboard: (deck.mainboard as Record<string, { card: ScryfallCard; quantity: number }>) ?? {},
            sideboard: (deck.sideboard as Record<string, { card: ScryfallCard; quantity: number }>) ?? {},
            commander: (deck.commander as ScryfallCard | null) ?? null,
          });
        }
      } catch {
        // Silently fail
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

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

  const handleCardSearch = useCallback(async (query: string) => {
    if (!query) {
      clearResults();
      setHasSearched(false);
      return;
    }
    await search(query);
    setHasSearched(true);
  }, [search, clearResults]);

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
        mainboard: mainboard as never,
        sideboard: sideboard as never,
        commander: commander as never,
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
      <BuilderHeader
        onSave={handleSave}
        onExport={() => setModal('export')}
        onMyDecks={() => setModal('savedDecks')}
        onLogin={() => setModal('login')}
        onClearDeck={() => { clearResults(); setHasSearched(false); }}
        onImportMeta={() => setModal('metaImport')}
      />

      <div className="flex-1 overflow-hidden pt-14">
        <ResizablePanels
          chatPanel={
            <ChatPanel
              messages={messages}
              loading={chatLoading}
              onSend={handleChatSend}
              onCardChipClick={setSelectedCard}
            />
          }
          cardPanel={
            <>
              <CardSearchBar onSearch={handleCardSearch} loading={cardsLoading} />
              <div className="flex-1 overflow-hidden">
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
              </div>
            </>
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
      {modal === 'metaImport' && (
        <MetaImportModal
          onClose={() => setModal(null)}
          onImported={() => showToast('Deck imported!')}
        />
      )}

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

      {/* Redirect if not authed and trying to access protected features */}
      {!user && modal === null && (
        <div className="hidden" onClick={() => navigate('/')} />
      )}
    </div>
  );
}
