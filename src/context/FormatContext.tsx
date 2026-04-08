import React, { createContext, useContext, useState } from 'react';
import type { Format } from '../utils/formatRules';
import { FORMAT_RULES, FORMATS } from '../utils/formatRules';

interface FormatContextValue {
  format: Format;
  setFormat: (format: Format) => void;
  rules: typeof FORMAT_RULES[Format];
  formats: Format[];
}

const FormatContext = createContext<FormatContextValue | null>(null);

export function FormatProvider({ children }: { children: React.ReactNode }) {
  const [format, setFormat] = useState<Format>('Standard');

  return (
    <FormatContext.Provider value={{
      format,
      setFormat,
      rules: FORMAT_RULES[format],
      formats: FORMATS,
    }}>
      {children}
    </FormatContext.Provider>
  );
}

export function useFormat() {
  const ctx = useContext(FormatContext);
  if (!ctx) throw new Error('useFormat must be used within FormatProvider');
  return ctx;
}
