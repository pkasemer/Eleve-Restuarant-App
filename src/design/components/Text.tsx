import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme } from '../theme';
import type { ColorTokens, TypeVariant } from '../tokens';

export type Tone =
  | 'default'
  | 'secondary'
  | 'tertiary'
  | 'inverse'
  | 'primary'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'info';

export function toneColor(colors: ColorTokens, tone: Tone): string {
  switch (tone) {
    case 'secondary':
      return colors.textSecondary;
    case 'tertiary':
      return colors.textTertiary;
    case 'inverse':
      return colors.textInverse;
    case 'primary':
      return colors.primary;
    case 'positive':
      return colors.positive;
    case 'negative':
      return colors.negative;
    case 'warning':
      return colors.warning;
    case 'info':
      return colors.info;
    default:
      return colors.text;
  }
}

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  tone?: Tone;
  align?: 'left' | 'center' | 'right';
};

export function Text({ variant = 'body', tone = 'default', align, style, ...props }: TextProps) {
  const { colors, type } = useTheme();
  return (
    <RNText
      {...props}
      allowFontScaling
      maxFontSizeMultiplier={1.3}
      style={[type[variant], { color: toneColor(colors, tone) }, align && { textAlign: align }, style]}
    />
  );
}
