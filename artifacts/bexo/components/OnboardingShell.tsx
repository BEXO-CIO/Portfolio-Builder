import { Feather } from '@expo/vector-icons';
import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, interpolateColor, useDerivedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography } from '@/constants/theme';

const TOTAL_STEPS = 10;

// resume, manual, and manual_review are alternate step 3 flows
// (users take one path or the other, never both)
const STEP_LABELS: Record<string, number> = {
  photo: 1,
  handle: 2,
  resume: 3,
  manual: 3,
  manual_review: 3,
  cards: 4,
  about: 5,
  dob: 6,
  theme: 7,
  font: 8,
  preference: 9,
  generating: 10,
};

type Props = {
  step: string;
  onBack?: () => void;
  children: React.ReactNode;
};

function Dot({ index, currentStep, activeColor, inactiveColor }: { index: number, currentStep: number, activeColor: string, inactiveColor: string }) {
  const isActive = index + 1 === currentStep;
  const isPast = index + 1 < currentStep;

  const width = useDerivedValue(() => {
    return withSpring(isActive ? 20 : 6, { damping: 15, stiffness: 300 });
  }, [isActive]);

  const style = useAnimatedStyle(() => {
    return {
      width: width.value,
      backgroundColor: isActive ? activeColor : isPast ? activeColor : inactiveColor,
      opacity: isActive ? 1 : isPast ? 0.7 : 0.4,
    };
  });

  return <Animated.View style={[styles.dot, style]} />;
}

export function OnboardingShell({ step, onBack, children }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const currentStep = STEP_LABELS[step] ?? 1;

  const topPad = Platform.OS === 'web' ? 67 : insets.top + 8;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad }]}>
        <View style={styles.headerRow}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
              <Feather name="arrow-left" size={22} color={colors.mutedForeground} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
          )}
          
          <View style={styles.dotsContainer}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <Dot 
                key={i} 
                index={i} 
                currentStep={currentStep} 
                activeColor={colors.primary} 
                inactiveColor={colors.border} 
              />
            ))}
          </View>

          <View style={{ width: 32 }} />
        </View>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        {children}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 32, height: 32, justifyContent: 'center' },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  content: { flex: 1, paddingHorizontal: 20 },
});
