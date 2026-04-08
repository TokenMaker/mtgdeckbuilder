import { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import type { ChatMessage as ChatMessageType } from '../../hooks/useChat';
import type { ScryfallCard } from '../../utils/formatRules';

interface ChatPanelProps {
  messages: ChatMessageType[];
  loading: boolean;
  onSend: (message: string) => void;
  onCardChipClick?: (card: ScryfallCard) => void;
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
        <Bot size={14} className="text-amber-400" />
      </div>
      <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChatPanel({ messages, loading, onSend, onCardChipClick }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-zinc-800 flex-shrink-0">
        <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Bot size={13} className="text-amber-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-zinc-200 uppercase tracking-wider" style={{ fontFamily: 'Cinzel, serif' }}>
            AI Assistant
          </p>
          <p className="text-xs text-zinc-600">Powered by Claude</p>
        </div>
      </div>

      {/* Welcome state */}
      {messages.length === 0 && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center">
          <div className="w-12 h-12 bg-amber-500/15 rounded-2xl flex items-center justify-center mb-3">
            <Bot size={22} className="text-amber-400" />
          </div>
          <h3 className="text-zinc-300 font-semibold mb-1.5 text-sm" style={{ fontFamily: 'Cinzel, serif' }}>
            Your Deck Building Guide
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-[200px]">
            Ask me to find cards, explain strategies, or help build your perfect deck.
          </p>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {messages.map(msg => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onCardChipClick={onCardChipClick}
            />
          ))}
          {loading && <TypingIndicator />}
        </div>
      )}

      {/* Loading with no messages yet */}
      {messages.length === 0 && loading && (
        <div className="flex-1 flex items-center justify-center px-3">
          <TypingIndicator />
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSend={onSend}
        loading={loading}
        hasMessages={messages.length > 0}
      />
    </div>
  );
}
