export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
} as const;

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 40,
    elevation: 10,
  },
  primary: {
    shadowColor: '#0D6B5C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

export const typography = {
  // Display sizes
  displayXl: { fontFamily: 'DMSans_700Bold', fontSize: 44, lineHeight: 50 },
  display:   { fontFamily: 'DMSans_700Bold', fontSize: 32, lineHeight: 38 },
  displaySm: { fontFamily: 'DMSans_700Bold', fontSize: 26, lineHeight: 32 },

  // Headings
  h1: { fontFamily: 'DMSans_700Bold', fontSize: 28, lineHeight: 34 },
  h2: { fontFamily: 'DMSans_700Bold', fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: 'DMSans_600SemiBold', fontSize: 18, lineHeight: 24 },

  // Body
  bodyLg: { fontFamily: 'DMSans_400Regular', fontSize: 16, lineHeight: 24 },
  body:   { fontFamily: 'DMSans_400Regular', fontSize: 15, lineHeight: 22 },
  bodySm: { fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 20 },

  // UI labels
  label:   { fontFamily: 'DMSans_500Medium', fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: 'DMSans_400Regular', fontSize: 12, lineHeight: 16 },
  overline: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, lineHeight: 14, letterSpacing: 0.8 },

  // Mono
  mono:     { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, lineHeight: 18 },
  monoBold: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 13, lineHeight: 18 },
  monoLg:   { fontFamily: 'JetBrainsMono_700Bold', fontSize: 20, lineHeight: 26 },
} as const;

/** Spring animation presets for react-native-reanimated withSpring */
export const springs = {
  snappy: { stiffness: 340, damping: 28, mass: 0.8 },
  bouncy: { stiffness: 220, damping: 18, mass: 0.9 },
  smooth: { stiffness: 160, damping: 26, mass: 1.0 },
} as const;
