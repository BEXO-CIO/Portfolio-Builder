import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography, shadow } from '@/constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';

const CODE_LENGTH = 6;

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) return '+91 ••••• ' + digits.slice(-4);
  return phone || '+91 •••••••••';
}

// ── Premium OTP Input ────────────────────────────────────────────────────────

function OTPCell({
  value,
  focused,
  error,
  index,
}: {
  value: string;
  focused: boolean;
  error: boolean;
  index: number;
}) {
  const colors = useColors();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (value) {
      scale.value = withSequence(
        withSpring(1.12, { stiffness: 400, damping: 18 }),
        withSpring(1, { stiffness: 300, damping: 20 })
      );
    }
  }, [value]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const borderColor = error
    ? colors.destructive
    : focused
    ? colors.primary
    : value
    ? colors.primary + '60'
    : colors.border;

  const bgColor = error
    ? colors.destructiveLight
    : focused
    ? colors.primaryLight
    : colors.surface;

  return (
    <Animated.View
      style={[
        animStyle,
        styles.cell,
        {
          backgroundColor: bgColor,
          borderColor,
          borderWidth: focused || error ? 2.5 : 2,
          borderRadius: 14,
          ...(focused ? shadow.primary : {}),
        },
      ]}
    >
      {value ? (
        <Text style={[styles.cellText, { color: error ? colors.destructive : colors.foreground }]}>
          {value}
        </Text>
      ) : focused ? (
        <View style={[styles.cursor, { backgroundColor: colors.primary }]} />
      ) : null}
    </Animated.View>
  );
}

function OTPInput({
  onComplete,
  disabled,
  error,
}: {
  onComplete: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
}) {
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, []);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
    const full = next.join('');
    if (full.length === CODE_LENGTH && !full.includes('')) onComplete(full);
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      const next = [...code];
      next[index - 1] = '';
      setCode(next);
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  return (
    <View style={styles.otpRow}>
      {Array.from({ length: CODE_LENGTH }).map((_, i) => (
        <View key={i} style={styles.cellWrapper}>
          <OTPCell
            value={code[i]}
            focused={focusedIndex === i}
            error={!!error}
            index={i}
          />
          <TextInput
            ref={(r) => { inputRefs.current[i] = r; }}
            style={styles.hiddenInput}
            value={code[i]}
            onChangeText={(t) => handleChange(t, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            onFocus={() => setFocusedIndex(i)}
            keyboardType="number-pad"
            maxLength={1}
            editable={!disabled}
            selectTextOnFocus
            caretHidden
          />
        </View>
      ))}
    </View>
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────

export default function VerifyScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phoneNumber, verifyOtp, sendOtp, isLoading } = useAuthStore();
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [otpKey, setOtpKey] = useState(0);
  const shakeX = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 60 }),
      withTiming(10, { duration: 60 }),
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(-4, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );
  };

  const handleComplete = async (code: string) => {
    setError('');
    const { error: err } = await verifyOtp(phoneNumber, code);
    if (err) {
      setError(err);
      setOtpKey((k) => k + 1);
      triggerShake();
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Navigate to Google verification (step 2)
    router.replace('/(auth)/verify-email');
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    await sendOtp(phoneNumber);
    setOtpKey((k) => k + 1);
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 4000);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Gradient header */}
      <LinearGradient
        colors={colors.gradientHero}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Check your SMS</Text>
          <View style={styles.phonePill}>
            <Text style={styles.phonePillText}>{maskPhone(phoneNumber)}</Text>
          </View>
          <Text style={styles.headerSub}>
            Enter the 6-digit code sent to your number
          </Text>
        </View>

        {/* Step dots */}
        <View style={styles.stepDots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotInactive]} />
        </View>
      </LinearGradient>

      {/* OTP card */}
      <View style={[styles.card, { backgroundColor: colors.surface, ...shadow.lg }]}>
        {isLoading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={[typography.bodySm, { color: colors.mutedForeground, marginTop: 12 }]}>
              Verifying…
            </Text>
          </View>
        ) : (
          <>
            <Animated.View style={shakeStyle}>
              <OTPInput
                key={otpKey}
                onComplete={handleComplete}
                disabled={isLoading}
                error={!!error}
              />
            </Animated.View>

            {error ? (
              <Animated.View entering={FadeInUp.duration(200)} style={styles.errorBox}>
                <Text style={[typography.bodySm, { color: colors.destructive, textAlign: 'center' }]}>
                  {error}
                </Text>
              </Animated.View>
            ) : null}

            {/* Dev hint */}
            {__DEV__ && (
              <Animated.View
                entering={FadeInDown.delay(200).springify()}
                style={[styles.devHint, { backgroundColor: colors.warningLight, borderColor: colors.warning + '30' }]}
              >
                <Text style={[typography.caption, { color: colors.warning, textAlign: 'center', lineHeight: 18 }]}>
                  Dev: enter <Text style={{ fontFamily: 'DMSans_700Bold' }}>000000</Text> for any number{'\n'}
                  or <Text style={{ fontFamily: 'DMSans_700Bold' }}>001234</Text> for +91 9999999999
                </Text>
              </Animated.View>
            )}

            {/* Resend */}
            <View style={styles.resendRow}>
              {resent ? (
                <Text style={[typography.bodySm, { color: colors.success }]}>✓ Code resent</Text>
              ) : (
                <>
                  <Text style={[typography.bodySm, { color: colors.mutedForeground }]}>
                    Didn't receive it?{' '}
                  </Text>
                  <TouchableOpacity onPress={handleResend} disabled={resending} hitSlop={8}>
                    <Text style={[typography.bodySm, { color: colors.primary, fontFamily: 'DMSans_600SemiBold' }]}>
                      {resending ? 'Sending…' : 'Resend code'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const CELL_SIZE = 50;

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 28 },
  backBtn: { marginBottom: 20 },
  backText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: 'rgba(255,255,255,0.85)' },
  headerContent: { marginBottom: 20 },
  headerTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 30,
    color: '#FFFFFF',
    letterSpacing: -0.6,
    marginBottom: 12,
  },
  phonePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  phonePillText: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: '#FFFFFF' },
  headerSub: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 20 },
  stepDots: { flexDirection: 'row', gap: 8 },
  dot: { width: 28, height: 4, borderRadius: 2 },
  dotActive: { backgroundColor: '#FFFFFF' },
  dotInactive: { backgroundColor: 'rgba(255,255,255,0.30)' },

  card: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
  },
  loadingOverlay: { alignItems: 'center', paddingVertical: 32 },

  otpRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 8 },
  cellWrapper: { position: 'relative', width: CELL_SIZE, height: CELL_SIZE + 8 },
  cell: { width: CELL_SIZE, height: CELL_SIZE + 8, justifyContent: 'center', alignItems: 'center' },
  cellText: { fontFamily: 'DMSans_700Bold', fontSize: 22, textAlign: 'center' },
  cursor: { width: 2, height: 24, borderRadius: 1 },
  hiddenInput: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE + 8,
    opacity: 0,
    top: 0,
    left: 0,
  },

  errorBox: {
    backgroundColor: 'transparent',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  devHint: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});
