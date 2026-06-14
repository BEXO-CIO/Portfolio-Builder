import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { typography, radius } from '@/constants/theme';
import { useProfileStore } from '@/stores/useProfileStore';
import { OnboardingShell } from '@/components/OnboardingShell';
import { ScreenHeader } from '@/components/ScreenHeader';
import { BexoButton } from '@/components/BexoButton';

const THEMES = [
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Clean and minimal. Your work front and centre.',
    bg: '#F7F5F0', accent: '#0D6B5C',
  },
  {
    id: 'studio',
    name: 'Studio',
    description: 'Dark and focused. Great for designers and engineers.',
    bg: '#1C1917', accent: '#C45C4A',
  },
  {
    id: 'canvas',
    name: 'Canvas',
    description: 'Warm and textured. Feels like a printed portfolio.',
    bg: '#F5EFE0', accent: '#6B4D0D',
  },
  {
    id: 'slate',
    name: 'Slate',
    description: 'Cool and structured. Sharp, like a resume.',
    bg: '#EFF2F7', accent: '#1E40AF',
  },
];

export default function ThemeStep() {
  const colors = useColors();
  const router = useRouter();
  const { profile, updateProfile, setOnboardingStep } = useProfileStore();
  const [selected, setSelected] = useState(profile?.portfolio_theme ?? 'editorial');

  const handleNext = () => {
    updateProfile({ portfolio_theme: selected });
    setOnboardingStep('font');
    router.push('/(onboarding)/font');
  };

  return (
    <OnboardingShell step="theme" onBack={() => router.back()}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Pick a theme" subtitle="You can always change this later from your portfolio settings." />
        {THEMES.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[
              styles.card,
              {
                borderColor: selected === t.id ? colors.primary : colors.border,
                borderRadius: radius.md,
                backgroundColor: colors.surface,
                borderWidth: selected === t.id ? 2 : 1.5,
              },
            ]}
            onPress={() => setSelected(t.id)}
            activeOpacity={0.85}
          >
            <View style={[styles.preview, { backgroundColor: t.bg, borderRadius: radius.sm }]}>
              <View style={[styles.previewAccent, { backgroundColor: t.accent }]} />
              <View style={[styles.previewBar, { backgroundColor: t.accent + '40' }]} />
              <View style={[styles.previewBarShort, { backgroundColor: t.accent + '20' }]} />
            </View>
            <View style={styles.info}>
              <Text style={[typography.body, { color: colors.foreground, fontFamily: 'DMSans_600SemiBold' }]}>{t.name}</Text>
              <Text style={[typography.bodySm, { color: colors.mutedForeground }]}>{t.description}</Text>
            </View>
            {selected === t.id ? (
              <View style={[styles.check, { backgroundColor: colors.primary, borderRadius: 12 }]}>
                <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ))}
        <View style={styles.footer}>
          <BexoButton label="Continue" onPress={handleNext} />
        </View>
      </ScrollView>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', padding: 12, marginBottom: 12, alignItems: 'center', gap: 12 },
  preview: { width: 72, height: 72, padding: 8, justifyContent: 'space-between' },
  previewAccent: { height: 10, borderRadius: 4, width: '50%' },
  previewBar: { height: 6, borderRadius: 3, width: '80%' },
  previewBarShort: { height: 6, borderRadius: 3, width: '60%' },
  info: { flex: 1, gap: 4 },
  check: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  footer: { paddingTop: 8, paddingBottom: 24 },
});
