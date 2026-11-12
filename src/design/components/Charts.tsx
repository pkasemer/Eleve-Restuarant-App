import { View } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

export type DayDatum = { key: string; label: string; sales: number; spent: number };

/**
 * Paired daily bars: green for money in, red for money out, scaled to the busiest day.
 * Labels are dropped for long ranges so the chart never gets cramped.
 */
export function DailyBars({ data, height = 132 }: { data: DayDatum[]; height?: number }) {
  const { colors, radius, space } = useTheme();
  const max = Math.max(1, ...data.map((d) => Math.max(d.sales, d.spent)));
  const showLabels = data.length <= 10;

  return (
    <View
      accessible
      accessibilityLabel={`Daily sales and spending chart, ${data.length} days`}
      style={{ gap: space[3] }}>
      <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: data.length > 14 ? 2 : space[3] }}>
        {data.map((d) => (
          <View
            key={d.key}
            style={{ flex: 1, height: '100%', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 2 }}>
            <View
              style={{
                flex: 1,
                maxWidth: 14,
                height: `${(d.sales / max) * 100}%`,
                minHeight: d.sales > 0 ? 3 : 0,
                backgroundColor: colors.positive,
                borderTopLeftRadius: radius.sm / 2,
                borderTopRightRadius: radius.sm / 2,
              }}
            />
            <View
              style={{
                flex: 1,
                maxWidth: 14,
                height: `${(d.spent / max) * 100}%`,
                minHeight: d.spent > 0 ? 3 : 0,
                backgroundColor: colors.negative,
                borderTopLeftRadius: radius.sm / 2,
                borderTopRightRadius: radius.sm / 2,
              }}
            />
          </View>
        ))}
      </View>
      <View style={{ height: 1, backgroundColor: colors.border }} />
      {showLabels ? (
        <View style={{ flexDirection: 'row', gap: space[3] }}>
          {data.map((d) => (
            <Text key={d.key} variant="caption" tone="tertiary" align="center" style={{ flex: 1 }} numberOfLines={1}>
              {d.label}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** Thin proportion bar used inside ledger rows ("this dish is 34% of sales"). */
export function ShareBar({ fraction, color }: { fraction: number; color: string }) {
  const { colors, radius } = useTheme();
  return (
    <View style={{ height: 6, borderRadius: radius.pill, backgroundColor: colors.surfaceSunken, overflow: 'hidden' }}>
      <View
        style={{
          width: `${Math.max(2, Math.min(100, fraction * 100))}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: radius.pill,
        }}
      />
    </View>
  );
}
