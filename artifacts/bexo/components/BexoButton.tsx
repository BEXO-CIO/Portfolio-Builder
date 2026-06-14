import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useColors } from '@/hooks/useColors';
import { typography, radius } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'google';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  iconRight?: keyof typeof Feather.glyphMap;
  fullWidth?: boolean;
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function BexoButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  fullWidth = true,
}: Props) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { stiffness: 400, damping: 25 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { stiffness: 400, damping: 25 });
  };

  const isDisabled = disabled || loading;

  const bgColor = () => {
    if (isDisabled) return colors.border;
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.surface;
      case 'ghost': return 'transparent';
      case 'destructive': return colors.destructive;
      case 'google': return '#FFFFFF';
    }
  };

  const textColor = () => {
    if (isDisabled) return colors.mutedForeground;
    switch (variant) {
      case 'primary': return colors.primaryForeground;
      case 'secondary': return colors.foreground;
      case 'ghost': return colors.primary;
      case 'destructive': return colors.destructiveForeground;
      case 'google': return '#1C1917';
    }
  };

  const borderColor = variant === 'secondary' || variant === 'google' ? colors.border : 'transparent';

  return (
    <AnimatedTouchable
      style={[
        animStyle,
        styles.base,
        {
          backgroundColor: bgColor(),
          borderColor,
          borderWidth: variant === 'secondary' ? 1.5 : 0,
          borderRadius: radius.md,
          alignSelf: fullWidth ? 'stretch' : 'center',
        },
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={0.9}
    >
      {loading ? (
        <ActivityIndicator color={textColor()} size="small" />
      ) : (
        <View style={styles.row}>
          {variant === 'google' ? (
            <View style={styles.googleGContainer}>
              <Text style={styles.googleG}>G</Text>
            </View>
          ) : icon ? (
            <Feather name={icon} size={18} color={textColor()} style={styles.iconLeft} />
          ) : null}
          <Text style={[typography.bodyLg, styles.label, { color: textColor() }]}>
            {label}
          </Text>
          {iconRight ? (
            <Feather name={iconRight} size={18} color={textColor()} style={styles.iconRight} />
          ) : null}
        </View>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { fontFamily: 'DMSans_600SemiBold' },
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },
  googleGContainer: {
    marginRight: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6', // light gray
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleG: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#4285F4',
  },
});
