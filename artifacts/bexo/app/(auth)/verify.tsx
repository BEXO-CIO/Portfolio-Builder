import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography } from '@/constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { OTPInput } from '@/components/OTPInput';
import { BexoButton } from '@/components/BexoButton';

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    const last4 = digits.slice(-4);
    const prefix = phone.startsWith('+91') ? '+91' : '+' + digits.slice(0, digits.length - 10);
    return prefix + ' ••••• ' + last4;
  }
  return phone;
}

export default function VerifyScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phoneNumber, verifyOtp, sendOtp, isLoading } = useAuthStore();
  const { initProfile } = useProfileStore();
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleComplete = async (code: string) => {
    setError('');
    const { error: err } = await verifyOtp(phoneNumber, code);
    if (err) {
      setError(err);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const userId = 'user-' + phoneNumber.replace(/\D/g, '').slice(-6);
    initProfile(userId, phoneNumber);
    router.replace('/(onboarding)/email');
  };

  const handleResend = async () => {
    setResending(true);
    await sendOtp(phoneNumber);
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 4000);
  };

  const topPad = Platform.OS === 'web' ? 72 : insets.top + 16;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.inner, { paddingTop: topPad, paddingBottom: insets.bottom + 32 }]}>

        {/* Back */}
        <Animated.View entering={FadeInDown.delay(0).springify()}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Text style={[typography.body, { color: colors.primary, fontFamily: 'DMSans_500Medium' }]}>
              ← Back
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Headline */}
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.headBlock}>
          <Text style={[typography.display, { color: colors.foreground, letterSpacing: -0.5 }]}>
            Check WhatsApp.
          </Text>

          <View style={[styles.phoneChip, { backgroundColor: colors.muted }]}>
            <Text style={[typography.body, { color: colors.foreground, fontFamily: 'DMSans_600SemiBold' }]}>
              {maskPhone(phoneNumber)}
            </Text>
          </View>

          <Text style={[typography.body, styles.sub, { color: colors.mutedForeground }]}>
            Enter the 4-digit code sent to your WhatsApp.
          </Text>
        </Animated.View>

        {/* OTP */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.otpBlock}>
          <OTPInput onComplete={handleComplete} disabled={isLoading} error={!!error} />

          {error ? (
            <Animated.View entering={FadeInUp.duration(200)}>
              <Text style={[typography.bodySm, styles.errorText, { color: colors.destructive }]}>
                {error}
              </Text>
            </Animated.View>
          ) : null}
        </Animated.View>

        {/* Dev hint */}
        {__DEV__ ? (
          <Animated.View
            entering={FadeInDown.delay(150).springify()}
            style={[styles.devHint, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30' }]}
          >
            <Text style={[typography.caption, { color: colors.accent, textAlign: 'center' }]}>
              Dev: use <Text style={{ fontFamily: 'DMSans_700Bold' }}>0000</Text> for any number
              {' · '}
              <Text style={{ fontFamily: 'DMSans_700Bold' }}>1234</Text> for +91 9999999999
            </Text>
          </Animated.View>
        ) : null}

        {/* Resend */}
        <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.resendRow}>
          {resent ? (
            <Text style={[typography.body, { color: colors.primary }]}>Code resent ✓</Text>
          ) : (
            <>
              <Text style={[typography.body, { color: colors.mutedForeground }]}>
                Didn't receive it?{' '}
              </Text>
              <TouchableOpacity onPress={handleResend} disabled={resending} hitSlop={8}>
                <Text style={[typography.body, { color: colors.primary, fontFamily: 'DMSans_600SemiBold' }]}>
                  {resending ? 'Sending…' : 'Resend'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24 },
  backBtn: { marginBottom: 36 },
  headBlock: { marginBottom: 40 },
  phoneChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 16,
    marginBottom: 12,
  },
  sub: { lineHeight: 24 },
  otpBlock: { alignItems: 'center', gap: 16 },
  errorText: { textAlign: 'center' },
  devHint: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
});
