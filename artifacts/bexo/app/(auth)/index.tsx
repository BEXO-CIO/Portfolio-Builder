import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography } from '@/constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { BexoButton } from '@/components/BexoButton';

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 5) return digits;
  return digits.slice(0, 5) + ' ' + digits.slice(5);
}

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sendOtp, isLoading } = useAuthStore();
  const [rawDigits, setRawDigits] = useState('');
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput>(null);

  const displayValue = formatPhone(rawDigits);
  const fullPhone = '+91' + rawDigits;

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 10);
    setRawDigits(digits);
    setError('');
  };

  const handleSend = async () => {
    if (rawDigits.length < 10) {
      setError('Enter a 10-digit mobile number');
      return;
    }
    setError('');
    const { error: err } = await sendOtp(fullPhone);
    if (err) { setError(err); return; }
    router.push('/(auth)/verify');
  };

  const topPad = Platform.OS === 'web' ? 72 : insets.top + 16;
  const isReady = rawDigits.length === 10;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.inner, { paddingTop: topPad, paddingBottom: insets.bottom + 32 }]}>

        {/* Brand */}
        <Animated.View entering={FadeInDown.delay(0).springify()}>
          <Text style={[styles.brand, { color: colors.primary }]}>bexo</Text>
        </Animated.View>

        {/* Headline */}
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.headBlock}>
          <Text style={[typography.display, styles.headline, { color: colors.foreground }]}>
            Your portfolio{'\n'}starts here.
          </Text>
          <Text style={[typography.body, styles.sub, { color: colors.mutedForeground }]}>
            Sign in or create an account in seconds.
          </Text>
        </Animated.View>

        {/* Phone input */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.formBlock}>
          <Text style={[typography.caption, styles.label, { color: colors.mutedForeground }]}>
            MOBILE NUMBER
          </Text>

          <Pressable
            onPress={() => inputRef.current?.focus()}
            style={[
              styles.phoneRow,
              {
                backgroundColor: colors.surface,
                borderColor: error
                  ? colors.destructive
                  : focused
                  ? colors.primary
                  : colors.border,
                borderWidth: focused || error ? 2 : 1.5,
              },
            ]}
          >
            {/* Country code pill */}
            <View style={[styles.countryPill, { backgroundColor: colors.muted }]}>
              <Text style={[styles.flag]}>🇮🇳</Text>
              <Text style={[typography.body, styles.countryCode, { color: colors.foreground }]}>
                +91
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Number input */}
            <TextInput
              ref={inputRef}
              style={[
                typography.bodyLg,
                styles.phoneInput,
                { color: colors.foreground },
              ]}
              value={displayValue}
              onChangeText={handleChange}
              placeholder="98765 43210"
              placeholderTextColor={colors.mutedForeground + '80'}
              keyboardType="phone-pad"
              autoComplete="tel-national"
              maxLength={11}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              selectionColor={colors.primary}
            />

            {/* Digit count badge */}
            {rawDigits.length > 0 && (
              <View style={styles.countBadge}>
                {isReady ? (
                  <Feather name="check-circle" size={18} color={colors.primary} />
                ) : (
                  <Text style={[styles.countText, { color: colors.mutedForeground }]}>
                    {rawDigits.length}/10
                  </Text>
                )}
              </View>
            )}
          </Pressable>

          {error ? (
            <Animated.View entering={FadeInUp.duration(200)}>
              <Text style={[typography.bodySm, styles.errorText, { color: colors.destructive }]}>
                {error}
              </Text>
            </Animated.View>
          ) : (
            <Text style={[typography.caption, styles.hint, { color: colors.mutedForeground }]}>
              We'll send a verification code via WhatsApp
            </Text>
          )}

          <View style={styles.btnWrap}>
            <BexoButton
              label="Send code via WhatsApp"
              onPress={handleSend}
              loading={isLoading}
              disabled={rawDigits.length < 10}
            />
          </View>
        </Animated.View>

        {/* Legal */}
        <Animated.View entering={FadeInDown.delay(160).springify()} style={styles.legal}>
          <Text style={[typography.caption, { color: colors.mutedForeground, textAlign: 'center' }]}>
            By continuing you agree to our{' '}
            <Text style={{ color: colors.primary }} onPress={() => router.push('/terms')}>Terms</Text>
            {' '}and{' '}
            <Text style={{ color: colors.primary }} onPress={() => router.push('/privacy')}>Privacy Policy</Text>.
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24 },
  brand: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 22,
    letterSpacing: -0.5,
    marginBottom: 36,
  },
  headBlock: { marginBottom: 36 },
  headline: { letterSpacing: -0.5, lineHeight: 44 },
  sub: { marginTop: 10, lineHeight: 24 },
  formBlock: { gap: 0 },
  label: {
    letterSpacing: 0.8,
    marginBottom: 8,
    fontFamily: 'DMSans_600SemiBold',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    overflow: 'hidden',
    height: 58,
  },
  countryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: '100%',
    gap: 6,
  },
  flag: { fontSize: 18 },
  countryCode: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
  },
  divider: { width: 1, height: 28, marginHorizontal: 2 },
  phoneInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 14,
    fontSize: 18,
    fontFamily: 'DMSans_500Medium',
    letterSpacing: 1,
  },
  countBadge: {
    paddingRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
  },
  hint: {
    marginTop: 8,
    marginBottom: 20,
  },
  errorText: {
    marginTop: 6,
    marginBottom: 14,
  },
  btnWrap: { marginTop: 4 },
  legal: { marginTop: 'auto', paddingTop: 24 },
});
