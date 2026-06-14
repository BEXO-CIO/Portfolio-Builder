import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useProfileStore } from '@/stores/useProfileStore';
import { OnboardingShell } from '@/components/OnboardingShell';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FormField } from '@/components/FormField';
import { BexoButton } from '@/components/BexoButton';

export default function EmailStep() {
  const router = useRouter();
  const { profile, updateProfile, setOnboardingStep } = useProfileStore();
  const [email, setEmail] = useState(profile?.email ?? '');
  const [error, setError] = useState('');

  const handleNext = () => {
    const trimmed = email.trim();
    if (!trimmed.includes('@') || !trimmed.includes('.')) {
      setError('Enter a valid email address');
      return;
    }
    updateProfile({ email: trimmed, email_verified: false });
    setOnboardingStep('photo');
    router.push('/(onboarding)/photo');
  };

  return (
    <OnboardingShell step="email">
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader
          title="What's your email?"
          subtitle="We'll send portfolio updates and sign-in links here."
        />
        <FormField
          label="Email address"
          value={email}
          onChangeText={(t) => { setEmail(t); setError(''); }}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoFocus
          error={error}
        />
        <View style={styles.footer}>
          <BexoButton label="Continue" onPress={handleNext} />
        </View>
      </ScrollView>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  footer: { marginTop: 16 },
});
