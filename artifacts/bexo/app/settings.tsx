import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography, radius, shadow } from '@/constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { ListRow } from '@/components/ListRow';

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, signOut } = useAuthStore();
  const { profile, reset: resetProfile } = useProfileStore();
  const { reset: resetPortfolio } = usePortfolioStore();

  const firstName = profile?.full_name?.split(' ')[0] ?? session?.user.displayName?.split(' ')[0] ?? 'User';
  const avatarUrl = profile?.avatar_url ?? session?.user.photoURL;

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const headerHeight = 220 + insets.top;

  const stickyHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [headerHeight - 80, headerHeight - 20], [0, 1], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [headerHeight - 80, headerHeight - 20], [-20, 0], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  const heroStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, headerHeight - 80], [1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, headerHeight], [0, -headerHeight * 0.4], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          resetProfile();
          resetPortfolio();
          router.replace('/(auth)');
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Sticky Blurred Header */}
      <Animated.View style={[styles.stickyHeader, { height: insets.top + 50, paddingTop: insets.top }, stickyHeaderStyle]}>
        <BlurView intensity={80} tint={colors.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFillObject} />
        <View style={styles.stickyHeaderContent}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.stickyBackBtn}>
            <Feather name="chevron-down" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[typography.h3, { color: colors.foreground }]}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={[styles.stickyBorder, { backgroundColor: colors.border }]} />
      </Animated.View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile hero ──────────────────────────────────────────────────── */}
        <Animated.View style={heroStyle}>
          <LinearGradient
            colors={colors.gradientHero}
            style={[styles.hero, { paddingTop: insets.top + 20 }]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.closeBtn}>
              <Feather name="chevron-down" size={24} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>

            {/* Avatar */}
            <View style={styles.avatarWrap}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{firstName.charAt(0).toUpperCase()}</Text>
                </View>
              )}
            </View>

            <Text style={styles.heroName}>{profile?.full_name ?? firstName}</Text>
            <Text style={styles.heroHandle}>
              {profile?.handle ? `@${profile.handle}` : session?.user.email ?? ''}
            </Text>

            {/* Verified badges */}
            <View style={styles.badgesRow}>
              <View style={[styles.badge, { backgroundColor: session?.phoneVerified ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)' }]}>
                <Feather name="smartphone" size={12} color={session?.phoneVerified ? '#FFFFFF' : 'rgba(255,255,255,0.5)'} />
                <Text style={[styles.badgeText, { color: session?.phoneVerified ? '#FFFFFF' : 'rgba(255,255,255,0.5)' }]}>Phone {session?.phoneVerified ? '✓' : '✗'}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: session?.emailVerified ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)' }]}>
                <Feather name="mail" size={12} color={session?.emailVerified ? '#FFFFFF' : 'rgba(255,255,255,0.5)'} />
                <Text style={[styles.badgeText, { color: session?.emailVerified ? '#FFFFFF' : 'rgba(255,255,255,0.5)' }]}>Gmail {session?.emailVerified ? '✓' : '✗'}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.body}>
          {/* ── Account ──────────────────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(60).springify()}>
            <SectionLabel label="ACCOUNT" colors={colors} />
            <BlurView intensity={50} tint={colors.isDark ? 'dark' : 'light'} style={[styles.group, { backgroundColor: colors.isDark ? 'rgba(26,26,31,0.5)' : 'rgba(255,255,255,0.6)', borderColor: colors.border }]}>
              <ListRow title="Edit Profile" onPress={() => { router.back(); router.push('/edit-profile'); }} chevron leftIcon="user" />
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
              <ListRow title="Identity Card" onPress={() => { router.back(); router.push('/(main)/cards'); }} chevron leftIcon="credit-card" />
            </BlurView>
          </Animated.View>

          {/* ── Verification status ───────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <SectionLabel label="VERIFICATION" colors={colors} />
            <BlurView intensity={50} tint={colors.isDark ? 'dark' : 'light'} style={[styles.group, { backgroundColor: colors.isDark ? 'rgba(26,26,31,0.5)' : 'rgba(255,255,255,0.6)', borderColor: colors.border }]}>
              <View style={styles.verifyRow}>
                <View style={[styles.verifyIcon, { backgroundColor: session?.phoneVerified ? colors.primaryLight : colors.muted }]}>
                  <Feather name="smartphone" size={18} color={session?.phoneVerified ? colors.primary : colors.mutedForeground} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.body, { color: colors.foreground, fontFamily: 'DMSans_500Medium' }]}>Mobile number</Text>
                  <Text style={[typography.caption, { color: session?.phoneVerified ? colors.success : colors.mutedForeground, marginTop: 2 }]}>
                    {session?.phoneVerified ? `${session.user.phone} · Verified` : 'Not verified'}
                  </Text>
                </View>
                <Feather
                  name={session?.phoneVerified ? 'check-circle' : 'alert-circle'}
                  size={18}
                  color={session?.phoneVerified ? colors.success : colors.warning}
                />
              </View>

              <View style={[styles.separator, { backgroundColor: colors.border }]} />

              <View style={styles.verifyRow}>
                <View style={[styles.verifyIcon, { backgroundColor: session?.emailVerified ? colors.primaryLight : colors.muted }]}>
                  <Feather name="mail" size={18} color={session?.emailVerified ? colors.primary : colors.mutedForeground} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.body, { color: colors.foreground, fontFamily: 'DMSans_500Medium' }]}>Google / Gmail</Text>
                  <Text style={[typography.caption, { color: session?.emailVerified ? colors.success : colors.mutedForeground, marginTop: 2 }]}>
                    {session?.emailVerified ? `${session.user.email} · Verified` : 'Not linked'}
                  </Text>
                </View>
                <Feather
                  name={session?.emailVerified ? 'check-circle' : 'alert-circle'}
                  size={18}
                  color={session?.emailVerified ? colors.success : colors.warning}
                />
              </View>
            </BlurView>
          </Animated.View>

          {/* ── Portfolio ─────────────────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(140).springify()}>
            <SectionLabel label="PORTFOLIO" colors={colors} />
            <BlurView intensity={50} tint={colors.isDark ? 'dark' : 'light'} style={[styles.group, { backgroundColor: colors.isDark ? 'rgba(26,26,31,0.5)' : 'rgba(255,255,255,0.6)', borderColor: colors.border }]}>
              <ListRow title="FAQ" onPress={() => router.push('/faq')} chevron leftIcon="help-circle" />
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
              <ListRow title="Privacy Policy" onPress={() => router.push('/privacy')} chevron leftIcon="shield" />
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
              <ListRow title="Terms of Service" onPress={() => router.push('/terms')} chevron leftIcon="file-text" />
            </BlurView>
          </Animated.View>

          {/* ── Sign out ──────────────────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(180).springify()} style={{ marginTop: 24 }}>
            <TouchableOpacity
              style={[styles.signOutBtn, { borderColor: colors.destructive + '40', backgroundColor: colors.destructiveLight }]}
              onPress={handleSignOut}
              activeOpacity={0.8}
            >
              <Feather name="log-out" size={18} color={colors.destructive} />
              <Text style={[typography.body, { color: colors.destructive, fontFamily: 'DMSans_600SemiBold', marginLeft: 10 }]}>
                Sign out
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Text style={[typography.caption, { color: colors.mutedForeground, textAlign: 'center', marginTop: 24 }]}>
              Bexo v1.0 · mybexo.com
            </Text>
          </Animated.View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

function SectionLabel({ label, colors }: { label: string; colors: any }) {
  return (
    <Text style={[typography.overline, { color: colors.mutedForeground, marginTop: 24, marginBottom: 8, paddingHorizontal: 4 }]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  stickyHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 100,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stickyHeaderContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10 },
  stickyBackBtn: { padding: 4 },
  stickyBorder: { position: 'absolute', bottom: 0, left: 0, right: 0, height: StyleSheet.hairlineWidth },

  hero: { paddingHorizontal: 24, paddingBottom: 36, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, ...shadow.lg },
  closeBtn: { position: 'absolute', top: 0, left: 20 },
  avatarWrap: { marginBottom: 14, marginTop: 10 },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', ...shadow.md },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
    ...shadow.md,
  },
  avatarInitial: { fontFamily: 'DMSans_700Bold', fontSize: 36, color: '#FFFFFF' },
  heroName: { fontFamily: 'DMSans_700Bold', fontSize: 24, color: '#FFFFFF', letterSpacing: -0.4 },
  heroHandle: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4, marginBottom: 16 },
  badgesRow: { flexDirection: 'row', gap: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  badgeText: { fontFamily: 'DMSans_500Medium', fontSize: 12 },

  body: { paddingHorizontal: 20 },
  group: { borderRadius: 16, borderWidth: 1.5, overflow: 'hidden', ...shadow.sm },
  separator: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  verifyRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  verifyIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, borderRadius: 16, borderWidth: 1.5,
  },
});
