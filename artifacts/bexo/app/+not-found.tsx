import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography } from '@/constants/theme';
import { BexoButton } from '@/components/BexoButton';

export default function NotFoundScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }]}>
      <Text style={[typography.display, { color: colors.foreground, marginBottom: 12 }]}>404</Text>
      <Text style={[typography.h3, { color: colors.foreground, marginBottom: 8 }]}>Page not found</Text>
      <Text style={[typography.body, { color: colors.mutedForeground, marginBottom: 32, textAlign: 'center', maxWidth: 260 }]}>
        This route doesn't exist. Let's get you back home.
      </Text>
      <BexoButton label="Go home" onPress={() => router.replace('/')} fullWidth={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
});
