import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAuthStore } from '@/stores/useAuthStore';
import { ScreenShell } from '@/components/ScreenShell';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FormField } from '@/components/FormField';
import { BexoButton } from '@/components/BexoButton';

export default function CollectPhoneScreen() {
  const router = useRouter();
  const { setCollectedPhone } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (phone.replace(/\D/g, '').length < 7) {
      setError('Enter a valid phone number');
      return;
    }
    setCollectedPhone(phone.trim());
    router.push('/(auth)/verify');
  };

  return (
    <ScreenShell padTop>
      <ScreenHeader
        title="Add your number"
        subtitle="We'll use this to verify your identity via WhatsApp."
      />
      <FormField
        label="Phone number"
        value={phone}
        onChangeText={(t) => { setPhone(t); setError(''); }}
        placeholder="+1 555 000 0000"
        keyboardType="phone-pad"
        autoComplete="tel"
        error={error}
      />
      <View style={styles.footer}>
        <BexoButton label="Send code" onPress={handleNext} />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  footer: { marginTop: 'auto' as any },
});
