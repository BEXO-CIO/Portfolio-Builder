import { useColorScheme } from 'react-native';
import colors from '@/constants/colors';

type Palette = typeof colors.light;

/**
 * Returns the design tokens for the current color scheme.
 * Automatically switches between light and dark palettes based on system setting.
 * Includes gradient pairs and the shared `radius` token.
 */
export function useColors(): Palette & { radius: typeof colors.radius; isDark: boolean } {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const palette: Palette = isDark ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius, isDark };
}
