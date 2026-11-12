import { Text as RNText } from 'react-native';

import { splitMoney } from '@/lib/money';
import { useCurrency } from '@/state/currency';
import { useTheme } from '../theme';
import type { TypeVariant } from '../tokens';
import { toneColor, type Tone } from './Text';

const SIZES = {
  xl: 'figureXL',
  l: 'figureL',
  m: 'figureM',
  s: 'figureS',
} as const satisfies Record<string, TypeVariant>;

/**
 * The hero of the whole system. Tabular figures, with the currency and the cents set smaller
 * and quieter (the Square POS treatment) so the whole-number part reads at a glance.
 * The currency (and whether it shows decimals at all) comes from the app-wide setting.
 */
export function Money({
  cents,
  size = 'm',
  tone = 'default',
  signed,
}: {
  cents: number;
  size?: keyof typeof SIZES;
  tone?: Tone;
  /** Prefix + for positive amounts (negatives always show −). */
  signed?: boolean;
}) {
  const { colors, type } = useTheme();
  const { currency } = useCurrency();
  const base = type[SIZES[size]];
  const { negative, whole, fraction } = splitMoney(cents, currency.decimals);
  const small = Math.round(base.fontSize * 0.58);
  const sign = negative ? '−' : signed && cents > 0 ? '+' : '';

  return (
    <RNText
      accessibilityLabel={`${sign === '−' ? 'minus ' : ''}${whole}${fraction ? `.${fraction}` : ''} ${currency.name}`}
      style={[base, { color: toneColor(colors, tone) }]}>
      {sign}
      <RNText style={{ fontSize: small, opacity: 0.7 }}>{currency.prefix}</RNText>
      {whole}
      {fraction ? <RNText style={{ fontSize: small, opacity: 0.7 }}>.{fraction}</RNText> : null}
    </RNText>
  );
}
