import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';

import { useColors } from '@/hooks/useColors';
import { typography, radius, shadow } from '@/constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { BexoButton } from '@/components/BexoButton';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import app from '@/services/firebase';

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
  const recaptchaVerifier = useRef(null);

  const displayValue = formatPhone(rawDigits);
  const fullPhone = '+91' + rawDigits;
  const isReady = rawDigits.length === 10;

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 10);
    setRawDigits(digits);
    setError('');
  };

  const handleSend = async () => {
    if (rawDigits.length < 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    const { error: err } = await sendOtp(fullPhone, recaptchaVerifier.current);
    if (err) { setError(err); return; }
    router.push('/(auth)/verify');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
        attemptInvisibleVerification
      />
      {/* Card panel */}
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        bottomOffset={Platform.OS === 'ios' ? 20 : 0}
      >
          {/* Hero gradient top section */}
          <LinearGradient
            colors={colors.gradientHero}
            style={[styles.hero, { paddingTop: insets.top + 24 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View entering={FadeInDown.delay(0).springify()}>
              {/* Logo mark */}
              <View style={styles.logoRow}>
                <View style={[styles.logoDot, { backgroundColor: 'rgba(255,255,255,0.25)' }]} />
                <Text style={styles.logoText}>bexo</Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.heroText}>
              <Text style={styles.heroTitle}>Your portfolio,{'\n'}starts with a tap.</Text>
              <Text style={styles.heroSub}>
                Step 1 of 2 — Verify your mobile number
              </Text>
            </Animated.View>

            {/* Step progress dots */}
            <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.stepDots}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={[styles.dot, styles.dotInactive]} />
            </Animated.View>
          </LinearGradient>

          <View style={styles.scroll}>
          <Animated.View
            entering={FadeInUp.delay(320).springify()}
            style={[styles.card, { backgroundColor: colors.surface, ...shadow.lg }]}
          >
            <Text style={[typography.h3, { color: colors.foreground, marginBottom: 4 }]}>
              Enter your mobile
            </Text>
            <Text style={[typography.bodySm, { color: colors.mutedForeground, marginBottom: 24 }]}>
              We'll send a 6-digit code to verify it's you.
            </Text>

            {/* Phone input */}
            <Pressable
              onPress={() => inputRef.current?.focus()}
              style={[
                styles.phoneRow,
                {
                  backgroundColor: colors.muted,
                  borderColor: error ? colors.destructive : focused ? colors.primary : colors.border,
                  borderWidth: focused || error ? 2 : 1.5,
                  borderRadius: radius.md,
                },
              ]}
            >
              {/* Flag + code */}
              <View style={[styles.countryPill, { backgroundColor: colors.secondary }]}>
                <Text style={styles.flag}>🇮🇳</Text>
                <Text style={[typography.body, { color: colors.foreground, fontFamily: 'DMSans_600SemiBold' }]}>
                  +91
                </Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <TextInput
                ref={inputRef}
                style={[typography.bodyLg, styles.phoneInput, { color: colors.foreground }]}
                value={displayValue}
                onChangeText={handleChange}
                placeholder="98765 43210"
                placeholderTextColor={colors.mutedForeground + '60'}
                keyboardType="phone-pad"
                autoComplete="tel-national"
                maxLength={11}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                selectionColor={colors.primary}
              />

              {rawDigits.length > 0 && (
                <View style={styles.countBadge}>
                  {isReady ? (
                    <View style={[styles.checkCircle, { backgroundColor: colors.primaryLight }]}>
                      <Feather name="check" size={14} color={colors.primary} />
                    </View>
                  ) : (
                    <Text style={[typography.caption, { color: colors.mutedForeground }]}>
                      {rawDigits.length}/10
                    </Text>
                  )}
                </View>
              )}
            </Pressable>

            {/* Error / hint */}
            {error ? (
              <Animated.View entering={FadeInUp.duration(200)} style={styles.errorRow}>
                <Feather name="alert-circle" size={14} color={colors.destructive} />
                <Text style={[typography.bodySm, { color: colors.destructive, marginLeft: 6 }]}>
                  {error}
                </Text>
              </Animated.View>
            ) : (
              <Text style={[typography.caption, styles.hint, { color: colors.mutedForeground }]}>
                Standard SMS rates may apply. Your number won't be shared.
              </Text>
            )}

            <View style={styles.btnWrap}>
              <BexoButton
                label="Send verification code"
                onPress={handleSend}
                loading={isLoading}
                disabled={rawDigits.length < 10}
                iconRight="arrow-right"
              />
            </View>
          </Animated.View>

          {/* Legal */}
          <Animated.View entering={FadeInUp.delay(440).springify()} style={styles.legal}>
            <Text style={[typography.caption, { color: colors.mutedForeground, textAlign: 'center', lineHeight: 18 }]}>
              By continuing you agree to our{' '}
              <Text style={{ color: colors.primary }} onPress={() => router.push('/terms')}>Terms</Text>
              {' '}and{' '}
              <Text style={{ color: colors.primary }} onPress={() => router.push('/privacy')}>Privacy Policy</Text>.
            </Text>
          </Animated.View>
          </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    paddingHorizontal: 28,
    paddingBottom: 28,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32 },
  logoDot: { width: 10, height: 10, borderRadius: 5 },
  logoText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroText: { marginBottom: 24 },
  heroTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 34,
    color: '#FFFFFF',
    letterSpacing: -0.8,
    lineHeight: 42,
    marginBottom: 10,
  },
  heroSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 22,
  },
  stepDots: { flexDirection: 'row', gap: 8 },
  dot: { width: 28, height: 4, borderRadius: 2 },
  dotActive: { backgroundColor: '#FFFFFF' },
  dotInactive: { backgroundColor: 'rgba(255,255,255,0.30)' },

  scroll: { paddingHorizontal: 20, paddingTop: 24, flex: 1 },
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 58,
    overflow: 'hidden',
    marginBottom: 10,
  },
  countryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: '100%',
    gap: 6,
  },
  flag: { fontSize: 18 },
  divider: { width: 1, height: 26, marginHorizontal: 2 },
  phoneInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 14,
    fontSize: 18,
    fontFamily: 'DMSans_500Medium',
    letterSpacing: 1,
  },
  countBadge: { paddingRight: 14, justifyContent: 'center' },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 10 },
  hint: { marginTop: 2, marginBottom: 20, lineHeight: 18 },
  btnWrap: { marginTop: 8 },
  legal: { paddingHorizontal: 8 },
});
