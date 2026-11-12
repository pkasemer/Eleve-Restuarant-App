import { View } from 'react-native';

import { useTheme } from '../theme';
import { Money } from './Money';
import { Text } from './Text';

/**
 * "Pulse" — Eleve's signature element. A single bar that splits the period between money in
 * (green) and money out (red) so owners see the day's health before they read a number.
 */
export function PulseBar({ sales, spent }: { sales: number; spent: number }) {
  const { colors, radius } = useTheme();
  const total = sales + spent;
  const salesFlex = total === 0 ? 0 : sales / total;
  return (
    <View
      accessible
      accessibilityLabel={
        total === 0
          ? 'No activity yet'
          : `${Math.round(salesFlex * 100)} percent money in, ${Math.round((1 - salesFlex) * 100)} percent money out`
      }
      style={{
        flexDirection: 'row',
        height: 10,
        borderRadius: radius.pill,
        overflow: 'hidden',
        backgroundColor: colors.surfaceSunken,
        gap: 2,
      }}>
      {total > 0 && sales > 0 ? <View style={{ flex: salesFlex, backgroundColor: colors.positive }} /> : null}
      {total > 0 && spent > 0 ? <View style={{ flex: 1 - salesFlex, backgroundColor: colors.negative }} /> : null}
    </View>
  );
}

/** Hero summary: net figure, the pulse bar, and the in/out breakdown. */
export function PulseCard({
  net,
  sales,
  spent,
  label = 'Net today',
}: {
  net: number;
  sales: number;
  spent: number;
  label?: string;
}) {
  const { colors, space } = useTheme();
  return (
    <View style={{ gap: space[5] }}>
      <View style={{ gap: space[2] }}>
        <Text variant="overline" tone="tertiary">
          {label}
        </Text>
        <Money cents={net} size="xl" tone={net < 0 ? 'negative' : 'default'} />
      </View>

      <PulseBar sales={sales} spent={spent} />

      <View style={{ flexDirection: 'row', gap: space[5] }}>
        <Leg color={colors.positive} label="Sales" cents={sales} />
        <Leg color={colors.negative} label="Spent" cents={spent} />
      </View>
    </View>
  );
}

function Leg({ color, label, cents }: { color: string; label: string; cents: number }) {
  const { space } = useTheme();
  return (
    <View style={{ flex: 1, gap: space[2] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
        <Text variant="callout" tone="secondary">
          {label}
        </Text>
      </View>
      <Money cents={cents} size="l" />
    </View>
  );
}
