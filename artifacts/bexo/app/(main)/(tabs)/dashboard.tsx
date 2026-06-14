import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated as RNAnimated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography, spacing, radius, shadow, springs } from '@/constants/theme';
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
    <Animated.View
      entering={FadeInDown.delay(delay * 60).springify()}
      style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.statIconWrap, { backgroundColor: colors.primaryLight }]}>
        <Feather name={icon as any} size={16} color={colors.primary} />
      </View>
      <RNAnimated.Text style={[typography.h2, { color: colors.primary, fontFamily: 'JetBrainsMono_700Bold', marginTop: 10, marginBottom: 2 }]}>
        {value}
      </RNAnimated.Text>
      <Text style={[typography.caption, { color: colors.mutedForeground }]}>{label}</Text>
    </Animated.View>
  );
}

// ── Verification badges ───────────────────────────────────────────────────────

function VerifiedBadge({ icon, label, done, colors }: { icon: string; label: string; done: boolean; colors: any }) {
  return (
    <View style={[styles.badge, {
      backgroundColor: done ? colors.primaryLight : colors.muted,
      borderColor: done ? colors.primary + '30' : colors.border,
    }]}>
      <Feather name={icon as any} size={12} color={done ? colors.primary : colors.mutedForeground} />
      <Text style={[typography.caption, { color: done ? colors.primary : colors.mutedForeground, marginLeft: 4, fontFamily: done ? 'DMSans_600SemiBold' : 'DMSans_400Regular' }]}>
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

  const firstName = profile?.full_name?.split(' ')[0] ?? session?.user.displayName?.split(' ')[0] ?? 'there';
  const avatarUrl = profile?.avatar_url ?? session?.user.photoURL;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero gradient header ────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(0).springify()}>
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
                    <View style={styles.liveDot} />
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
                <VerifiedBadge icon="smartphone" label="Phone" done={!!session?.phoneVerified} colors={{ ...colors, primary: '#FFFFFF', primaryLight: 'rgba(255,255,255,0.20)', border: 'rgba(255,255,255,0.20)', mutedForeground: 'rgba(255,255,255,0.55)' }} />
                <VerifiedBadge icon="mail" label="Email" done={!!session?.emailVerified} colors={{ ...colors, primary: '#FFFFFF', primaryLight: 'rgba(255,255,255,0.20)', border: 'rgba(255,255,255,0.20)', mutedForeground: 'rgba(255,255,255,0.55)' }} />
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
            <View style={[styles.completenessCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
            </View>
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

        {/* ── Quick actions strip ─────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.actionsRow}>
          {[
            { icon: 'edit-2', label: 'Edit', onPress: () => router.push('/edit-profile') },
            { icon: 'share-2', label: 'Share', onPress: () => {} },
            { icon: 'eye', label: 'Preview', onPress: () => router.push('/(main)/(tabs)/portfolio') },
            { icon: 'settings', label: 'Settings', onPress: () => router.push('/settings') },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); a.onPress(); }}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: colors.primaryLight }]}>
                <Feather name={a.icon as any} size={16} color={colors.primary} />
              </View>
              <Text style={[typography.caption, { color: colors.foreground, marginTop: 6, fontFamily: 'DMSans_500Medium' }]}>
                {a.label}
              </Text>
            </TouchableOpacity>
          ))}
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
    </ScrollView>
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
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  heroText: { flex: 1, paddingRight: 16 },
  greeting: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  heroName: { fontFamily: 'DMSans_700Bold', fontSize: 32, color: '#FFFFFF', letterSpacing: -0.8, lineHeight: 38 },
  statusRow: { marginTop: 8 },
  heroSub: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.72)' },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80' },
  livePillText: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: '#4ADE80' },
  badgesRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  badge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },
  avatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.4)' },
  avatarPlaceholder: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarInitial: { fontFamily: 'DMSans_700Bold', fontSize: 22, color: '#FFFFFF' },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20 },
  progressTrack: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.20)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 2 },
  progressLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: 'rgba(255,255,255,0.85)' },

  body: { paddingHorizontal: 20, paddingTop: 20 },
  completenessCard: { borderRadius: 16, borderWidth: 1.5, padding: 18, marginBottom: 16, gap: 14 },
  completenessRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  completenessText: { flex: 1 },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: 12 },

  urlChip: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1.5, marginBottom: 16 },

  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  actionIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, padding: 14, alignItems: 'center', borderRadius: 14, borderWidth: 1.5 },
  statIconWrap: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

  alertCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 20 },

  section: { marginBottom: 20 },
  updateRow: { flexDirection: 'row', paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12, alignItems: 'flex-start' },
  updateDot: { width: 8, height: 8, borderRadius: 4, marginTop: 7 },
  updateText: { flex: 1 },
});
