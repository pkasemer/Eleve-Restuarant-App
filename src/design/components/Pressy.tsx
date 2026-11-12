import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';

/**
 * Pressable with Mise press feedback: a tiny scale-down and dim. Every tappable surface in the
 * system is built on this so touch response feels uniform.
 */
export function Pressy({
  style,
  scale = true,
  ...props
}: Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle>; scale?: boolean }) {
  const { motion } = useTheme();
  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        style,
        pressed && !props.disabled
          ? {
              opacity: motion.pressOpacity,
              transform: scale ? [{ scale: motion.pressScale }] : undefined,
            }
          : null,
      ]}
    />
  );
}
