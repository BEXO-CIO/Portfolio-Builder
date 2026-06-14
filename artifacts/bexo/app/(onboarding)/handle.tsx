import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { typography, spacing } from '@/constants/theme';
import { useProfileStore } from '@/stores/useProfileStore';
import { OnboardingShell } from '@/components/OnboardingShell';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FormField } from '@/components/FormField';
import { BexoButton } from '@/components/BexoButton';

export default function HandleStep() {
  const colors = useColors();
  const router = useRouter();
  const { profile, updateProfile, checkHandle, setOnboardingStep } = useProfileStore();
  const [handle, setHandle] = useState(profile?.handle ?? '');
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (handle.length < 3) { setStatus('idle'); return; }
    const timer = setTimeout(async () => {
      setStatus('checking');
      const ok = await checkHandle(handle);
      setStatus(ok ? 'available' : 'taken');
    }, 600);
    return () => clearTimeout(timer);
  }, [handle]);

  const handleNext = async () => {
    const clean = handle.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (clean.length < 3) { setError('Handle must be at least 3 characters'); return; }
    if (status === 'taken') { setError('This handle is already taken'); return; }
    updateProfile({ handle: clean });
    setOnboardingStep('resume');
    router.push('/(onboarding)/resume');
  };

  const handleChange = (text: string) => {
    const clean = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setHandle(clean);
    setError('');
  };

  const statusColor = status === 'available' ? colors.success : status === 'taken' ? colors.destructive : colors.mutedForeground;
  const statusIcon = status === 'available' ? 'check-circle' : status === 'taken' ? 'x-circle' : 'loader';
  const statusText = status === 'available' ? `${handle}.mybexo.com is available` : status === 'taken' ? 'That handle is taken' : status === 'checking' ? 'Checking…' : '';

  return (
    <OnboardingShell step="handle" onBack={() => router.back()}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader
          title="Pick your handle"
          subtitle="This becomes your portfolio URL. Lowercase letters, numbers, underscores only."
        />
        <FormField
          label="Handle"
          value={handle}
          onChangeText={handleChange}
          placeholder="yourname"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          error={error}
          hint={`mybexo.com/${handle || 'yourname'}`}
        />
        {statusText ? (
          <View style={styles.statusRow}>
            <Feather name={statusIcon} size={14} color={statusColor} />
            <Text style={[typography.bodySm, { color: statusColor, marginLeft: 6 }]}>
              {statusText}
            </Text>
          </View>
        ) : null}
        <View style={styles.footer}>
          <BexoButton
            label="Continue"
            onPress={handleNext}
            disabled={status === 'taken' || handle.length < 3}
          />
        </View>
      </ScrollView>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.base },
  footer: { marginTop: 8 },
});
