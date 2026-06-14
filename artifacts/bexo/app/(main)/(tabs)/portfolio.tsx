import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, RefreshControl } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography, spacing, radius } from '@/constants/theme';
import { useProfileStore } from '@/stores/useProfileStore';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { ProgressRing } from '@/components/ProgressRing';
import { ListRow } from '@/components/ListRow';
import { BexoButton } from '@/components/BexoButton';
import { EmptyState } from '@/components/EmptyState';

export default function PortfolioScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, education, experiences, projects, skills, research, getCompleteness } = useProfileStore();
  const { buildStatus, portfolioUrl, triggerBuild } = usePortfolioStore();
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.scroll, { paddingTop: topPad, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          progressViewOffset={topPad}
        />
      }
    >
      <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.header}>
        <Text style={[typography.h2, { color: colors.foreground, letterSpacing: -0.4 }]}>Portfolio</Text>
        <View style={styles.headerRight}>
          <ProgressRing percent={completeness} size={44} strokeWidth={4} />
          <TouchableOpacity onPress={() => router.push('/(main)/cards')} style={[styles.editBtn, { borderColor: colors.border, borderRadius: radius.sm }]}>
            <Feather name="edit-2" size={16} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Live URL card */}
      <Animated.View entering={FadeInDown.delay(60).springify()}>
        <View style={[styles.urlCard, { backgroundColor: buildStatus === 'done' ? colors.success + '10' : colors.muted, borderColor: buildStatus === 'done' ? colors.success + '30' : colors.border, borderRadius: radius.md }]}>
          <Feather name={buildStatus === 'done' ? 'globe' : 'lock'} size={18} color={buildStatus === 'done' ? colors.success : colors.mutedForeground} />
          <View style={styles.urlText}>
            {buildStatus === 'done' && portfolioUrl ? (
              <>
                <Text style={[typography.body, { color: colors.success, fontFamily: 'DMSans_600SemiBold' }]}>Live</Text>
                <Text style={[typography.bodySm, { color: colors.success }]}>{portfolioUrl}</Text>
              </>
            ) : (
              <>
                <Text style={[typography.body, { color: colors.mutedForeground, fontFamily: 'DMSans_600SemiBold' }]}>
                  {profile?.handle ? `${profile.handle}.mybexo.com` : 'yourhandle.mybexo.com'}
                </Text>
                <Text style={[typography.caption, { color: colors.mutedForeground }]}>
                  {completeness >= 90 ? 'Ready to build' : `${Math.round(completeness)}% — needs 90% to go live`}
                </Text>
              </>
            )}
          </View>
          {completeness >= 90 && buildStatus !== 'done' ? (
            <TouchableOpacity
              onPress={() => triggerBuild(profile?.handle ?? 'user')}
              style={[styles.buildBtn, { backgroundColor: colors.primary, borderRadius: 8 }]}
            >
              <Text style={[typography.caption, { color: colors.primaryForeground, fontFamily: 'DMSans_600SemiBold' }]}>
                {buildStatus === 'building' ? 'Building…' : 'Build'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </Animated.View>

      {/* Sections */}
      <Section title="Experience" delay={80} onAdd={() => router.push('/edit-profile')}>
        {experiences.length === 0 ? (
          <EmptyState icon="briefcase" title="No experience yet" actionLabel="Add experience" onAction={() => router.push('/edit-profile')} />
        ) : (
          experiences.map((e) => (
            <Card key={e.id} icon="briefcase" title={e.role} subtitle={e.company} meta={`${e.start_date.slice(0, 4)}${e.is_current ? '–Present' : ''}`} onPress={() => router.push('/edit-profile')} />
          ))
        )}
      </Section>

      <Section title="Education" delay={100} onAdd={() => router.push('/edit-profile')}>
        {education.length === 0 ? (
          <EmptyState icon="book" title="No education yet" actionLabel="Add education" onAction={() => router.push('/edit-profile')} />
        ) : (
          education.map((e) => (
            <Card key={e.id} icon="book-open" title={e.degree} subtitle={e.institution} meta={`${e.start_year}–${e.end_year ?? 'Present'}`} onPress={() => router.push('/edit-profile')} />
          ))
        )}
      </Section>

      <Section title="Projects" delay={120} onAdd={() => router.push('/edit-profile')}>
        {projects.length === 0 ? (
          <EmptyState icon="code" title="No projects yet" actionLabel="Add project" onAction={() => router.push('/edit-profile')} />
        ) : (
          projects.map((p) => (
            <Card key={p.id} icon="terminal" title={p.title} subtitle={p.tech_stack.join(', ')} onPress={() => router.push('/edit-profile')} />
          ))
        )}
      </Section>

      <Section title="Skills" delay={140}>
        <View style={styles.chips}>
          {skills.map((s) => (
            <View key={s.id} style={[styles.chip, { backgroundColor: colors.primary + '15', borderRadius: 8 }]}>
              <Text style={[typography.bodySm, { color: colors.primary }]}>{s.name}</Text>
            </View>
          ))}
          {skills.length === 0 ? (
            <Text style={[typography.body, { color: colors.mutedForeground }]}>No skills added yet.</Text>
          ) : null}
        </View>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children, delay, onAdd }: { title: string; children: React.ReactNode; delay: number; onAdd?: () => void }) {
  const colors = useColors();
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[typography.label, { color: colors.mutedForeground, letterSpacing: 0.5 }]}>
          {title.toUpperCase()}
        </Text>
        {onAdd ? (
          <TouchableOpacity onPress={onAdd} hitSlop={12} style={[styles.addBtn, { backgroundColor: colors.primary + '15' }]}>
            <Feather name="plus" size={16} color={colors.primary} />
          </TouchableOpacity>
        ) : null}
      </View>
      {children}
    </Animated.View>
  );
}

function Card({ icon, title, subtitle, meta, onPress }: { icon: keyof typeof Feather.glyphMap, title: string, subtitle: string, meta?: string, onPress: () => void }) {
  const colors = useColors();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.cardIcon, { backgroundColor: colors.primary + '15' }]}>
        <Feather name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.cardContent}>
        <Text style={[typography.body, { color: colors.foreground, fontFamily: 'DMSans_600SemiBold' }]}>{title}</Text>
        <Text style={[typography.bodySm, { color: colors.mutedForeground, marginTop: 2 }]}>{subtitle}</Text>
      </View>
      {meta ? (
        <Text style={[typography.caption, { color: colors.mutedForeground }]}>{meta}</Text>
      ) : (
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  editBtn: { padding: 8, borderWidth: 1.5 },
  urlCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1.5, marginBottom: 24, gap: 12 },
  urlText: { flex: 1 },
  buildBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
});
