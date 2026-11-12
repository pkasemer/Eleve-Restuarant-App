import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { getSettings, setSetting } from '@/db/repo';
import { DEFAULT_CURRENCY, getCurrency, type Currency } from '@/lib/currency';
import { formatMoney, parseMoneyToCents } from '@/lib/money';

type CurrencyContextValue = {
  currency: Currency;
  /** Persist a new currency and update every amount in the app. */
  setCurrencyCode: (code: string) => Promise<void>;
  format: (cents: number) => string;
  parse: (input: string) => number | null;
};

const fallback: CurrencyContextValue = {
  currency: DEFAULT_CURRENCY,
  setCurrencyCode: async () => {},
  format: (c) => formatMoney(c, DEFAULT_CURRENCY),
  parse: (s) => parseMoneyToCents(s, DEFAULT_CURRENCY.decimals),
};

const CurrencyContext = createContext<CurrencyContextValue>(fallback);

/** Loads the saved currency once and shares it app-wide. Must sit under SQLiteProvider. */
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY);

  useEffect(() => {
    let cancelled = false;
    getSettings(db).then((s) => {
      if (!cancelled) setCurrency(getCurrency(s.currency));
    });
    return () => {
      cancelled = true;
    };
  }, [db]);

  const setCurrencyCode = useCallback(
    async (code: string) => {
      const next = getCurrency(code);
      await setSetting(db, 'currency', next.code);
      setCurrency(next);
    },
    [db],
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrencyCode,
      format: (cents) => formatMoney(cents, currency),
      parse: (input) => parseMoneyToCents(input, currency.decimals),
    }),
    [currency, setCurrencyCode],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
