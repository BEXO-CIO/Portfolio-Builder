import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { useAuthStore } from '@/stores/useAuthStore';
import { ScreenShell } from '@/components/ScreenShell';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FormField } from '@/components/FormField';
import { BexoButton } from '@/components/BexoButton';

export default function CollectEmailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { setCollectedEmail } = useAuthStore();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!email.includes('@')) {
      setError('Enter a valid email address');
      return;
    }
    setCollectedEmail(email.trim());
    router.push('/(onboarding)/email');
  };

  return (
    <ScreenShell padTop>
      <ScreenHeader
        title="Add your email"
        subtitle="We need your email to verify your account and send important updates."
      />
      <FormField
        label="Email address"
        value={email}
        onChangeText={(t) => { setEmail(t); setError(''); }}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={error}
      />
      <View style={styles.footer}>
        <BexoButton label="Continue" onPress={handleNext} />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  footer: { marginTop: 'auto' as any },
});
