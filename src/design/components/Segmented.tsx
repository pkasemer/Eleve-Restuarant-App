import { View } from 'react-native';

import { useTheme } from '../theme';
import { Pressy } from './Pressy';
import { Text } from './Text';

export type SegmentOption<K extends string> = { key: K; label: string };

/** Range / mode switcher. A sunken track with a raised thumb under the selected option. */
export function Segmented<K extends string>({
  options,
  value,
  onChange,
}: {
  options: SegmentOption<K>[];
  value: K;
  onChange: (key: K) => void;
}) {
  const { colors, radius, space, shadow, hit } = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surfaceSunken,
        borderRadius: radius.md,
        padding: space[2],
        gap: space[2],
      }}>
      {options.map((o) => {
        const selected = o.key === value;
        return (
          <Pressy
            key={o.key}
            scale={false}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.key)}
            style={[
              {
                flex: 1,
                minHeight: hit.min - 4,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.sm + 1,
                backgroundColor: selected ? colors.surface : 'transparent',
              },
              selected && shadow.sm,
            ]}>
            <Text variant="callout" tone={selected ? 'default' : 'secondary'} style={{ fontFamily: 'Inter_600SemiBold' }}>
              {o.label}
            </Text>
          </Pressy>
        );
      })}
    </View>
  );
}
