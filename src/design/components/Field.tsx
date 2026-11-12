import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

export type FieldProps = TextInputProps & {
  label: string;
  helper?: string;
  error?: string;
  /** Text shown inside the field before the value, e.g. the currency symbol. */
  prefix?: string;
  suffix?: string;
};

/** Labelled input on a sunken well. Focus draws an ink ring; errors turn the ring red. */
export function Field({ label, helper, error, prefix, suffix, style, onFocus, onBlur, ...props }: FieldProps) {
  const { colors, radius, space, hit, type } = useTheme();
  const [focused, setFocused] = useState(false);

  const ring = error ? colors.negative : focused ? colors.focus : 'transparent';

  return (
    <View style={{ gap: space[2] + 2 }}>
      <Text variant="callout" tone="secondary" style={{ fontFamily: 'Inter_500Medium' }}>
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: hit.control,
          backgroundColor: colors.surfaceSunken,
          borderRadius: radius.md,
          borderWidth: 2,
          borderColor: ring,
          paddingHorizontal: space[5],
          gap: space[3],
        }}>
        {prefix ? (
          <Text variant="body" tone="tertiary">
            {prefix}
          </Text>
        ) : null}
        <TextInput
          autoCapitalize="none"
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.primary}
          accessibilityLabel={label}
          {...props}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            type.body,
            { flex: 1, color: colors.text, paddingVertical: space[4], includeFontPadding: false },
            style,
          ]}
        />
        {suffix ? (
          <Text variant="body" tone="tertiary">
            {suffix}
          </Text>
        ) : null}
      </View>
      {error || helper ? (
        <Text variant="caption" tone={error ? 'negative' : 'tertiary'}>
          {error ?? helper}
        </Text>
      ) : null}
    </View>
  );
}
