import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Profile hero ──────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(0).springify()}>
        <LinearGradient
          colors={colors.gradientHero}
          style={[styles.hero, { paddingTop: insets.top + 20 }]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.closeBtn}>
            <Feather name="x" size={20} color="rgba(255,255,255,0.8)" />
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
              <Feather name="smartphone" size={12} color="#FFFFFF" />
              <Text style={styles.badgeText}>Phone {session?.phoneVerified ? '✓' : '✗'}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: session?.emailVerified ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)' }]}>
              <Feather name="mail" size={12} color="#FFFFFF" />
              <Text style={styles.badgeText}>Gmail {session?.emailVerified ? '✓' : '✗'}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.body}>
        {/* ── Account ──────────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(60).springify()}>
          <SectionLabel label="ACCOUNT" colors={colors} />
          <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ListRow title="Edit Profile" onPress={() => { router.back(); router.push('/edit-profile'); }} chevron leftIcon="user" />
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <ListRow title="Identity Card" onPress={() => { router.back(); router.push('/(main)/cards'); }} chevron leftIcon="credit-card" />
          </View>
        </Animated.View>

        {/* ── Verification status ───────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <SectionLabel label="VERIFICATION" colors={colors} />
          <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
          </View>
        </Animated.View>

        {/* ── Portfolio ─────────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(140).springify()}>
          <SectionLabel label="PORTFOLIO" colors={colors} />
          <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ListRow title="FAQ" onPress={() => router.push('/faq')} chevron leftIcon="help-circle" />
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <ListRow title="Privacy Policy" onPress={() => router.push('/privacy')} chevron leftIcon="shield" />
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <ListRow title="Terms of Service" onPress={() => router.push('/terms')} chevron leftIcon="file-text" />
          </View>
        </Animated.View>

        {/* ── Sign out ──────────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(180).springify()} style={{ marginTop: 8 }}>
          <TouchableOpacity
            style={[styles.signOutBtn, { borderColor: colors.destructive + '40', backgroundColor: colors.destructiveLight }]}
            onPress={handleSignOut}
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
    </ScrollView>
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
  hero: { paddingHorizontal: 24, paddingBottom: 28, alignItems: 'center' },
  closeBtn: { alignSelf: 'flex-start', marginBottom: 20 },
  avatarWrap: { marginBottom: 14 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  avatarPlaceholder: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarInitial: { fontFamily: 'DMSans_700Bold', fontSize: 32, color: '#FFFFFF' },
  heroName: { fontFamily: 'DMSans_700Bold', fontSize: 22, color: '#FFFFFF', letterSpacing: -0.4 },
  heroHandle: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4, marginBottom: 16 },
  badgesRow: { flexDirection: 'row', gap: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: '#FFFFFF' },

  body: { paddingHorizontal: 20 },
  group: { borderRadius: 16, borderWidth: 1.5, overflow: 'hidden' },
  separator: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  verifyRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  verifyIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, borderRadius: 14, borderWidth: 1.5,
  },
});
