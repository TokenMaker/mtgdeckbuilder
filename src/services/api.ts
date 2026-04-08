const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || error.details || `API error: ${response.status}`);
  }

  if (response.status === 204) return null as T;
  return response.json();
}

// Chat
export interface ChatRequest {
  message: string;
  format: string;
  deckSummary: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface ChatResponse {
  message: string;
  scryfallQuery: string | null;
  action: string;
  suggestedQuantity: number | null;
  suggestedQuantityReasoning: string | null;
  cards: import('../utils/formatRules').ScryfallCard[];
}

export const chatApi = {
  send: (data: ChatRequest, token?: string) =>
    request<ChatResponse>('/api/chat', { method: 'POST', body: data, token }),
};

// Scryfall
export const scryfallApi = {
  search: (query: string, page = 1) =>
    request<{ data: import('../utils/formatRules').ScryfallCard[]; total_cards: number; has_more: boolean }>(
      `/api/scryfall/search?q=${encodeURIComponent(query)}&page=${page}`
    ),
  getByName: (name: string) =>
    request<import('../utils/formatRules').ScryfallCard>(`/api/scryfall/named?name=${encodeURIComponent(name)}`),
  getById: (id: string) =>
    request<import('../utils/formatRules').ScryfallCard>(`/api/scryfall/cards/${id}`),
  random: (query?: string) =>
    request<import('../utils/formatRules').ScryfallCard>(`/api/scryfall/random${query ? `?q=${encodeURIComponent(query)}` : ''}`),
};

// Decks
export interface DeckRecord {
  id: string;
  name: string;
  format: string;
  card_count: number;
  updated_at: string;
  commander_name?: string;
  mainboard?: Record<string, unknown>;
  sideboard?: Record<string, unknown>;
  commander?: unknown;
  notes?: string;
}

export const decksApi = {
  list: (token: string) =>
    request<DeckRecord[]>('/api/decks', { token }),
  get: (id: string, token: string) =>
    request<DeckRecord>(`/api/decks/${id}`, { token }),
  create: (deck: Partial<DeckRecord>, token: string) =>
    request<DeckRecord>('/api/decks', { method: 'POST', body: deck, token }),
  update: (id: string, deck: Partial<DeckRecord>, token: string) =>
    request<DeckRecord>(`/api/decks/${id}`, { method: 'PUT', body: deck, token }),
  delete: (id: string, token: string) =>
    request<null>(`/api/decks/${id}`, { method: 'DELETE', token }),
};

export async function checkBackendHealth(): Promise<{ status: string; services: Record<string, boolean> }> {
  return request('/health');
}
