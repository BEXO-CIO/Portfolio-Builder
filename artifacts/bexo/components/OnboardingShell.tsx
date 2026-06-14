import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography } from '@/constants/theme';

const TOTAL_STEPS = 11;

const STEP_LABELS: Record<string, number> = {
  email: 1,
  photo: 2,
  handle: 3,
  resume: 4,
  manual: 4,
  manual_review: 4,
  cards: 5,
  about: 6,
  dob: 7,
  theme: 8,
  font: 9,
  preference: 10,
  generating: 11,
};

type Props = {
  step: string;
  onBack?: () => void;
  children: React.ReactNode;
};

export function OnboardingShell({ step, onBack, children }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const currentStep = STEP_LABELS[step] ?? 1;
  const progress = currentStep / TOTAL_STEPS;

  const barStyle = useAnimatedStyle(() => ({
    width: withSpring(`${progress * 100}%` as unknown as number, {
      stiffness: 210,
      damping: 22,
      mass: 0.85,
    }),
  }));

  const topPad = Platform.OS === 'web' ? 67 : insets.top + 8;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad }]}>
        <View style={[styles.trackBg, { backgroundColor: colors.border }]}>
          <Animated.View style={[styles.trackFill, barStyle, { backgroundColor: colors.primary }]} />
        </View>
        <View style={styles.headerRow}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
              <Feather name="arrow-left" size={22} color={colors.mutedForeground} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
          )}
          <Text style={[typography.caption, { color: colors.mutedForeground }]}>
            {currentStep} of {TOTAL_STEPS}
          </Text>
        </View>
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20 },
  trackBg: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  trackFill: { height: '100%', borderRadius: 2 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  backBtn: { width: 32, height: 32, justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: 20 },
});
