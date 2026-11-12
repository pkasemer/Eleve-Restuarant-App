import { ActivityIndicator, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import { Glyph, type GlyphName } from './Glyph';
import { Pressy } from './Pressy';
import { Text } from './Text';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  /**
   * primary: the one main action on a screen (ink black)
   * secondary: hairline outline · ghost: text only · danger: destructive (red)
   * inverse: for use on the dark charge bar
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'inverse';
  size?: 'sm' | 'md' | 'lg';
  icon?: GlyphName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  disabled,
  fullWidth = true,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const { colors, radius, hit, space, hairline } = useTheme();

  const palette = {
    primary: { bg: colors.primary, fg: colors.onPrimary, border: 'transparent' },
    secondary: { bg: colors.surface, fg: colors.text, border: colors.borderStrong },
    ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
    danger: { bg: colors.negativeSoft, fg: colors.negative, border: 'transparent' },
    inverse: { bg: colors.surface, fg: colors.text, border: 'transparent' },
  }[variant];

  const height = { sm: hit.min, md: hit.control, lg: hit.pos }[size];
  const inactive = disabled || loading;

  return (
    <Pressy
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={[
        {
          minHeight: height,
          borderRadius: size === 'lg' ? radius.lg : radius.md,
          backgroundColor: palette.bg,
          borderWidth: hairline,
          borderColor: palette.border,
          paddingHorizontal: size === 'sm' ? space[5] : space[6],
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: space[3],
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <>
          {icon ? <Glyph name={icon} size={18} color={palette.fg} /> : null}
          <Text variant="button" style={{ color: palette.fg, fontSize: size === 'lg' ? 18 : 16 }}>
            {label}
          </Text>
        </>
      )}
    </Pressy>
  );
}
