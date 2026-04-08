import { useState, useCallback } from 'react';
import type { ScryfallCard } from '../utils/formatRules';
import { chatApi } from '../services/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  cards?: ScryfallCard[];
  action?: string;
  isDeckBuild?: boolean;
  timestamp: Date;
}

export interface ChatResult {
  cards: ScryfallCard[];
  action: string;
  isDeckBuild: boolean;
}

interface UseChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (message: string, format: string, deckSummary: string, token?: string) => Promise<ChatResult>;
  clearMessages: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    message: string,
    format: string,
    deckSummary: string,
    token?: string
  ): Promise<ChatResult> => {
    if (!message.trim()) return { cards: [], action: 'answer', isDeckBuild: false };

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    const history = messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await chatApi.send({ message, format, deckSummary, history }, token);
      const isDeckBuild = response.action === 'build_deck' && Array.isArray(response.cards) && response.cards.length > 0;

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        cards: response.cards,
        action: response.action,
        isDeckBuild,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);
      return {
        cards: response.cards || [],
        action: response.action || 'answer',
        isDeckBuild,
      };
    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorText);

      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorText}. Please check that the backend is running and your API key is configured.`,
        timestamp: new Date(),
      }]);
      return { cards: [], action: 'answer', isDeckBuild: false };
    } finally {
      setLoading(false);
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, loading, error, sendMessage, clearMessages };
}
