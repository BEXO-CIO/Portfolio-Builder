import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { typography } from '@/constants/theme';
import { useProfileStore } from '@/stores/useProfileStore';
import { OnboardingShell } from '@/components/OnboardingShell';
import { ScreenHeader } from '@/components/ScreenHeader';
import { BexoButton } from '@/components/BexoButton';

type Colors = ReturnType<typeof useColors>;

function FormTextArea({ value, onChangeText, placeholder, colors }: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  colors: Colors;
}) {
  return (
    <TextInput
      style={[
        typography.bodyLg,
        {
          color: colors.foreground,
          minHeight: 140,
          paddingHorizontal: 14,
          paddingTop: 14,
          textAlignVertical: 'top',
        },
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.mutedForeground}
      multiline
      numberOfLines={6}
      autoFocus
    />
  );
}

export default function AboutStep() {
  const colors = useColors();
  const router = useRouter();
  const { profile, updateProfile, setOnboardingStep } = useProfileStore();
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (bio.trim().length < 20) {
      setError('Write at least 20 characters about yourself');
      return;
    }
    updateProfile({ bio: bio.trim() });
    setOnboardingStep('dob');
    router.push('/(onboarding)/dob');
  };

  const count = bio.length;
  const countColor = count >= 20 ? colors.success : colors.accent;

  return (
    <OnboardingShell step="about" onBack={() => router.back()}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader
          title="About you"
          subtitle="Write a short bio for your portfolio. Be yourself — warm and direct, not a press release."
        />
        <View style={[styles.textArea, { borderColor: error ? colors.destructive : colors.border, backgroundColor: colors.surface, borderRadius: 14 }]}>
          <View style={{ flex: 1 }}>
            <FormTextArea
              value={bio}
              onChangeText={(t) => { setBio(t); setError(''); }}
              placeholder="Computer science student at UC Berkeley, passionate about building things people use every day. Currently exploring ML and full-stack web."
              colors={colors}
            />
          </View>
          <View style={styles.countRow}>
            <Text style={[typography.caption, { color: countColor }]}>{count} chars</Text>
            <Text style={[typography.caption, { color: colors.mutedForeground }]}>Min 20</Text>
          </View>
        </View>
        {error ? (
          <Text style={[typography.bodySm, { color: colors.destructive, marginTop: 6 }]}>{error}</Text>
        ) : null}

        <View style={styles.footer}>
          <BexoButton label="Continue" onPress={handleNext} />
          <BexoButton
            label="Skip for now"
            onPress={() => { setOnboardingStep('dob'); router.push('/(onboarding)/dob'); }}
            variant="ghost"
          />
        </View>
      </ScrollView>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  textArea: { borderWidth: 1.5, overflow: 'hidden' },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 10 },
  footer: { gap: 8, paddingTop: 16, paddingBottom: 24 },
});
