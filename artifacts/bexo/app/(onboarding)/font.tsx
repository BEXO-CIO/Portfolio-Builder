import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { typography, radius } from '@/constants/theme';
import { useProfileStore } from '@/stores/useProfileStore';
import { OnboardingShell } from '@/components/OnboardingShell';
import { ScreenHeader } from '@/components/ScreenHeader';
import { BexoButton } from '@/components/BexoButton';

const FONTS = [
  { id: 'modern', name: 'Modern', sample: 'Your work, presented.', meta: 'Inter — clean and universal' },
  { id: 'humanist', name: 'Humanist', sample: 'Your work, presented.', meta: 'Poppins — friendly and approachable' },
  { id: 'editorial', name: 'Editorial', sample: 'Your work, presented.', meta: 'Space Grotesk — distinctive and sharp' },
  { id: 'geometric', name: 'Geometric', sample: 'Your work, presented.', meta: 'Montserrat — structured and bold' },
  { id: 'classic', name: 'Classic', sample: 'Your work, presented.', meta: 'Playfair Display — elegant and timeless' },
];

export default function FontStep() {
  const colors = useColors();
  const router = useRouter();
  const { profile, updateProfile, setOnboardingStep } = useProfileStore();
  const [selected, setSelected] = useState(profile?.portfolio_font ?? 'modern');

  const handleNext = () => {
    updateProfile({ portfolio_font: selected });
    setOnboardingStep('preference');
    router.push('/(onboarding)/preference');
  };

  return (
    <OnboardingShell step="font" onBack={() => router.back()}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Choose a font" subtitle="This sets the typographic feel of your live portfolio." />
        {FONTS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[
              styles.card,
              {
                borderColor: selected === f.id ? colors.primary : colors.border,
                borderRadius: radius.md,
                backgroundColor: colors.surface,
                borderWidth: selected === f.id ? 2 : 1.5,
              },
            ]}
            onPress={() => setSelected(f.id)}
            activeOpacity={0.85}
          >
            <View style={styles.textBlock}>
              <Text style={[typography.h3, { color: colors.foreground }]}>{f.sample}</Text>
              <Text style={[typography.caption, { color: colors.mutedForeground, marginTop: 4 }]}>{f.meta}</Text>
            </View>
            {selected === f.id ? (
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
  card: { padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  textBlock: { flex: 1 },
  check: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  footer: { paddingTop: 8, paddingBottom: 24 },
});
