/**
 * verify-email.tsx — Step 2 of mandatory dual verification.
 *
 * After phone OTP is confirmed, the user must link their Google account.
 * This calls linkWithCredential to attach Google to the existing Firebase phone-auth user.
 * Both phoneVerified AND emailVerified become true → user proceeds to onboarding.
 */

import { Feather } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';
import { makeRedirectUri } from 'expo-auth-session';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography, shadow } from '@/constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { GOOGLE_CLIENT_IDS } from '@/services/googleAuth';

// Complete WebBrowser session so the OAuth redirect browser tab closes cleanly
WebBrowser.maybeCompleteAuthSession();

// ── Animated Google Icon ─────────────────────────────────────────────────────

function GoogleIcon({ size = 24 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <Text style={{ fontSize: size * 0.85, textAlign: 'center', lineHeight: size }}>🇬</Text>
    </View>
  );
}

function SVGGoogle({ size = 22 }: { size?: number }) {
  // Using the classic multicolor G via emoji substitute (will replace with SVG in prod)
  return (
    <View style={[styles.gCircle, { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2 }]}>
      <Text style={{ fontSize: size - 2, lineHeight: size + 6 }}>G</Text>
    </View>
  );
}

// ── Benefit Row ──────────────────────────────────────────────────────────────

function Benefit({ icon, text, colors, delay }: { icon: string; text: string; colors: any; delay: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.benefitRow}>
      <View style={[styles.benefitIcon, { backgroundColor: colors.primaryLight }]}>
        <Feather name={icon as any} size={16} color={colors.primary} />
      </View>
      <Text style={[typography.bodySm, { color: colors.mutedForeground, flex: 1 }]}>{text}</Text>
    </Animated.View>
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────

export default function VerifyEmailScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, linkGoogle, isLoading, signOut } = useAuthStore();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Pulsing ring animation on the Google button
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 900 }),
        withTiming(1, { duration: 900 })
      ),
      -1,
      true
    );
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  // Google OAuth request
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_IDS.web,
    iosClientId: GOOGLE_CLIENT_IDS.ios,
    androidClientId: GOOGLE_CLIENT_IDS.android,
    redirectUri: makeRedirectUri({ scheme: 'com.mybexo.app' }),
  });

  // Process Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token, access_token } = (response.authentication as any) ?? {};
      if (id_token) {
        handleGoogleLink(id_token, access_token ?? undefined);
      } else {
        setError('Google sign-in did not return a valid token. Please try again.');
      }
    } else if (response?.type === 'error') {
      setError('Google sign-in was cancelled or failed. Please try again.');
    }
  }, [response]);

  const handleGoogleLink = async (idToken: string, accessToken?: string) => {
    setError('');
    const { error: err } = await linkGoogle(idToken, accessToken);
    if (err) {
      setError(err);
      return;
    }
    setSuccess(true);
    // Short celebration delay then proceed to onboarding
    setTimeout(() => router.replace('/'), 900);
  };

  const handleGooglePress = async () => {
    setError('');
    await promptAsync();
  };


  if (success) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={styles.successCenter}>
          <Animated.View
            entering={FadeInUp.springify()}
            style={[styles.successIcon, { backgroundColor: colors.successLight }]}
          >
            <Feather name="check-circle" size={48} color={colors.success} />
          </Animated.View>
          <Animated.Text
            entering={FadeInUp.delay(100).springify()}
            style={[typography.h2, { color: colors.foreground, textAlign: 'center', marginTop: 20 }]}
          >
            All verified! 🎉
          </Animated.Text>
          <Animated.Text
            entering={FadeInUp.delay(180).springify()}
            style={[typography.body, { color: colors.mutedForeground, textAlign: 'center', marginTop: 8 }]}
          >
            Taking you to your profile…
          </Animated.Text>
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Gradient header — step 2 */}
      <LinearGradient
        colors={colors.gradientHero}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <Animated.View entering={FadeInDown.delay(0).springify()}>
          <Text style={styles.stepLabel}>Step 2 of 2</Text>
          <Text style={styles.headerTitle}>Verify your email</Text>
          <Text style={styles.headerSub}>
            Link your Google account to complete verification. This keeps your portfolio secure.
          </Text>
        </Animated.View>

        {/* Phone verified badge */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.verifiedBadge}
        >
          <Feather name="smartphone" size={14} color="#FFFFFF" />
          <Text style={styles.verifiedText}>
            {session?.user.phone ? `${session.user.phone.slice(0, 6)}•••••` : 'Phone'} verified ✓
          </Text>
        </Animated.View>

        {/* Step dots */}
        <View style={styles.stepDots}>
          <View style={[styles.dot, styles.dotDone]}>
            <Feather name="check" size={10} color="#0D6B5C" />
          </View>
          <View style={[styles.dot, styles.dotActive]} />
        </View>
      </LinearGradient>

      {/* Card */}
      <Animated.View
        entering={FadeInUp.delay(120).springify()}
        style={[styles.card, { backgroundColor: colors.surface, ...shadow.lg }]}
      >
        {/* Benefits list */}
        <Text style={[typography.label, { color: colors.mutedForeground, letterSpacing: 0.6, marginBottom: 16 }]}>
          WHY WE NEED THIS
        </Text>
        <Benefit icon="mail" text="Your email will be shown on your portfolio for recruiters to contact you." colors={colors} delay={160} />
        <Benefit icon="shield" text="Protects your account — only you can sign in with both factors." colors={colors} delay={210} />
        <Benefit icon="bell" text="Receive portfolio view notifications and important updates." colors={colors} delay={260} />

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Google button */}
        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[typography.body, { color: colors.mutedForeground, marginLeft: 12 }]}>
              Linking your Google account…
            </Text>
          </View>
        ) : (
          <Animated.View style={pulseStyle}>
            <Pressable
              onPress={handleGooglePress}
              disabled={!request}
              style={({ pressed }) => [
                styles.googleBtn,
                {
                  backgroundColor: pressed ? '#f8f9fa' : '#FFFFFF',
                  borderColor: colors.border,
                  opacity: pressed ? 0.9 : 1,
                  ...shadow.md,
                },
              ]}
            >
              {/* Google multicolor G */}
              <View style={styles.googleLogo}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Error */}
        {error ? (
          <Animated.View entering={FadeInUp.duration(200)} style={[styles.errorBox, { backgroundColor: colors.destructiveLight }]}>
            <Feather name="alert-circle" size={14} color={colors.destructive} />
            <Text style={[typography.bodySm, { color: colors.destructive, flex: 1, marginLeft: 8 }]}>
              {error}
            </Text>
          </Animated.View>
        ) : null}

      </Animated.View>

      {/* Sign out link */}
      <Animated.View entering={FadeInUp.delay(320).springify()} style={styles.signOutRow}>
        <Text style={[typography.caption, { color: colors.mutedForeground }]}>Wrong number? </Text>
        <Pressable
          onPress={async () => {
            await signOut();
            router.replace('/(auth)');
          }}
        >
          <Text style={[typography.caption, { color: colors.primary, fontFamily: 'DMSans_600SemiBold' }]}>
            Start over
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 28 },
  stepLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  headerTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 30,
    color: '#FFFFFF',
    letterSpacing: -0.6,
    marginBottom: 10,
  },
  headerSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 20,
    marginBottom: 18,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  verifiedText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: '#FFFFFF',
  },
  stepDots: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot: { height: 4, borderRadius: 2 },
  dotActive: { width: 28, backgroundColor: '#FFFFFF' },
  dotDone: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
  },

  card: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  benefitIcon: {
    width: 32, height: 32, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  divider: { height: 1, marginVertical: 20 },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  googleLogo: {
    width: 28, height: 28,
    backgroundColor: 'transparent',
    justifyContent: 'center', alignItems: 'center',
  },
  googleG: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    color: '#4285F4',
  },
  googleBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    color: '#1C1917',
  },
  gCircle: {
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
    gap: 4,
  },
  devSkip: { alignItems: 'center', marginTop: 16 },
  successCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  successIcon: {
    width: 96, height: 96, borderRadius: 48,
    justifyContent: 'center', alignItems: 'center',
  },
  signOutRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 32,
  },
});
