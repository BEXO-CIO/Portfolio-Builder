import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography, spacing, radius, shadow } from '@/constants/theme';
import { useProfileStore } from '@/stores/useProfileStore';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { ProgressRing } from '@/components/ProgressRing';
import { BuildStatusCard } from '@/components/BuildStatusCard';
import { ProfileActionStrip } from '@/components/ProfileActionStrip';
import { EmptyState } from '@/components/EmptyState';

export default function DashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, education, experiences, projects, skills, getCompleteness } = useProfileStore();
  const { buildStatus, portfolioUrl, updates } = usePortfolioStore();
  const completeness = getCompleteness();

  useEffect(() => {
    if (completeness < 90 && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, []);

  const topPad = Platform.OS === 'web' ? 67 : insets.top + 12;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.scroll, { paddingTop: topPad, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={[typography.h2, { color: colors.foreground, letterSpacing: -0.4 }]}>
            {getGreeting()}, {profile?.full_name?.split(' ')[0] ?? 'there'}.
          </Text>
          <Text style={[typography.body, { color: colors.mutedForeground, marginTop: 4 }]}>
            {completeness >= 90 ? 'Your portfolio is live.' : `${Math.round(completeness)}% to your live site`}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/settings')} hitSlop={12}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={[styles.avatar, { borderRadius: 20, borderColor: colors.border }]} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.muted, borderRadius: 20 }]}>
              <Feather name="user" size={20} color={colors.mutedForeground} />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Completeness card */}
      {completeness < 90 ? (
        <Animated.View entering={FadeInDown.delay(60).springify()}>
          <View style={[styles.completenessCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
            <View style={styles.completenessRow}>
              <ProgressRing percent={completeness} size={64} strokeWidth={5} />
              <View style={styles.completenessText}>
                <Text style={[typography.h3, { color: colors.foreground }]}>
                  {100 - Math.round(completeness)}% left to go
                </Text>
                <Text style={[typography.body, { color: colors.mutedForeground, marginTop: 4 }]}>
                  {getMissingHint(completeness, experiences.length, education.length, projects.length, skills.length)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.completeBtn, { backgroundColor: colors.primary, borderRadius: radius.sm }]}
              onPress={() => router.push('/edit-profile')}
            >
              <Text style={[typography.body, { color: colors.primaryForeground, fontFamily: 'DMSans_600SemiBold' }]}>
                Complete profile
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : null}

      {/* Build status */}
      {buildStatus ? (
        <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.section}>
          <BuildStatusCard status={buildStatus} portfolioUrl={portfolioUrl} />
        </Animated.View>
      ) : null}

      {/* Quick actions */}
      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.section}>
        <ProfileActionStrip
          actions={[
            { icon: 'edit-2', label: 'Edit profile', onPress: () => router.push('/edit-profile') },
            { icon: 'share-2', label: 'Share link', onPress: () => {} },
            { icon: 'settings', label: 'Settings', onPress: () => router.push('/settings') },
          ]}
        />
      </Animated.View>

      {/* Stats row */}
      <Animated.View entering={FadeInDown.delay(120).springify()} style={[styles.statsRow]}>
        <StatBox label="Experience" value={experiences.length} icon="briefcase" colors={colors} />
        <StatBox label="Projects" value={projects.length} icon="code" colors={colors} />
        <StatBox label="Skills" value={skills.length} icon="zap" colors={colors} />
      </Animated.View>

      {/* Experience alert */}
      {experiences.length === 0 ? (
        <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.section}>
          <View style={[styles.alert, { backgroundColor: colors.warning + '12', borderColor: colors.warning + '30', borderRadius: radius.md }]}>
            <Feather name="upload" size={18} color={colors.warning} />
            <Text style={[typography.body, { color: colors.warning, flex: 1, marginLeft: 10 }]}>
              Upload your resume PDF to add work experience and unlock your portfolio.
            </Text>
          </View>
        </Animated.View>
      ) : null}

      {/* Recent updates */}
      <Animated.View entering={FadeInDown.delay(160).springify()} style={styles.section}>
        <Text style={[typography.label, { color: colors.mutedForeground, letterSpacing: 0.5, marginBottom: 12 }]}>
          RECENT UPDATES
        </Text>
        {updates.length === 0 ? (
          <EmptyState icon="activity" title="No updates yet" message="Post an achievement, new role, or project from the Post tab." />
        ) : (
          updates.slice(0, 5).map((u) => (
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
    </ScrollView>
  );
}

function StatBox({ label, value, icon, colors }: { label: string; value: number; icon: string; colors: any }) {
  return (
    <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
      <Text style={[typography.h2, { color: colors.primary, fontFamily: 'JetBrainsMono_700Bold' }]}>{value}</Text>
      <Text style={[typography.caption, { color: colors.mutedForeground, marginTop: 2 }]}>{label}</Text>
    </View>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function getMissingHint(pct: number, exp: number, edu: number, proj: number, skills: number) {
  if (exp === 0) return 'Add at least one work experience.';
  if (edu === 0) return 'Add your education to continue.';
  if (proj === 0) return 'Add a project to show what you build.';
  if (skills < 3) return 'Add 3+ skills to complete your profile.';
  return 'A few more details will get you there.';
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

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  headerText: { flex: 1 },
  avatar: { width: 44, height: 44, borderWidth: 1.5 },
  avatarPlaceholder: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  section: { marginBottom: 20 },
  completenessCard: { padding: 16, borderWidth: 1.5, marginBottom: 20, gap: 12 },
  completenessRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  completenessText: { flex: 1 },
  completeBtn: { paddingVertical: 12, alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, padding: 14, alignItems: 'center', borderWidth: 1.5 },
  alert: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1 },
  updateRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12, alignItems: 'flex-start' },
  updateDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  updateText: { flex: 1 },
});
