import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography } from '@/constants/theme';

export default function DetailsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ title?: string; body?: string }>();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
    >
      <Text style={[typography.h2, { color: colors.foreground, marginBottom: 12 }]}>
        {params.title ?? 'Details'}
      </Text>
      <Text style={[typography.bodyLg, { color: colors.mutedForeground }]}>
        {params.body ?? 'No additional details.'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ scroll: { padding: 20 } });
