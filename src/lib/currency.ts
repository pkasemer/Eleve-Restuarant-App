export type Currency = {
  /** ISO 4217 code, stored in settings and sent to the sync server. */
  code: string;
  name: string;
  /** What is shown before an amount ("UGX ", "$"). */
  prefix: string;
  /** Digits after the decimal point that people actually use. UGX and RWF have none. */
  decimals: 0 | 2;
};

export const DEFAULT_CURRENCY_CODE = 'UGX';

export const CURRENCIES: readonly Currency[] = [
  { code: 'UGX', name: 'Ugandan shilling', prefix: 'UGX ', decimals: 0 },
  { code: 'KES', name: 'Kenyan shilling', prefix: 'KSh ', decimals: 2 },
  { code: 'TZS', name: 'Tanzanian shilling', prefix: 'TSh ', decimals: 2 },
  { code: 'RWF', name: 'Rwandan franc', prefix: 'RF ', decimals: 0 },
  { code: 'ETB', name: 'Ethiopian birr', prefix: 'ETB ', decimals: 2 },
  { code: 'NGN', name: 'Nigerian naira', prefix: 'NGN ', decimals: 2 },
  { code: 'GHS', name: 'Ghanaian cedi', prefix: 'GHS ', decimals: 2 },
  { code: 'ZAR', name: 'South African rand', prefix: 'R ', decimals: 2 },
  { code: 'USD', name: 'US dollar', prefix: '$', decimals: 2 },
  { code: 'EUR', name: 'Euro', prefix: '€', decimals: 2 },
  { code: 'GBP', name: 'British pound', prefix: '£', decimals: 2 },
  { code: 'INR', name: 'Indian rupee', prefix: '₹', decimals: 2 },
];

export const DEFAULT_CURRENCY: Currency = CURRENCIES[0];

/**
 * Resolve a stored value to a known currency. Anything unrecognised (including the old
 * free-text symbols like "$" from earlier versions) falls back to the default, UGX.
 */
export function getCurrency(code: string | null | undefined): Currency {
  const wanted = (code ?? '').trim().toUpperCase();
  return CURRENCIES.find((c) => c.code === wanted) ?? DEFAULT_CURRENCY;
}
