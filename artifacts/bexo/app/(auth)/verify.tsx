import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography, spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { OTPInput } from '@/components/OTPInput';
import { BexoButton } from '@/components/BexoButton';

export default function VerifyScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phoneNumber, verifyOtp, sendOtp, isLoading } = useAuthStore();
  const { initProfile } = useProfileStore();
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

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
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top + 16;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.inner, { paddingTop: topPad, paddingBottom: insets.bottom + 32 }]}>
        <Animated.View entering={FadeInDown.delay(0).springify()}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
            <Text style={[typography.body, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.headBlock}>
          <Text style={[typography.display, { color: colors.foreground, letterSpacing: -0.5 }]}>
            Check WhatsApp.
          </Text>
          <Text style={[typography.bodyLg, styles.sub, { color: colors.mutedForeground }]}>
            We sent a 4-digit code to{'\n'}
            <Text style={{ color: colors.foreground, fontFamily: 'DMSans_600SemiBold' }}>
              {phoneNumber}
            </Text>
            {'\n'}
            <Text style={{ color: colors.accent, fontFamily: 'DMSans_500Medium' }}>
              Dev mode: use 0000
            </Text>
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify()} style={styles.otpBlock}>
          <OTPInput onComplete={handleComplete} disabled={isLoading} error={!!error} />
          {error ? (
            <Text style={[typography.bodySm, styles.errorText, { color: colors.destructive }]}>
              {error}
            </Text>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.resendRow}>
          <Text style={[typography.body, { color: colors.mutedForeground }]}>
            Didn't receive it?{' '}
          </Text>
          <TouchableOpacity onPress={handleResend} disabled={resending}>
            <Text style={[typography.body, { color: colors.primary, fontFamily: 'DMSans_600SemiBold' }]}>
              {resending ? 'Sending…' : 'Resend'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24 },
  backRow: { marginBottom: spacing.xl },
  headBlock: { marginBottom: spacing.xl },
  sub: { marginTop: 12, lineHeight: 28 },
  otpBlock: { alignItems: 'center', gap: 16 },
  errorText: { textAlign: 'center' },
  resendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 32 },
});
