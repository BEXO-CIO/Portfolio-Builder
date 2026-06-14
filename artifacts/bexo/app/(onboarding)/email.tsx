import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { OnboardingShell } from '@/components/OnboardingShell';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FormField } from '@/components/FormField';
import { BexoButton } from '@/components/BexoButton';

export default function EmailStep() {
  const router = useRouter();
  const { session } = useAuthStore();
  const { profile, updateProfile, setOnboardingStep } = useProfileStore();

  // If Google verified, we already have a verified email — skip this step
  useEffect(() => {
    if (session?.emailVerified && session?.user.email) {
      // Auto-fill the email from Google and advance
      updateProfile({ email: session.user.email, email_verified: true });
      setOnboardingStep('photo');
      router.replace('/(onboarding)/photo');
    }
  }, []);

  const [email, setEmail] = useState(
    profile?.email ?? session?.user.email ?? ''
  );
  const [error, setError] = useState('');

  const handleNext = () => {
    const trimmed = email.trim();
    if (!trimmed.includes('@') || !trimmed.includes('.')) {
      setError('Enter a valid email address');
      return;
    }
    updateProfile({ email: trimmed, email_verified: session?.emailVerified ?? false });
    setOnboardingStep('photo');
    router.push('/(onboarding)/photo');
  };

  // Show loading state while redirect happens
  if (session?.emailVerified) {
    return (
      <OnboardingShell step="email">
        <View style={styles.center}>
          <View style={styles.skipIndicator}>
            <Feather name="check-circle" size={32} color="#0D6B5C" />
          </View>
        </View>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell step="email">
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader
          title="What's your email?"
          subtitle="We'll show this on your portfolio for recruiters to reach you."
        />
        <FormField
          label="Email address"
          value={email}
          onChangeText={(t) => { setEmail(t); setError(''); }}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoFocus={!email}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  skipIndicator: { opacity: 0.6 },
});
