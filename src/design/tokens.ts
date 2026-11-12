/**
 * MISE — the Eleve design system.
 *
 * "Mise en place": everything in its place before service. Borrowing Stripe's calm precision
 * (hairlines, soft depth, status pills, tabular figures) and Square POS's counter-speed
 * (big touch targets, tile grid, a persistent charge bar), wrapped in Uber's stark colour
 * language: black and white do the talking, greys carry structure, and colour is reserved for
 * meaning.
 *
 * Rules of the road
 *  - Never use raw hex or numbers in screens — use tokens.
 *  - Money is the hero: tabular figures, big, with a quiet currency + decimals.
 *  - Black is the brand and the primary action. Colour only ever means something:
 *      green = money in / success · red = money out / destructive
 *      amber = attention / pending · blue = links and information.
 */

/* ------------------------------- Color ------------------------------- */

export const lightColors = {
  // Surfaces
  bg: '#FFFFFF', // the canvas
  surface: '#FFFFFF', // cards, sheets
  surfaceSunken: '#F3F3F3', // inputs, wells, segmented tracks
  surfaceInverse: '#000000', // charge bar, toasts (high contrast)
  ticket: '#F6F6F6', // the order "ticket" paper

  // Ink
  text: '#000000',
  textSecondary: '#545454',
  textTertiary: '#6B6B6B',
  textInverse: '#FFFFFF',

  // Lines
  border: '#E2E2E2', // hairline
  borderStrong: '#AFAFAF',
  focus: '#000000',

  // Brand — Ink. Primary actions are black, exactly like Uber.
  primary: '#000000',
  primaryPressed: '#333333',
  primarySoft: '#EEEEEE',
  onPrimary: '#FFFFFF',

  // Semantic money + status
  positive: '#048848', // money in / synced
  positiveSoft: '#EAF6ED',
  negative: '#E11900', // money out / destructive
  negativeSoft: '#FFF0EE',
  warning: '#996F00', // pending / attention (amber, text-safe)
  warningSoft: '#FFF2D9',
  info: '#276EF1', // accent blue: links, information
  infoSoft: '#EFF3FE',
  neutralSoft: '#EEEEEE',

  scrim: 'rgba(0, 0, 0, 0.5)',
} as const;

export type ColorTokens = { [K in keyof typeof lightColors]: string };

export const darkColors: ColorTokens = {
  bg: '#000000',
  surface: '#141414',
  surfaceSunken: '#1F1F1F',
  surfaceInverse: '#FFFFFF',
  ticket: '#1F1F1F',

  text: '#FFFFFF',
  textSecondary: '#AFAFAF',
  textTertiary: '#8A8A8A',
  textInverse: '#000000',

  border: '#2E2E2E',
  borderStrong: '#545454',
  focus: '#FFFFFF',

  primary: '#FFFFFF',
  primaryPressed: '#CBCBCB',
  primarySoft: '#2A2A2A',
  onPrimary: '#000000',

  positive: '#06C167',
  positiveSoft: '#0E2A1D',
  negative: '#FF6B5B',
  negativeSoft: '#331511',
  warning: '#FFC043',
  warningSoft: '#33260A',
  info: '#5B91F4',
  infoSoft: '#14213D',
  neutralSoft: '#262626',

  scrim: 'rgba(0, 0, 0, 0.65)',
};

/** Accents for menu tiles / categories. Deterministically picked from the item name. */
export const tileAccents = {
  light: [
    { bg: '#EAF6ED', fg: '#048848' },
    { bg: '#FFF0EE', fg: '#E11900' },
    { bg: '#FFF2D9', fg: '#996F00' },
    { bg: '#EFF3FE', fg: '#276EF1' },
    { bg: '#F1EEFB', fg: '#7356BF' },
    { bg: '#EEEEEE', fg: '#333333' },
  ],
  dark: [
    { bg: '#0E2A1D', fg: '#06C167' },
    { bg: '#331511', fg: '#FF6B5B' },
    { bg: '#33260A', fg: '#FFC043' },
    { bg: '#14213D', fg: '#5B91F4' },
    { bg: '#25193F', fg: '#A68BE8' },
    { bg: '#262626', fg: '#CBCBCB' },
  ],
} as const;

/* ---------------------------- Typography ---------------------------- */

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

type TypeStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: 'uppercase';
  fontVariant?: ('tabular-nums' | 'lining-nums')[];
};

const tnum = ['tabular-nums' as const];

export const type = {
  // Figures — money and counts. Always tabular so columns of prices line up.
  figureXL: { fontFamily: fontFamily.bold, fontSize: 44, lineHeight: 50, letterSpacing: -1, fontVariant: tnum },
  figureL: { fontFamily: fontFamily.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.5, fontVariant: tnum },
  figureM: { fontFamily: fontFamily.semibold, fontSize: 17, lineHeight: 22, letterSpacing: -0.2, fontVariant: tnum },
  figureS: { fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 18, fontVariant: tnum },

  // Text
  title1: { fontFamily: fontFamily.bold, fontSize: 30, lineHeight: 36, letterSpacing: -0.6 },
  title2: { fontFamily: fontFamily.semibold, fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  headline: { fontFamily: fontFamily.semibold, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  body: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 22 },
  bodyStrong: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 22 },
  callout: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fontFamily.regular, fontSize: 12.5, lineHeight: 17 },
  overline: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  button: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 20, letterSpacing: -0.1 },
} satisfies Record<string, TypeStyle>;

export type TypeVariant = keyof typeof type;

/* ------------------------ Space, shape, depth ------------------------ */

/** 4pt grid. */
export const space = {
  0: 0,
  1: 2,
  2: 4,
  3: 8,
  4: 12,
  5: 16,
  6: 20,
  7: 24,
  8: 32,
  9: 40,
  10: 56,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Minimum interactive sizes. POS taps happen fast, one-handed, sometimes with wet hands. */
export const hit = {
  min: 44, // accessibility floor
  control: 52, // default buttons / inputs
  pos: 64, // tiles and the charge button
} as const;

/** Neutral, low-opacity depth. Stripe-style: border does the work, shadow only whispers. */
export const shadow = {
  none: {},
  sm: {
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
} as const;

export const hairline = 1;

/* ------------------------------ Motion ------------------------------ */

export const motion = {
  fast: 120, // press feedback
  base: 200, // state changes
  slow: 320, // entrances
  pressScale: 0.97,
  pressOpacity: 0.9,
} as const;
