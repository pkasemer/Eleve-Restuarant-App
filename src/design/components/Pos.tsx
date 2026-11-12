import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCurrency } from '@/state/currency';
import { accentFor, useTheme } from '../theme';
import { Button } from './Button';
import { Glyph } from './Glyph';
import { Money } from './Money';
import { Pressy } from './Pressy';
import { Text } from './Text';

/* -------------------------------- ItemTile -------------------------------- */

/**
 * Menu tile for the Sell grid (Square-style: big, tappable, scannable). A monogram in the
 * dish's own accent colour, the name, and the price. When it's on the ticket it earns an ink
 * ring and a quantity badge so the order is readable without leaving the grid.
 */
export function ItemTile({
  name,
  priceCents,
  quantity = 0,
  onPress,
  onLongPress,
}: {
  name: string;
  priceCents: number;
  quantity?: number;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const theme = useTheme();
  const { format } = useCurrency();
  const { colors, radius, space, hit, hairline, shadow } = theme;
  const accent = accentFor(theme, name);
  const active = quantity > 0;

  return (
    <Pressy
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${format(priceCents)}${active ? `, ${quantity} on ticket` : ''}`}
      accessibilityHint="Adds one to the ticket"
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        {
          flex: 1,
          minHeight: hit.pos + 44,
          borderRadius: radius.lg,
          backgroundColor: colors.surface,
          borderWidth: active ? 2 : hairline,
          borderColor: active ? colors.primary : colors.border,
          padding: space[4],
          justifyContent: 'space-between',
          gap: space[3],
        },
        shadow.sm,
      ]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: accent.bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text variant="headline" style={{ color: accent.fg }}>
            {name.trim().charAt(0).toUpperCase() || '•'}
          </Text>
        </View>
        {active ? (
          <View
            style={{
              minWidth: 28,
              height: 28,
              borderRadius: 14,
              paddingHorizontal: 8,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text variant="figureS" style={{ color: colors.onPrimary, fontFamily: 'Inter_700Bold' }}>
              {quantity}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={{ gap: 2 }}>
        <Text variant="bodyStrong" numberOfLines={2}>
          {name}
        </Text>
        <Money cents={priceCents} size="s" tone="secondary" />
      </View>
    </Pressy>
  );
}

/* --------------------------------- Stepper -------------------------------- */

export function Stepper({
  value,
  onChange,
  min = 0,
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  label: string;
}) {
  const { colors, radius, space, hit, hairline } = useTheme();
  const btn = (name: 'plus' | 'minus', delta: number, disabled: boolean) => (
    <Pressy
      accessibilityRole="button"
      accessibilityLabel={`${delta > 0 ? 'Increase' : 'Decrease'} ${label}`}
      disabled={disabled}
      hitSlop={4}
      onPress={() => onChange(value + delta)}
      style={{
        width: hit.min,
        height: hit.min,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderWidth: hairline,
        borderColor: colors.borderStrong,
        opacity: disabled ? 0.35 : 1,
      }}>
      <Glyph name={name} size={18} color={colors.text} />
    </Pressy>
  );

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ now: value }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
      {btn('minus', -1, value <= min)}
      <Text variant="figureM" align="center" style={{ minWidth: 28 }}>
        {value}
      </Text>
      {btn('plus', 1, false)}
    </View>
  );
}

/* --------------------------------- Keypad --------------------------------- */

export type KeypadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '.' | 'back';

const KEY_ROWS: KeypadKey[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'back'],
];

/**
 * Apply a key press to an amount string, capping decimals (0 for UGX → the "." key does
 * nothing) and 9 integer digits.
 */
export function applyKey(current: string, key: KeypadKey, decimals: number = 2): string {
  if (key === 'back') return current.slice(0, -1);
  if (key === '.') {
    if (decimals === 0 || current.includes('.')) return current;
    return current === '' ? '0.' : current + '.';
  }
  const [whole, frac] = current.split('.');
  if (frac !== undefined && frac.length >= decimals) return current;
  if (frac === undefined && whole.length >= 9) return current;
  if (current === '0') return key; // no leading zeros
  return current + key;
}

/** Big numeric pad for entering prices at the counter. Pass `decimals={0}` to hide the dot. */
export function Keypad({ onKey, decimals = 2 }: { onKey: (key: KeypadKey) => void; decimals?: number }) {
  const { colors, radius, space, hit } = useTheme();
  return (
    <View style={{ gap: space[3] }}>
      {KEY_ROWS.map((row, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: space[3] }}>
          {row.map((k) =>
            k === '.' && decimals === 0 ? (
              <View key={k} style={{ flex: 1, height: hit.pos }} />
            ) : (
            <Pressy
              key={k}
              accessibilityRole="button"
              accessibilityLabel={k === 'back' ? 'Delete' : k === '.' ? 'Decimal point' : k}
              onPress={() => onKey(k)}
              style={{
                flex: 1,
                height: hit.pos,
                borderRadius: radius.md,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {k === 'back' ? (
                <Glyph name="close" size={20} color={colors.textSecondary} />
              ) : (
                <Text variant="figureL">{k}</Text>
              )}
            </Pressy>
            ),
          )}
        </View>
      ))}
    </View>
  );
}

/* ------------------------------- TicketCard ------------------------------- */

/**
 * The open order. Light-grey "paper" with side notches and a perforated tear line above the total,
 * so adding to a sale feels like writing a ticket rather than filling in a form.
 */
export function TicketCard({
  title,
  count,
  children,
  totalLabel,
  totalCents,
}: {
  title: string;
  count: number;
  children: ReactNode;
  totalLabel: string;
  totalCents: number;
}) {
  const { colors, radius, space, shadow, hairline } = useTheme();
  const notch = 18;
  return (
    <View
      style={[
        {
          backgroundColor: colors.ticket,
          borderRadius: radius.lg,
          borderWidth: hairline,
          borderColor: colors.border,
        },
        shadow.sm,
      ]}>
      <View style={{ padding: space[5], gap: space[3], flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="overline" tone="tertiary">
          {title}
        </Text>
        <Text variant="overline" tone="tertiary">
          {count} {count === 1 ? 'item' : 'items'}
        </Text>
      </View>

      <View style={{ paddingHorizontal: space[5], paddingBottom: space[4] }}>{children}</View>

      {/* perforation */}
      <View style={{ height: notch, justifyContent: 'center' }}>
        <View
          style={{
            marginHorizontal: space[5] + notch / 2,
            borderTopWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: colors.borderStrong,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: -notch / 2 - 1,
            width: notch,
            height: notch,
            borderRadius: notch / 2,
            backgroundColor: colors.bg,
            borderWidth: hairline,
            borderColor: colors.border,
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: -notch / 2 - 1,
            width: notch,
            height: notch,
            borderRadius: notch / 2,
            backgroundColor: colors.bg,
            borderWidth: hairline,
            borderColor: colors.border,
          }}
        />
      </View>

      <View
        style={{
          padding: space[5],
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Text variant="headline">{totalLabel}</Text>
        <Money cents={totalCents} size="l" />
      </View>
    </View>
  );
}

/** One line on a ticket: name + unit price on the left, stepper + line total on the right. */
export function TicketLine({
  name,
  unitCents,
  quantity,
  onChange,
}: {
  name: string;
  unitCents: number;
  quantity: number;
  onChange: (qty: number) => void;
}) {
  const { colors, space, hairline } = useTheme();
  return (
    <View
      style={{
        paddingVertical: space[4],
        gap: space[3],
        borderBottomWidth: hairline,
        borderBottomColor: colors.border,
      }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space[4] }}>
        <Text variant="bodyStrong" style={{ flex: 1 }} numberOfLines={2}>
          {name}
        </Text>
        <Money cents={unitCents * quantity} size="m" />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="callout" tone="secondary">
          <Money cents={unitCents} size="s" tone="secondary" /> each
        </Text>
        <Stepper value={quantity} onChange={onChange} label={name} />
      </View>
    </View>
  );
}

/* -------------------------------- ActionBar ------------------------------- */

/**
 * The persistent charge bar (Square-style). High-contrast ink slab pinned above the tabs:
 * what you're about to record on the left, the one action on the right.
 */
export function ActionBar({
  caption,
  amountCents,
  actionLabel,
  onAction,
  disabled,
  loading,
}: {
  caption: string;
  amountCents: number;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const { colors, radius, space, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surfaceInverse,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
          paddingHorizontal: space[5],
          paddingTop: space[5],
          paddingBottom: Math.max(insets.bottom, space[5]),
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[5],
        },
        shadow.lg,
      ]}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="caption" style={{ color: colors.textInverse, opacity: 0.7 }}>
          {caption}
        </Text>
        <Money cents={amountCents} size="l" tone="inverse" />
      </View>
      <View style={{ flex: 1 }}>
        <Button label={actionLabel} onPress={onAction} size="lg" variant="inverse" disabled={disabled} loading={loading} />
      </View>
    </View>
  );
}
