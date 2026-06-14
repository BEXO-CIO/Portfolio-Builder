/**
 * Bexo Design Tokens
 * Two palettes: light (warm cream) + dark (deep slate).
 * Each palette exposes the full set of semantic color tokens.
 */

const colors = {
  light: {
    // Backgrounds
    background: '#F7F5F0',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    muted: '#EDEBE4',
    glass: 'rgba(255,255,255,0.72)',

    // Foregrounds
    foreground: '#1C1917',
    cardForeground: '#1C1917',
    mutedForeground: '#78716C',
    text: '#1C1917',

    // Brand — deep forest green
    primary: '#0D6B5C',
    primaryForeground: '#FFFFFF',
    primaryLight: '#E6F4F1',

    // Accent — warm terracotta
    accent: '#C45C4A',
    accentForeground: '#FFFFFF',

    // Secondary
    secondary: '#EDEBE4',
    secondaryForeground: '#44403C',

    // Semantic
    success: '#16A34A',
    successLight: '#DCFCE7',
    warning: '#D97706',
    warningLight: '#FEF3C7',
    destructive: '#DC2626',
    destructiveForeground: '#FFFFFF',
    destructiveLight: '#FEE2E2',
    info: '#2563EB',
    infoLight: '#DBEAFE',

    // UI
    border: '#E7E5E0',
    input: '#E7E5E0',
    overlay: 'rgba(28,25,23,0.5)',
    tint: '#0D6B5C',

    // Gradients (start → end, used with expo-linear-gradient)
    gradientHero: ['#0D6B5C', '#1A8C79'] as [string, string],
    gradientCard: ['#F7F5F0', '#EDEBE4'] as [string, string],
    gradientAccent: ['#C45C4A', '#E07B68'] as [string, string],
  },

  dark: {
    // Backgrounds
    background: '#0F0F11',
    surface: '#1A1A1F',
    card: '#1F1F26',
    muted: '#2A2A32',
    glass: 'rgba(26,26,31,0.80)',

    // Foregrounds
    foreground: '#F2F0EB',
    cardForeground: '#F2F0EB',
    mutedForeground: '#9B9A96',
    text: '#F2F0EB',

    // Brand — vibrant green (slightly brighter for dark bg)
    primary: '#10B981',
    primaryForeground: '#FFFFFF',
    primaryLight: '#052E22',

    // Accent
    accent: '#F87171',
    accentForeground: '#FFFFFF',

    // Secondary
    secondary: '#2A2A32',
    secondaryForeground: '#C9C7C2',

    // Semantic
    success: '#34D399',
    successLight: '#052E22',
    warning: '#FBBF24',
    warningLight: '#2D1E00',
    destructive: '#F87171',
    destructiveForeground: '#FFFFFF',
    destructiveLight: '#2D0A0A',
    info: '#60A5FA',
    infoLight: '#0C1A3A',

    // UI
    border: '#2E2E38',
    input: '#2E2E38',
    overlay: 'rgba(0,0,0,0.65)',
    tint: '#10B981',

    // Gradients
    gradientHero: ['#064E3B', '#065F46'] as [string, string],
    gradientCard: ['#1A1A1F', '#1F1F26'] as [string, string],
    gradientAccent: ['#C45C4A', '#E07B68'] as [string, string],
  },

  radius: 14,
} as const;

export default colors;
