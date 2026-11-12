import { View } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

export type BadgeTone = 'neutral' | 'positive' | 'negative' | 'warning' | 'info';

/** Stripe-style status pill: tinted fill, strong text, optional leading dot. */
export function Badge({
  label,
  tone = 'neutral',
  dot,
}: {
  label: string;
  tone?: BadgeTone;
  dot?: boolean;
}) {
  const { colors, radius, space } = useTheme();
  const p = {
    neutral: { bg: colors.neutralSoft, fg: colors.textSecondary },
    positive: { bg: colors.positiveSoft, fg: colors.positive },
    negative: { bg: colors.negativeSoft, fg: colors.negative },
    warning: { bg: colors.warningSoft, fg: colors.warning },
    info: { bg: colors.infoSoft, fg: colors.info },
  }[tone];

  return (
    <View
      accessible
      accessibilityLabel={label}
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[2] + 2,
        paddingHorizontal: space[3] + 1,
        paddingVertical: space[1] + 1,
        borderRadius: radius.pill,
        backgroundColor: p.bg,
      }}>
      {dot ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: p.fg }} /> : null}
      <Text variant="caption" style={{ color: p.fg, fontFamily: 'Inter_600SemiBold' }}>
        {label}
      </Text>
    </View>
  );
}
