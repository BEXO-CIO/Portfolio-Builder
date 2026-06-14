import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated as RNAnimated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import Animated, { FadeInDown, interpolate, Extrapolation, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography, spacing, radius, shadow } from '@/constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { ProgressRing } from '@/components/ProgressRing';
import { EmptyState } from '@/components/EmptyState';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Animated count-up StatBox ─────────────────────────────────────────────────

function StatBox({ label, value, icon, colors, delay }: {
  label: string; value: number; icon: string; colors: any; delay: number;
}) {
  const animVal = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.timing(animVal, {
      toValue: value,
      duration: 600,
      delay: delay * 80,
      useNativeDriver: false,
    }).start();
  }, [value]);

  return (
    <Animated.View entering={FadeInDown.delay(delay * 60).springify()} style={{ flex: 1 }}>
      <BlurView
        intensity={60}
        tint={colors.isDark ? 'dark' : 'light'}
        style={[styles.statBox, { backgroundColor: colors.isDark ? 'rgba(26,26,31,0.6)' : 'rgba(255,255,255,0.7)', borderColor: colors.border }]}
      >
        <View style={[styles.statIconWrap, { backgroundColor: colors.primaryLight }]}>
          <Feather name={icon as any} size={16} color={colors.primary} />
        </View>
        <RNAnimated.Text style={[typography.h2, { color: colors.primary, fontFamily: 'JetBrainsMono_700Bold', marginTop: 10, marginBottom: 2 }]}>
          {value}
        </RNAnimated.Text>
        <Text style={[typography.caption, { color: colors.mutedForeground }]}>{label}</Text>
      </BlurView>
    </Animated.View>
  );
}

// ── Verification badges ───────────────────────────────────────────────────────

function VerifiedBadge({ icon, label, done, colors }: { icon: string; label: string; done: boolean; colors: any }) {
  return (
    <View style={[styles.badge, {
      backgroundColor: done ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.05)',
      borderColor: done ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.1)',
    }]}>
      <Feather name={icon as any} size={12} color={done ? '#FFFFFF' : 'rgba(255,255,255,0.5)'} />
      <Text style={[typography.caption, { color: done ? '#FFFFFF' : 'rgba(255,255,255,0.5)', marginLeft: 4, fontFamily: done ? 'DMSans_600SemiBold' : 'DMSans_400Regular' }]}>
        {label}
      </Text>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuthStore();
  const { profile, education, experiences, projects, skills, updates, getCompleteness } = useProfileStore();
  const { buildStatus, portfolioUrl } = usePortfolioStore();
  const completeness = getCompleteness();
  const topPad = Platform.OS === 'web' ? 67 : insets.top + 12;

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (profile?.user_id) {
      useProfileStore.getState().startSync(profile.user_id);
    }
    setTimeout(() => setRefreshing(false), 1500);
  }, [profile?.user_id]);

  const firstName = profile?.full_name?.split(' ')[0] ?? session?.user.displayName?.split(' ')[0] ?? 'there';
  const avatarUrl = profile?.avatar_url ?? session?.user.photoURL;

  // Pulse animation for status
  const pulseAnim = useSharedValue(1);
  useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: interpolate(pulseAnim.value, [1, 1.4], [1, 0.4]),
  }));

  // Scroll animation
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const headerHeight = 260 + topPad;

  const stickyHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [headerHeight - 100, headerHeight - 40], [0, 1], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [headerHeight - 100, headerHeight - 40], [-20, 0], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  const heroStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, headerHeight - 100], [1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, headerHeight], [0, -headerHeight * 0.4], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Background trick to fix overscroll top color */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 400, backgroundColor: colors.gradientHero[0] }} />
      {/* Sticky Blurred Header */}
      <Animated.View style={[styles.stickyHeader, { height: topPad + 44, paddingTop: topPad }, stickyHeaderStyle]}>
        <BlurView intensity={80} tint={colors.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFillObject} />
        <View style={styles.stickyHeaderContent}>
          <Text style={[typography.h3, { color: colors.foreground }]}>{getGreeting()}, {firstName}</Text>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.stickyAvatar} /> : <View style={styles.stickyAvatar} />}
          </TouchableOpacity>
        </View>
        <View style={[styles.stickyBorder, { backgroundColor: colors.border }]} />
      </Animated.View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
            progressViewOffset={topPad + 20}
          />
        }
      >
        {/* ── Hero gradient header ────────────────────────────────────────────── */}
        <Animated.View style={heroStyle}>
          <LinearGradient
            colors={colors.gradientHero}
            style={[styles.hero, { paddingTop: topPad }]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroRow}>
              <View style={styles.heroText}>
                <Text style={styles.greeting}>{getGreeting()}</Text>
                <Text style={styles.heroName}>{firstName}.</Text>

                {/* Portfolio status indicator */}
                <View style={styles.statusRow}>
                  {buildStatus === 'done' ? (
                    <View style={styles.livePill}>
                      <View style={{ position: 'relative', width: 8, height: 8, marginRight: 6 }}>
                        <Animated.View style={[styles.liveDot, { position: 'absolute', backgroundColor: '#4ADE80' }, pulseStyle]} />
                        <View style={[styles.liveDot, { backgroundColor: '#4ADE80' }]} />
                      </View>
                      <Text style={styles.livePillText}>Portfolio live</Text>
                    </View>
                  ) : (
                    <Text style={styles.heroSub}>
                      {completeness >= 90 ? 'Ready to launch 🚀' : `${Math.round(completeness)}% complete`}
                    </Text>
                  )}
                </View>

                {/* Verification badges */}
                <View style={styles.badgesRow}>
                  <VerifiedBadge icon="smartphone" label="Phone" done={!!session?.phoneVerified} colors={colors} />
                  <VerifiedBadge icon="mail" label="Email" done={!!session?.emailVerified} colors={colors} />
                </View>
              </View>

              {/* Avatar */}
              <TouchableOpacity onPress={() => router.push('/settings')} hitSlop={8}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>
                      {firstName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Progress bar */}
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${completeness}%` as any }]} />
              </View>
              <Text style={styles.progressLabel}>{Math.round(completeness)}%</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.body}>

          {/* ── Completeness card ──────────────────────────────────────────────── */}
          {completeness < 90 ? (
            <Animated.View entering={FadeInDown.delay(60).springify()}>
              <BlurView intensity={40} tint={colors.isDark ? 'dark' : 'light'} style={[styles.completenessCard, { backgroundColor: colors.isDark ? 'rgba(26,26,31,0.5)' : 'rgba(255,255,255,0.6)', borderColor: colors.border }]}>
                <View style={styles.completenessRow}>
                  <ProgressRing percent={completeness} size={60} strokeWidth={5} />
                  <View style={styles.completenessText}>
                    <Text style={[typography.h3, { color: colors.foreground }]}>
                      {100 - Math.round(completeness)}% left to go
                    </Text>
                    <Text style={[typography.bodySm, { color: colors.mutedForeground, marginTop: 4 }]}>
                      {getMissingHint(experiences.length, education.length, projects.length, skills.length)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.completeBtn, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/edit-profile')}
                >
                  <Feather name="edit-2" size={16} color="#FFFFFF" />
                  <Text style={[typography.body, { color: '#FFFFFF', fontFamily: 'DMSans_600SemiBold', marginLeft: 8 }]}>
                    Complete profile
                  </Text>
                </TouchableOpacity>
              </BlurView>
            </Animated.View>
          ) : null}

          {/* ── Portfolio URL chip ─────────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(80).springify()}>
            <Pressable
              style={[styles.urlChip, {
                backgroundColor: buildStatus === 'done' ? colors.successLight : colors.muted,
                borderColor: buildStatus === 'done' ? colors.success + '40' : colors.border,
              }]}
              onPress={() => router.push('/(main)/(tabs)/portfolio')}
            >
              <Feather
                name={buildStatus === 'done' ? 'globe' : 'lock'}
                size={16}
                color={buildStatus === 'done' ? colors.success : colors.mutedForeground}
              />
              <Text style={[typography.bodySm, {
                color: buildStatus === 'done' ? colors.success : colors.mutedForeground,
                flex: 1,
                fontFamily: 'DMSans_500Medium',
                marginLeft: 10,
              }]}>
                {buildStatus === 'done' && portfolioUrl
                  ? portfolioUrl
                  : profile?.handle ? `${profile.handle}.mybexo.com` : 'yourhandle.mybexo.com'}
              </Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </Pressable>
          </Animated.View>


          {/* ── Stats ──────────────────────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(120).springify()} style={styles.statsRow}>
            <StatBox label="Experience" value={experiences.length} icon="briefcase" colors={colors} delay={1} />
            <StatBox label="Projects" value={projects.length} icon="code" colors={colors} delay={2} />
            <StatBox label="Skills" value={skills.length} icon="zap" colors={colors} delay={3} />
          </Animated.View>

          {/* ── Experience alert ────────────────────────────────────────────────── */}
          {experiences.length === 0 ? (
            <Animated.View entering={FadeInDown.delay(140).springify()}>
              <Pressable
                style={[styles.alertCard, { backgroundColor: colors.warningLight, borderColor: colors.warning + '30' }]}
                onPress={() => router.push('/(onboarding)/resume')}
              >
                <Feather name="upload-cloud" size={20} color={colors.warning} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[typography.body, { color: colors.warning, fontFamily: 'DMSans_600SemiBold' }]}>
                    Upload your resume
                  </Text>
                  <Text style={[typography.caption, { color: colors.warning, marginTop: 2 }]}>
                    Auto-fill experience, education & skills in seconds.
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.warning} />
              </Pressable>
            </Animated.View>
          ) : null}

          {/* ── Recent updates ──────────────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(160).springify()} style={styles.section}>
            <Text style={[typography.overline, { color: colors.mutedForeground, marginBottom: 14 }]}>
              RECENT UPDATES
            </Text>
            {updates?.length === 0 || !updates ? (
              <EmptyState
                icon="activity"
                title="No updates yet"
                message="Post an achievement, new role, or project from the Post tab."
              />
            ) : (
              (updates as any[]).slice(0, 5).map((u: any) => (
                <View key={u.id} style={[styles.updateRow, { borderBottomColor: colors.border }]}>
                  <View style={[styles.updateDot, { backgroundColor: colors.primary }]} />
                  <View style={styles.updateText}>
                    <Text style={[typography.body, { color: colors.foreground, fontFamily: 'DMSans_500Medium' }]}>{u.title}</Text>
                    <Text style={[typography.caption, { color: colors.mutedForeground, marginTop: 2 }]}>
                      {u.type} · {formatRelative(u.created_at)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </Animated.View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

function getMissingHint(exp: number, edu: number, proj: number, skills: number) {
  if (exp === 0) return 'Add at least one work experience to continue.';
  if (edu === 0) return 'Add your education details.';
  if (proj === 0) return 'Add a project to show what you build.';
  if (skills < 3) return 'Add 3+ skills to complete your profile.';
  return 'A few more details will get you to launch.';
}

const styles = StyleSheet.create({
  scroll: {},
  stickyHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 100,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stickyHeaderContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: -4 },
  stickyAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.1)' },
  stickyBorder: { position: 'absolute', bottom: 0, left: 0, right: 0, height: StyleSheet.hairlineWidth },

  hero: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...shadow.lg,
  },
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  heroText: { flex: 1, paddingRight: 16 },
  greeting: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  heroName: { fontFamily: 'DMSans_700Bold', fontSize: 32, color: '#FFFFFF', letterSpacing: -0.8, lineHeight: 38 },
  statusRow: { marginTop: 8 },
  heroSub: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.72)' },
  livePill: { flexDirection: 'row', alignItems: 'center' },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  livePillText: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: '#4ADE80' },
  badgesRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  badge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.4)', ...shadow.md },
  avatarPlaceholder: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarInitial: { fontFamily: 'DMSans_700Bold', fontSize: 24, color: '#FFFFFF' },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 24 },
  progressTrack: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.20)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 2 },
  progressLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: 'rgba(255,255,255,0.85)' },

  body: { paddingHorizontal: 20, paddingTop: 20 },
  completenessCard: { borderRadius: 16, borderWidth: 1.5, padding: 18, marginBottom: 16, gap: 14, overflow: 'hidden' },
  completenessRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  completenessText: { flex: 1 },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: 12 },

  urlChip: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1.5, marginBottom: 16 },

  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  actionBtn: { flex: 1, borderRadius: 14, borderWidth: 1.5, overflow: 'hidden', ...shadow.sm },
  actionIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, padding: 14, alignItems: 'center', borderRadius: 14, borderWidth: 1.5, overflow: 'hidden', ...shadow.sm },
  statIconWrap: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

  alertCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 20 },

  section: { marginBottom: 20 },
  updateRow: { flexDirection: 'row', paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12, alignItems: 'flex-start' },
  updateDot: { width: 8, height: 8, borderRadius: 4, marginTop: 7 },
  updateText: { flex: 1 },
});
