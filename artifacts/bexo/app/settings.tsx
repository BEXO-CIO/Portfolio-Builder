import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import Animated, { FadeInDown, Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography, radius, shadow } from '@/constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

interface SettingsRowProps {
  title: string;
  subtitle: string | React.ReactNode;
  leftIcon: keyof typeof Feather.glyphMap;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
}

function SettingsRow({ title, subtitle, leftIcon, onPress, rightElement, showChevron = true }: SettingsRowProps) {
  const colors = useColors();
  
  const content = (
    <View style={styles.rowInner}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
        <Feather name={leftIcon} size={18} color={colors.primary} />
      </View>
      
      <View style={styles.rowTextContainer}>
        <Text style={[typography.body, { color: colors.foreground, fontFamily: 'DMSans_600SemiBold', fontSize: 15 }]}>
          {title}
        </Text>
        {typeof subtitle === 'string' ? (
          <Text style={[typography.caption, { color: colors.mutedForeground, marginTop: 2 }]}>
            {subtitle}
          </Text>
        ) : (
          subtitle
        )}
      </View>
      
      <View style={styles.rowRight}>
        {rightElement}
        {showChevron && !rightElement && (
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View>{content}</View>;
}

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, signOut } = useAuthStore();
  const { profile, notifications, reset: resetProfile } = useProfileStore();
  const { reset: resetPortfolio } = usePortfolioStore();

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const hasUnread = unreadCount > 0;

  const firstName = profile?.full_name?.split(' ')[0] ?? session?.user.displayName?.split(' ')[0] ?? 'User';
  const avatarUrl = profile?.avatar_url ?? session?.user.photoURL;

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const headerHeight = 280 + insets.top;

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

  const handlePhonePress = () => {
    const phone = profile?.phone || session?.user.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(() => {
        Alert.alert('Error', 'Failed to open phone dialer');
      });
    } else {
      Alert.alert('Phone Number', 'No phone number set for this profile.');
    }
  };

  const handleGmailPress = () => {
    const email = profile?.email || session?.user.email;
    if (email) {
      Linking.openURL(`mailto:${email}`).catch(() => {
        Alert.alert('Error', 'Failed to open mail client');
      });
    } else {
      Alert.alert('Email Address', 'No email address set for this profile.');
    }
  };

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
          <Text style={[typography.h3, { color: colors.foreground }]}>Profile</Text>
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
            style={[styles.hero, { paddingTop: insets.top + 10 }]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            {/* Top row with buttons */}
            <View style={styles.headerTopRow}>
              <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.topBtn}>
                <Feather name="chevron-down" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/notifications')} hitSlop={12} style={styles.topBtn}>
                <Feather name="bell" size={20} color="#FFF" />
                {hasUnread && <View style={styles.notificationDot} />}
              </TouchableOpacity>
            </View>

            {/* Avatar with circle ring and checkmark badge */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatarBorderRing}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>{firstName.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
              </View>
              <View style={[styles.checkmarkBadge, { borderColor: colors.isDark ? '#064E3B' : '#0D6B5C' }]}>
                <Feather name="check" size={12} color="#FFF" />
              </View>
            </View>

            <Text style={styles.heroName}>{(profile?.full_name ?? session?.user.displayName ?? firstName).toUpperCase()}</Text>
            <Text style={styles.heroHandle}>
              {profile?.handle ? `@${profile.handle}` : session?.user.email ? `@${session.user.email.split('@')[0]}` : ''}
            </Text>

            {/* Contact buttons row */}
            <View style={styles.contactRow}>
              <TouchableOpacity style={styles.contactBtn} onPress={handlePhonePress} activeOpacity={0.8}>
                <Feather name="phone" size={14} color="#FFF" />
                <Text style={styles.contactBtnText}>Phone</Text>
                <Feather name="chevron-right" size={12} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactBtn} onPress={handleGmailPress} activeOpacity={0.8}>
                <Feather name="mail" size={14} color="#FFF" />
                <Text style={styles.contactBtnText}>Gmail</Text>
                <Feather name="chevron-right" size={12} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.body}>
          {/* ── Account ──────────────────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(60).springify()}>
            <SectionLabel label="ACCOUNT" colors={colors} />
            <BlurView intensity={50} tint={colors.isDark ? 'dark' : 'light'} style={[styles.group, { backgroundColor: colors.isDark ? 'rgba(26,26,31,0.5)' : 'rgba(255,255,255,0.6)', borderColor: colors.border }]}>
              <SettingsRow
                title="Edit Profile"
                subtitle="Update your personal information"
                leftIcon="user"
                onPress={() => { router.back(); router.push('/edit-profile'); }}
              />
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
              <SettingsRow
                title="Identity Card"
                subtitle="View and manage your identity"
                leftIcon="credit-card"
                onPress={() => { router.back(); router.push('/(main)/cards'); }}
              />
            </BlurView>
          </Animated.View>

          {/* ── Verification status ───────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <SectionLabel label="VERIFICATION" colors={colors} />
            <BlurView intensity={50} tint={colors.isDark ? 'dark' : 'light'} style={[styles.group, { backgroundColor: colors.isDark ? 'rgba(26,26,31,0.5)' : 'rgba(255,255,255,0.6)', borderColor: colors.border }]}>
              <SettingsRow
                title="Mobile number"
                leftIcon="smartphone"
                showChevron={false}
                subtitle={
                  <View style={styles.verifiedValueContainer}>
                    <Text style={[typography.bodySm, { color: colors.isDark ? '#10B981' : '#059669', fontFamily: 'DMSans_600SemiBold' }]}>
                      {profile?.phone ?? session?.user.phone ?? 'Not verified'}
                    </Text>
                    {(session?.phoneVerified || profile?.phone_verified) && (
                      <View style={styles.verifiedBadge}>
                        <Feather name="check" size={8} color="#059669" />
                        <Text style={styles.verifiedBadgeText}>Verified</Text>
                      </View>
                    )}
                  </View>
                }
                rightElement={
                  <Feather
                    name={session?.phoneVerified || profile?.phone_verified ? 'check-circle' : 'alert-circle'}
                    size={22}
                    color={session?.phoneVerified || profile?.phone_verified ? '#059669' : colors.warning}
                  />
                }
              />

              <View style={[styles.separator, { backgroundColor: colors.border }]} />

              <SettingsRow
                title="Google / Gmail"
                leftIcon="mail"
                showChevron={false}
                subtitle={
                  <View style={styles.verifiedValueContainer}>
                    <Text style={[typography.bodySm, { color: colors.isDark ? '#10B981' : '#059669', fontFamily: 'DMSans_600SemiBold' }]}>
                      {profile?.email ?? session?.user.email ?? 'Not linked'}
                    </Text>
                    {(session?.emailVerified || profile?.email_verified) && (
                      <View style={styles.verifiedBadge}>
                        <Feather name="check" size={8} color="#059669" />
                        <Text style={styles.verifiedBadgeText}>Verified</Text>
                      </View>
                    )}
                  </View>
                }
                rightElement={
                  <Feather
                    name={session?.emailVerified || profile?.email_verified ? 'check-circle' : 'alert-circle'}
                    size={22}
                    color={session?.emailVerified || profile?.email_verified ? '#059669' : colors.warning}
                  />
                }
              />
            </BlurView>
          </Animated.View>

          {/* ── Portfolio ─────────────────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(140).springify()}>
            <SectionLabel label="PORTFOLIO" colors={colors} />
            <BlurView intensity={50} tint={colors.isDark ? 'dark' : 'light'} style={[styles.group, { backgroundColor: colors.isDark ? 'rgba(26,26,31,0.5)' : 'rgba(255,255,255,0.6)', borderColor: colors.border }]}>
              <SettingsRow
                title="FAQ"
                subtitle="Get answers to common questions"
                leftIcon="help-circle"
                onPress={() => router.push('/faq')}
              />
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
              <SettingsRow
                title="Privacy Policy"
                subtitle="Learn how we protect your data"
                leftIcon="shield"
                onPress={() => router.push('/privacy')}
              />
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
              <SettingsRow
                title="Terms of Service"
                subtitle="Read terms and conditions"
                leftIcon="file-text"
                onPress={() => router.push('/terms')}
              />
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
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionDot, { backgroundColor: '#059669' }]} />
      <Text style={[typography.overline, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
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

  hero: { paddingHorizontal: 24, paddingBottom: 24, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, ...shadow.lg },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  topBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarBorderRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  avatar: { width: 84, height: 84, borderRadius: 42, ...shadow.md },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.md,
  },
  avatarInitial: { fontFamily: 'DMSans_700Bold', fontSize: 36, color: '#FFFFFF' },
  checkmarkBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  heroName: { fontFamily: 'DMSans_700Bold', fontSize: 22, color: '#FFFFFF', letterSpacing: 0.5, textAlign: 'center' },
  heroHandle: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4, marginBottom: 16, textAlign: 'center' },
  
  contactRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginTop: 16 },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
  },
  contactBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: '#FFFFFF' },

  body: { paddingHorizontal: 20 },
  group: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', ...shadow.sm },
  separator: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },

  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowTextContainer: {
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },

  verifiedValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
    gap: 4,
  },
  verifiedBadgeText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 10,
    color: '#059669',
  },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, borderRadius: 16, borderWidth: 1.5,
  },
});
