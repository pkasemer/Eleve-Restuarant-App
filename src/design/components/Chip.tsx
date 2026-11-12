import { View } from 'react-native';

import { useTheme } from '../theme';
import { Pressy } from './Pressy';
import { Text } from './Text';

/** Selectable pill — categories, filters. */
export function Chip({
  label,
  selected,
  onPress,
  dotColor,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  dotColor?: string;
}) {
  const { colors, radius, space, hit, hairline } = useTheme();
  return (
    <Pressy
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={{
        minHeight: hit.min,
        paddingHorizontal: space[5],
        borderRadius: radius.pill,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[3],
        backgroundColor: selected ? colors.primary : colors.surface,
        borderWidth: hairline,
        borderColor: selected ? colors.primary : colors.borderStrong,
      }}>
      {dotColor ? (
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: selected ? colors.onPrimary : dotColor }} />
      ) : null}
      <Text variant="callout" style={{ color: selected ? colors.onPrimary : colors.text, fontFamily: 'Inter_500Medium' }}>
        {label}
      </Text>
    </Pressy>
  );
}
