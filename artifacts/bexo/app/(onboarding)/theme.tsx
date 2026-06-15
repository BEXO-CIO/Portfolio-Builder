import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { radius } from '@/constants/theme';
import { useProfileStore } from '@/stores/useProfileStore';
import { OnboardingShell } from '@/components/OnboardingShell';
import { ScreenHeader } from '@/components/ScreenHeader';
import { BexoButton } from '@/components/BexoButton';
import { SelectableCard } from '@/components/SelectableCard';

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

function ThemePreview({ bg, accent }: { bg: string; accent: string }) {
  return (
    <View style={[styles.preview, { backgroundColor: bg, borderRadius: radius.sm }]}>
      <View style={[styles.previewAccent, { backgroundColor: accent }]} />
      <View style={[styles.previewBar, { backgroundColor: accent + '40' }]} />
      <View style={[styles.previewBarShort, { backgroundColor: accent + '20' }]} />
    </View>
  );
}

export default function ThemeStep() {
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
          <SelectableCard
            key={t.id}
            selected={selected === t.id}
            onPress={() => setSelected(t.id)}
            title={t.name}
            subtitle={t.description}
            preview={<ThemePreview bg={t.bg} accent={t.accent} />}
          />
        ))}
        <View style={styles.footer}>
          <BexoButton label="Continue" onPress={handleNext} />
        </View>
      </ScrollView>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  preview: { width: 72, height: 72, padding: 8, justifyContent: 'space-between' },
  previewAccent: { height: 10, borderRadius: 4, width: '50%' },
  previewBar: { height: 6, borderRadius: 3, width: '80%' },
  previewBarShort: { height: 6, borderRadius: 3, width: '60%' },
  footer: { paddingTop: 8, paddingBottom: 24 },
});
