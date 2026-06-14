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
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
} as const;

export const shadow = {
  sm: {
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 4,
  },
} as const;

export const typography = {
  display: { fontFamily: 'DMSans_700Bold', fontSize: 32, lineHeight: 38 },
  h1: { fontFamily: 'DMSans_700Bold', fontSize: 28, lineHeight: 34 },
  h2: { fontFamily: 'DMSans_700Bold', fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: 'DMSans_600SemiBold', fontSize: 18, lineHeight: 24 },
  bodyLg: { fontFamily: 'DMSans_400Regular', fontSize: 16, lineHeight: 24 },
  body: { fontFamily: 'DMSans_400Regular', fontSize: 15, lineHeight: 22 },
  bodySm: { fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 20 },
  label: { fontFamily: 'DMSans_500Medium', fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: 'DMSans_400Regular', fontSize: 12, lineHeight: 16 },
  mono: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13, lineHeight: 18 },
  monoBold: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 13, lineHeight: 18 },
} as const;
