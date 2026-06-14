import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography, spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { BexoButton } from '@/components/BexoButton';
import { FormField } from '@/components/FormField';

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sendOtp, isLoading } = useAuthStore();
  const [phone, setPhone] = useState('+91');
  const [error, setError] = useState('');

  const validate = () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) {
      setError('Enter a valid phone number including country code');
      return false;
    }
    return true;
  };

  const handleSend = async () => {
    if (!validate()) return;
    setError('');
    const { error: err } = await sendOtp(phone.trim());
    if (err) {
      setError(err);
      return;
    }
    router.push('/(auth)/verify');
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top + 16;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.inner, { paddingTop: topPad, paddingBottom: insets.bottom + 32 }]}>
        <Animated.View entering={FadeInDown.delay(0).springify()}>
          <Text style={[typography.h2, styles.brand, { color: colors.primary }]}>bexo</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.headBlock}>
          <Text style={[typography.display, { color: colors.foreground, letterSpacing: -0.5 }]}>
            Your portfolio{'\n'}starts here.
          </Text>
          <Text style={[typography.bodyLg, styles.sub, { color: colors.mutedForeground }]}>
            Enter your phone number to sign in or create an account.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify()} style={styles.form}>
          <FormField
            label="Phone number"
            value={phone}
            onChangeText={(t) => { setPhone(t); setError(''); }}
            placeholder="+1 555 000 0000"
            keyboardType="phone-pad"
            autoComplete="tel"
            error={error}
          />
          <BexoButton label="Send code via WhatsApp" onPress={handleSend} loading={isLoading} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.legal}>
          <Text style={[typography.caption, { color: colors.mutedForeground, textAlign: 'center' }]}>
            By continuing you agree to our{' '}
            <Text
              style={{ color: colors.primary }}
              onPress={() => router.push('/terms')}
            >
              Terms
            </Text>
            {' '}and{' '}
            <Text
              style={{ color: colors.primary }}
              onPress={() => router.push('/privacy')}
            >
              Privacy Policy
            </Text>
            .
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24 },
  brand: { letterSpacing: -0.5, marginBottom: spacing.xl },
  headBlock: { marginBottom: spacing.xl },
  sub: { marginTop: 12, lineHeight: 26 },
  form: { gap: 12 },
  legal: { marginTop: 'auto', paddingTop: 24 },
});
