import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';

export type CardProps = {
  children: ReactNode;
  /** flat: hairline only · raised: hairline + whisper shadow · sunken: inset well */
  variant?: 'flat' | 'raised' | 'sunken';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, variant = 'flat', padding = 'md', style }: CardProps) {
  const { colors, radius, space, shadow, hairline } = useTheme();
  const pad = { none: 0, sm: space[4], md: space[5], lg: space[7] }[padding];
  return (
    <View
      style={[
        {
          backgroundColor: variant === 'sunken' ? colors.surfaceSunken : colors.surface,
          borderRadius: radius.lg,
          borderWidth: variant === 'sunken' ? 0 : hairline,
          borderColor: colors.border,
          padding: pad,
          overflow: 'hidden',
        },
        variant === 'raised' && shadow.sm,
        style,
      ]}>
      {children}
    </View>
  );
}
