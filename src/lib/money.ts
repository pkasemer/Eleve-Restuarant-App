import { DEFAULT_CURRENCY, type Currency } from '@/lib/currency';

/**
 * Storage convention: every amount is an integer count of HUNDREDTHS of the currency unit,
 * whatever the currency. A currency's `decimals` (0 for UGX) only changes how amounts are
 * typed and displayed, so switching currency never needs a data migration.
 */

/** Parse user input like "12", "12.5", "1,250.75" into stored hundredths. Null if invalid. */
export function parseMoneyToCents(input: string, decimals: number = 2): number | null {
  const cleaned = input.replace(/,/g, '').trim();
  if (!/^\d*\.?\d+$|^\d+\.$/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;
  return decimals === 0 ? Math.round(value) * 100 : Math.round(value * 100);
}

/** Split an amount into display parts. `fraction` is empty for currencies without decimals. */
export function splitMoney(cents: number, decimals: number = 2) {
  const negative = cents < 0;
  const abs = Math.abs(Math.round(cents));
  const units = decimals === 0 ? Math.round(abs / 100) : Math.floor(abs / 100);
  return {
    negative,
    whole: units.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    fraction: decimals === 0 ? '' : (abs % 100).toString().padStart(2, '0'),
  };
}

export function formatMoney(cents: number, currency: Currency = DEFAULT_CURRENCY): string {
  const { negative, whole, fraction } = splitMoney(cents, currency.decimals);
  return `${negative ? '−' : ''}${currency.prefix}${whole}${fraction ? `.${fraction}` : ''}`;
}

/** Plain number string for CSV export, honouring the currency's decimals. */
export function toPlainAmount(cents: number, currency: Currency = DEFAULT_CURRENCY): string {
  return currency.decimals === 0 ? String(Math.round(cents / 100)) : (cents / 100).toFixed(2);
}
