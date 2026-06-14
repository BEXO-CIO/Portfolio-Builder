import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { typography } from '@/constants/theme';
import { useProfileStore } from '@/stores/useProfileStore';
import { OnboardingShell } from '@/components/OnboardingShell';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SkillTag } from '@/components/SkillTag';
import { BexoButton } from '@/components/BexoButton';

const VIBES = [
  'Minimal', 'Bold', 'Warm', 'Technical', 'Creative',
  'Professional', 'Playful', 'Clean', 'Experimental', 'Classic',
];

export default function PreferenceStep() {
  const colors = useColors();
  const router = useRouter();
  const { updateProfile, setOnboardingStep } = useProfileStore();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (v: string) => {
    setSelected((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  };

  const handleNext = () => {
    if (selected.length > 0) {
      updateProfile({ website_preference: selected.join(',') });
    }
    setOnboardingStep('generating');
    router.push('/(onboarding)/generating');
  };

  return (
    <OnboardingShell step="preference" onBack={() => router.back()}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="What's your vibe?"
          subtitle="Pick words that describe how you want your portfolio to feel. Choose as many as you like."
        />
        <View style={styles.grid}>
          {VIBES.map((v) => (
            <SkillTag
              key={v}
              label={v}
              selected={selected.includes(v)}
              onPress={() => toggle(v)}
            />
          ))}
        </View>
        <View style={styles.footer}>
          <BexoButton label="Build my portfolio" onPress={handleNext} />
          {selected.length === 0 ? (
            <BexoButton label="Skip" onPress={handleNext} variant="ghost" />
          ) : null}
        </View>
      </ScrollView>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  footer: { gap: 8, paddingTop: 16, paddingBottom: 24 },
});
