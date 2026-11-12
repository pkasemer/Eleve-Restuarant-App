import { View } from 'react-native';

import { useTheme } from '../theme';

/**
 * The Eleve mark: a bold "E" whose three arms step up in length — the letter, and "elevate".
 * Drawn with plain Views so it scales crisply. Same geometry as the generated app icons.
 */
export function Mark({ size = 40, color }: { size?: number; color?: string }) {
  const { colors } = useTheme();
  const fill = color ?? colors.text;
  const t = size * 0.2087;
  const r = size * 0.028;
  const bar = (top: number, width: number, height = t) => ({
    position: 'absolute' as const,
    left: 0,
    top: top * size,
    width: width * size,
    height,
    borderRadius: r,
    backgroundColor: fill,
  });

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Eleve"
      style={{ width: size, height: size }}>
      <View style={bar(0, 0.2087, size)} />
      <View style={bar(0, 1)} />
      <View style={bar(0.3957, 0.804)} />
      <View style={bar(0.7913, 0.609)} />
    </View>
  );
}
