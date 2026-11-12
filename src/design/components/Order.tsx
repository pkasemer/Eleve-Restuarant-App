import { View } from 'react-native';

import { useTheme } from '../theme';
import { Glyph } from './Glyph';
import { Money } from './Money';
import { Pressy } from './Pressy';
import { Text } from './Text';

export type OrderCardLine = { id: string; name: string; quantity: number; totalCents: number };

/**
 * Sales made together, shown together. Header with time, short receipt code and the order total;
 * the items underneath; a footer that opens the receipt. Long-press is reserved for delete.
 */
export function OrderCard({
  time,
  code,
  itemCount,
  lines,
  totalCents,
  onPress,
  onLongPress,
}: {
  time: string;
  code: string;
  itemCount: number;
  lines: OrderCardLine[];
  totalCents: number;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const { colors, radius, space, hairline } = useTheme();
  return (
    <Pressy
      scale={false}
      accessibilityRole="button"
      accessibilityLabel={`Order ${code} at ${time}, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
      accessibilityHint="Opens the receipt. Long press to delete."
      onPress={onPress}
      onLongPress={onLongPress}
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: hairline,
        borderColor: colors.border,
        overflow: 'hidden',
      }}>
      <View style={{ padding: space[5], gap: space[4] }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: space[4] }}>
          <View style={{ gap: 2 }}>
            <Text variant="bodyStrong">{time}</Text>
            <Text variant="caption" tone="tertiary">
              #{code} · {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Text>
          </View>
          <Money cents={totalCents} size="l" />
        </View>

        <View style={{ gap: space[3] }}>
          {lines.map((l) => (
            <View key={l.id} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space[4] }}>
              <Text variant="callout" tone="secondary" style={{ flex: 1 }} numberOfLines={2}>
                {l.quantity} × {l.name}
              </Text>
              <Money cents={l.totalCents} size="s" tone="secondary" />
            </View>
          ))}
        </View>
      </View>

      <View
        style={{
          borderTopWidth: hairline,
          borderTopColor: colors.border,
          paddingHorizontal: space[5],
          paddingVertical: space[4],
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text variant="callout" style={{ color: colors.info, fontFamily: 'Inter_600SemiBold' }}>
          View receipt
        </Text>
        <Glyph name="chevron-right" size={16} color={colors.info} />
      </View>
    </Pressy>
  );
}

export type ReceiptLine = { id: string; name: string; quantity: number; unitCents: number; totalCents: number };

function DashedRule() {
  const { colors } = useTheme();
  return <View style={{ borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: colors.borderStrong }} />;
}

/** The receipt itself: paper-grey sheet, business at the top, items, a dashed tear line, total. */
export function ReceiptSheet({
  businessName,
  code,
  dateLabel,
  lines,
  totalCents,
}: {
  businessName: string;
  code: string;
  dateLabel: string;
  lines: ReceiptLine[];
  totalCents: number;
}) {
  const { colors, radius, space, hairline, shadow } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.ticket,
          borderRadius: radius.lg,
          borderWidth: hairline,
          borderColor: colors.border,
          padding: space[7],
          gap: space[6],
        },
        shadow.sm,
      ]}>
      <View style={{ alignItems: 'center', gap: space[2] }}>
        <Text variant="title2" align="center">
          {businessName}
        </Text>
        <Text variant="callout" tone="secondary">
          Receipt #{code}
        </Text>
        <Text variant="caption" tone="tertiary">
          {dateLabel}
        </Text>
      </View>

      <DashedRule />

      <View style={{ gap: space[5] }}>
        {lines.map((l) => (
          <View key={l.id} style={{ gap: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space[4] }}>
              <Text variant="bodyStrong" style={{ flex: 1 }}>
                {l.name}
              </Text>
              <Money cents={l.totalCents} size="m" />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
              <Text variant="callout" tone="secondary">
                {l.quantity} ×
              </Text>
              <Money cents={l.unitCents} size="s" tone="secondary" />
            </View>
          </View>
        ))}
      </View>

      <DashedRule />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="headline">Total</Text>
        <Money cents={totalCents} size="l" />
      </View>

      <Text variant="caption" tone="tertiary" align="center">
        Thank you!
      </Text>
    </View>
  );
}
