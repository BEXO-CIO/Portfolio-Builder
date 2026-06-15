import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Font from 'expo-font';

import { useColors } from '@/hooks/useColors';
import { typography } from '@/constants/theme';
import { useProfileStore } from '@/stores/useProfileStore';
import { OnboardingShell } from '@/components/OnboardingShell';
import { ScreenHeader } from '@/components/ScreenHeader';
import { BexoButton } from '@/components/BexoButton';
import { SelectableCard } from '@/components/SelectableCard';

const FONT_MAP: Record<string, string> = {
  modern: 'Inter_700Bold',
  humanist: 'Poppins_700Bold',
  editorial: 'SpaceGrotesk_700Bold',
  geometric: 'Montserrat_700Bold',
  classic: 'PlayfairDisplay_700Bold',
};

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
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Font.loadAsync({
          Inter_700Bold: require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
          Poppins_700Bold: require('@expo-google-fonts/poppins/700Bold/Poppins_700Bold.ttf'),
          SpaceGrotesk_700Bold: require('@expo-google-fonts/space-grotesk/700Bold/SpaceGrotesk_700Bold.ttf'),
          Montserrat_700Bold: require('@expo-google-fonts/montserrat/700Bold/Montserrat_700Bold.ttf'),
          PlayfairDisplay_700Bold: require('@expo-google-fonts/playfair-display/700Bold/PlayfairDisplay_700Bold.ttf'),
        });
        if (!cancelled) setFontsLoaded(true);
      } catch (err) {
        // If font loading fails, proceed without custom fonts
        console.warn('[FontStep] Failed to load preview fonts:', err);
        if (!cancelled) setFontsLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleNext = () => {
    updateProfile({ portfolio_font: selected });
    setOnboardingStep('preference');
    router.push('/(onboarding)/preference');
  };

  return (
    <OnboardingShell step="font" onBack={() => router.back()}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Choose a font" subtitle="This sets the typographic feel of your live portfolio." />
        {!fontsLoaded ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[typography.bodySm, { color: colors.mutedForeground, marginTop: 8 }]}>
              Loading font previews…
            </Text>
          </View>
        ) : (
          FONTS.map((f) => (
            <SelectableCard
              key={f.id}
              selected={selected === f.id}
              onPress={() => setSelected(f.id)}
              title={f.name}
              subtitle={f.meta}
              content={
                <View style={styles.fontContent}>
                  <Text
                    style={[
                      styles.sampleText,
                      {
                        color: colors.foreground,
                        fontFamily: fontsLoaded ? FONT_MAP[f.id] : 'DMSans_700Bold',
                      },
                    ]}
                  >
                    {f.sample}
                  </Text>
                  <Text style={[typography.caption, { color: colors.mutedForeground, marginTop: 4 }]}>
                    {f.meta}
                  </Text>
                </View>
              }
            />
          ))
        )}
        <View style={styles.footer}>
          <BexoButton label="Continue" onPress={handleNext} />
        </View>
      </ScrollView>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  fontContent: { gap: 2 },
  sampleText: { fontSize: 20, letterSpacing: -0.3 },
  loadingWrap: { alignItems: 'center', paddingVertical: 40 },
  footer: { paddingTop: 8, paddingBottom: 24 },
});
