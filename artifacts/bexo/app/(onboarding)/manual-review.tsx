import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { typography, spacing } from '@/constants/theme';
import { useProfileStore } from '@/stores/useProfileStore';
import { OnboardingShell } from '@/components/OnboardingShell';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ListRow } from '@/components/ListRow';
import { BexoButton } from '@/components/BexoButton';
import { EmptyState } from '@/components/EmptyState';

export default function ManualReviewStep() {
  const colors = useColors();
  const router = useRouter();
  const { education, experiences, projects, skills, removeEducation, removeExperience, removeProject, removeSkill, setOnboardingStep } = useProfileStore();

  const handleContinue = () => {
    setOnboardingStep('cards');
    router.replace('/(onboarding)/cards');
  };

  return (
    <OnboardingShell step="manual_review" onBack={() => router.back()}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Review your details" subtitle="Edit or remove entries before we build your portfolio." />

        <SectionTitle label="Education" color={colors.foreground} />
        {education.length === 0 ? (
          <EmptyState icon="book" title="No education added" />
        ) : (
          education.map((e) => (
            <ListRow
              key={e.id}
              title={`${e.degree} in ${e.field}`}
              subtitle={`${e.institution} · ${e.start_year}–${e.end_year ?? 'Present'}`}
              onDelete={() => removeEducation(e.id)}
            />
          ))
        )}

        <SectionTitle label="Experience" color={colors.foreground} />
        {experiences.length === 0 ? (
          <EmptyState icon="briefcase" title="No experience added" />
        ) : (
          experiences.map((e) => (
            <ListRow
              key={e.id}
              title={e.role}
              subtitle={`${e.company} · ${e.start_date.slice(0, 4)}${e.is_current ? '–Present' : ''}`}
              onDelete={() => removeExperience(e.id)}
            />
          ))
        )}

        <SectionTitle label="Projects" color={colors.foreground} />
        {projects.length === 0 ? (
          <EmptyState icon="code" title="No projects added" />
        ) : (
          projects.map((p) => (
            <ListRow
              key={p.id}
              title={p.title}
              subtitle={p.tech_stack.join(', ')}
              onDelete={() => removeProject(p.id)}
            />
          ))
        )}

        <SectionTitle label="Skills" color={colors.foreground} />
        <View style={styles.skillChips}>
          {skills.map((s) => (
            <View key={s.id} style={[styles.chip, { backgroundColor: colors.muted, borderRadius: 8 }]}>
              <Text style={[typography.bodySm, { color: colors.foreground }]}>{s.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <BexoButton label="Looks good — continue" onPress={handleContinue} />
          <BexoButton label="Go back and edit" onPress={() => router.back()} variant="ghost" />
        </View>
      </ScrollView>
    </OnboardingShell>
  );
}

function SectionTitle({ label, color }: { label: string; color: string }) {
  return (
    <Text style={[typography.label, { color, marginTop: 20, marginBottom: 4, letterSpacing: 0.5 }]}>
      {label.toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  skillChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6 },
  footer: { gap: 8, paddingVertical: 24 },
});
