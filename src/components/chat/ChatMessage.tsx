import { Bot, User } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ChatMessage as ChatMessageType } from '../../hooks/useChat';
import type { ScryfallCard } from '../../utils/formatRules';

interface ChatMessageProps {
  message: ChatMessageType;
  onCardChipClick?: (card: ScryfallCard) => void;
}

function renderMessageContent(content: string, cards?: ScryfallCard[], onCardChipClick?: (c: ScryfallCard) => void) {
  if (!cards || cards.length === 0) {
    return <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>;
  }

  const parts: ReactNode[] = [];
  let remaining = content;
  let key = 0;

  for (const card of cards) {
    const idx = remaining.toLowerCase().indexOf(card.name.toLowerCase());
    if (idx !== -1) {
      if (idx > 0) parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
      parts.push(
        <button
          key={key++}
          onClick={() => onCardChipClick?.(card)}
          className="inline-flex items-center bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs px-2 py-0.5 rounded-full mx-0.5 transition-colors font-medium"
        >
          {card.name}
        </button>
      );
      remaining = remaining.slice(idx + card.name.length);
    }
  }

  if (remaining) parts.push(<span key={key++}>{remaining}</span>);
  if (parts.length === 0) return <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>;
  return <p className="text-sm leading-relaxed">{parts}</p>;
}

export function ChatMessage({ message, onCardChipClick }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
        isUser ? 'bg-amber-600' : 'bg-zinc-700'
      }`}>
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-amber-400" />}
      </div>

      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
        isUser
          ? 'bg-amber-600 text-white rounded-tr-sm'
          : 'bg-zinc-800 text-zinc-100 rounded-tl-sm border border-zinc-700'
      }`}>
        {renderMessageContent(message.content, message.cards, onCardChipClick)}

        {message.cards && message.cards.length > 0 && (
          <p className="text-xs mt-1.5 opacity-60">
            {message.cards.length} card{message.cards.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>
    </div>
  );
}
