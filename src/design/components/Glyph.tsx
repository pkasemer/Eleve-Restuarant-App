import { View, type StyleProp, type ViewStyle } from 'react-native';

export type GlyphName = 'plus' | 'minus' | 'check' | 'close' | 'chevron-right' | 'chevron-down';

/**
 * Tiny dependency-free icon set drawn with plain Views (no font/SVG/native module needed).
 * Strokes are square-ended and scale with `size` so they feel like one family.
 */
export function Glyph({
  name,
  size = 20,
  color,
  style,
}: {
  name: GlyphName;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
}) {
  const t = Math.max(2, Math.round(size / 9)); // stroke
  const box: ViewStyle = { width: size, height: size, alignItems: 'center', justifyContent: 'center' };
  const bar = (w: number, h: number, rotate = '0deg'): ViewStyle => ({
    position: 'absolute',
    width: w,
    height: h,
    borderRadius: t,
    backgroundColor: color,
    transform: [{ rotate }],
  });

  let content: React.ReactNode;
  switch (name) {
    case 'plus':
      content = (
        <>
          <View style={bar(size * 0.62, t)} />
          <View style={bar(t, size * 0.62)} />
        </>
      );
      break;
    case 'minus':
      content = <View style={bar(size * 0.62, t)} />;
      break;
    case 'close':
      content = (
        <>
          <View style={bar(size * 0.7, t, '45deg')} />
          <View style={bar(size * 0.7, t, '-45deg')} />
        </>
      );
      break;
    case 'check':
      content = (
        <View
          style={{
            width: size * 0.32,
            height: size * 0.58,
            borderRightWidth: t,
            borderBottomWidth: t,
            borderColor: color,
            transform: [{ rotate: '45deg' }, { translateY: -size * 0.04 }],
          }}
        />
      );
      break;
    case 'chevron-right':
      content = (
        <View
          style={{
            width: size * 0.42,
            height: size * 0.42,
            borderTopWidth: t,
            borderRightWidth: t,
            borderColor: color,
            transform: [{ rotate: '45deg' }, { translateX: -size * 0.06 }, { translateY: size * 0.06 }],
          }}
        />
      );
      break;
    case 'chevron-down':
      content = (
        <View
          style={{
            width: size * 0.42,
            height: size * 0.42,
            borderRightWidth: t,
            borderBottomWidth: t,
            borderColor: color,
            transform: [{ rotate: '45deg' }, { translateX: -size * 0.06 }, { translateY: -size * 0.06 }],
          }}
        />
      );
      break;
  }

  return (
    <View style={[box, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {content}
    </View>
  );
}
