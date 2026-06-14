import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { typography } from '@/constants/theme';
import { useProfileStore } from '@/stores/useProfileStore';
import { OnboardingShell } from '@/components/OnboardingShell';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FormField } from '@/components/FormField';
import { SkillTag } from '@/components/SkillTag';
import { BexoButton } from '@/components/BexoButton';

const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'React', 'Node.js',
  'Java', 'Swift', 'Kotlin', 'Go', 'Rust',
  'SQL', 'MongoDB', 'AWS', 'Docker', 'Figma',
  'Product Design', 'Data Analysis', 'Machine Learning',
];

export default function CardsStep() {
  const colors = useColors();
  const router = useRouter();
  const { profile, skills, updateProfile, addSkill, removeSkill, setOnboardingStep } = useProfileStore();
  const [headline, setHeadline] = useState(profile?.headline ?? '');
  const [location, setLocation] = useState(profile?.location ?? '');
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [error, setError] = useState('');

  const selectedSkillNames = skills.map((s) => s.name);

  const toggleSkill = (name: string) => {
    if (selectedSkillNames.includes(name)) {
      removeSkill(name);
    } else {
      addSkill({ name, category: '', level: 'intermediate' });
    }
  };

  const handleNext = () => {
    if (!fullName.trim()) { setError('Add your full name'); return; }
    if (!headline.trim()) { setError('Add a headline'); return; }
    updateProfile({
      full_name: fullName.trim(),
      headline: headline.trim(),
      location: location.trim(),
    });
    setOnboardingStep('about');
    router.push('/(onboarding)/about');
  };

  return (
    <OnboardingShell step="cards" onBack={() => router.back()}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader
          title="Your identity card"
          subtitle="This appears at the top of your portfolio."
        />
        <FormField
          label="Full name"
          value={fullName}
          onChangeText={(t) => { setFullName(t); setError(''); }}
          placeholder="Your full name"
          autoCapitalize="words"
          error={error && !fullName ? error : ''}
        />
        <FormField
          label="Headline"
          value={headline}
          onChangeText={(t) => { setHeadline(t); setError(''); }}
          placeholder="Software Engineer · UC Berkeley"
          hint="Appears under your name"
          error={error && fullName && !headline ? error : ''}
        />
        <FormField
          label="Location"
          value={location}
          onChangeText={setLocation}
          placeholder="San Francisco, CA"
          optional
        />

        <Text style={[typography.label, styles.skillsLabel, { color: colors.mutedForeground }]}>
          SKILLS
        </Text>
        <View style={styles.skillsWrap}>
          {COMMON_SKILLS.map((s) => (
            <SkillTag
              key={s}
              label={s}
              selected={selectedSkillNames.includes(s)}
              onPress={() => toggleSkill(s)}
            />
          ))}
        </View>
        {selectedSkillNames.filter((s) => !COMMON_SKILLS.includes(s)).map((s) => (
          <SkillTag key={s} label={s} selected onPress={() => removeSkill(s)} />
        ))}

        <View style={styles.footer}>
          <BexoButton label="Continue" onPress={handleNext} />
        </View>
      </ScrollView>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  skillsLabel: { marginBottom: 12, letterSpacing: 0.5 },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  footer: { marginTop: 16, paddingBottom: 24 },
});
