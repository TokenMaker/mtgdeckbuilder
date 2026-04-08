import { useState, useCallback } from 'react';
import type { ScryfallCard } from '../utils/formatRules';
import { chatApi } from '../services/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  cards?: ScryfallCard[];
  scryfallQuery?: string | null;
  action?: string;
  suggestedQuantity?: number | null;
  suggestedQuantityReasoning?: string | null;
  timestamp: Date;
}

interface UseChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (
    message: string,
    format: string,
    deckSummary: string,
    token?: string
  ) => Promise<ScryfallCard[]>;
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
  ): Promise<ScryfallCard[]> => {
    if (!message.trim()) return [];

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    // Build history from existing messages (last 10)
    const history = messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await chatApi.send({ message, format, deckSummary, history }, token);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        cards: response.cards,
        scryfallQuery: response.scryfallQuery,
        action: response.action,
        suggestedQuantity: response.suggestedQuantity,
        suggestedQuantityReasoning: response.suggestedQuantityReasoning,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);
      return response.cards || [];
    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorText);

      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorText}. Please check that the backend is running and your API key is configured.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
      return [];
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
