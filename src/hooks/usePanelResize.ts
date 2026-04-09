import { useState, useCallback, useRef } from 'react';

const STORAGE_KEY = 'mtg-panel-widths';
const DEFAULT_WIDTHS = { chat: 28, card: 42, deck: 30 };
const MIN_PCT = 20;
const MAX_PCT = 60;

interface PanelWidths {
  chat: number;
  card: number;
  deck: number;
}

function loadWidths(): PanelWidths {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as PanelWidths;
      if (parsed.chat && parsed.card && parsed.deck) return parsed;
    }
  } catch {}
  return DEFAULT_WIDTHS;
}

function saveWidths(widths: PanelWidths) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widths));
  } catch {}
}

export function usePanelResize() {
  const [widths, setWidths] = useState<PanelWidths>(loadWidths);
  const draggingRef = useRef<'left' | 'right' | null>(null);
  const startXRef = useRef(0);
  const startWidthsRef = useRef<PanelWidths>(widths);

  const resetWidths = useCallback(() => {
    setWidths(DEFAULT_WIDTHS);
    saveWidths(DEFAULT_WIDTHS);
  }, []);

  const startDragLeft = useCallback((e: React.MouseEvent) => {
    draggingRef.current = 'left';
    startXRef.current = e.clientX;
    startWidthsRef.current = widths;

    const onMove = (ev: MouseEvent) => {
      if (draggingRef.current !== 'left') return;
      const totalWidth = window.innerWidth;
      const deltaPct = ((ev.clientX - startXRef.current) / totalWidth) * 100;
      const newChat = Math.max(MIN_PCT, Math.min(MAX_PCT, startWidthsRef.current.chat + deltaPct));
      const diff = newChat - startWidthsRef.current.chat;
      const newCard = Math.max(MIN_PCT, Math.min(MAX_PCT, startWidthsRef.current.card - diff));
      const newDeck = 100 - newChat - newCard;
      if (newDeck >= MIN_PCT && newDeck <= MAX_PCT) {
        const updated = { chat: newChat, card: newCard, deck: newDeck };
        setWidths(updated);
        saveWidths(updated);
      }
    };

    const onUp = () => {
      draggingRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [widths]);

  const startDragRight = useCallback((e: React.MouseEvent) => {
    draggingRef.current = 'right';
    startXRef.current = e.clientX;
    startWidthsRef.current = widths;

    const onMove = (ev: MouseEvent) => {
      if (draggingRef.current !== 'right') return;
      const totalWidth = window.innerWidth;
      const deltaPct = ((ev.clientX - startXRef.current) / totalWidth) * 100;
      const newCard = Math.max(MIN_PCT, Math.min(MAX_PCT, startWidthsRef.current.card + deltaPct));
      const diff = newCard - startWidthsRef.current.card;
      const newDeck = Math.max(MIN_PCT, Math.min(MAX_PCT, startWidthsRef.current.deck - diff));
      const newChat = 100 - newCard - newDeck;
      if (newChat >= MIN_PCT && newChat <= MAX_PCT) {
        const updated = { chat: newChat, card: newCard, deck: newDeck };
        setWidths(updated);
        saveWidths(updated);
      }
    };

    const onUp = () => {
      draggingRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [widths]);

  return { widths, resetWidths, startDragLeft, startDragRight };
}
