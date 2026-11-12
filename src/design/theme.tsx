import { DarkTheme, DefaultTheme, type Theme as NavTheme } from 'expo-router';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import {
  darkColors,
  hairline,
  hit,
  lightColors,
  motion,
  radius,
  shadow,
  space,
  tileAccents,
  type,
  type ColorTokens,
} from './tokens';

export type Scheme = 'light' | 'dark';

export type MiseTheme = {
  scheme: Scheme;
  colors: ColorTokens;
  tileAccents: readonly { bg: string; fg: string }[];
  type: typeof type;
  space: typeof space;
  radius: typeof radius;
  hit: typeof hit;
  shadow: typeof shadow;
  motion: typeof motion;
  hairline: number;
};

function build(scheme: Scheme): MiseTheme {
  return {
    scheme,
    colors: scheme === 'dark' ? darkColors : lightColors,
    tileAccents: tileAccents[scheme],
    type,
    space,
    radius,
    hit,
    shadow,
    motion,
    hairline,
  };
}

const themes: Record<Scheme, MiseTheme> = { light: build('light'), dark: build('dark') };

export function useTheme(): MiseTheme {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return themes[scheme];
}

/** React Navigation theme derived from our tokens so headers/backgrounds match the system. */
export function useNavTheme(): NavTheme {
  const theme = useTheme();
  return useMemo(() => {
    const base = theme.scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: theme.colors.primary,
        background: theme.colors.bg,
        card: theme.colors.bg,
        text: theme.colors.text,
        border: theme.colors.border,
        notification: theme.colors.negative,
      },
    };
  }, [theme]);
}

/** Deterministic accent for a label so the same dish always gets the same tile colour. */
export function accentFor(theme: MiseTheme, key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return theme.tileAccents[h % theme.tileAccents.length];
}
