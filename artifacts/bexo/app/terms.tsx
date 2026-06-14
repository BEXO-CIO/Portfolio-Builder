import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { typography } from '@/constants/theme';

export default function TermsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
      <Text style={[typography.h2, { color: colors.foreground, marginBottom: 16 }]}>Terms of Service</Text>
      <Text style={[typography.bodyLg, { color: colors.mutedForeground, marginBottom: 16 }]}>Last updated: June 2026</Text>
      <Text style={[typography.body, { color: colors.foreground, lineHeight: 24, marginBottom: 12 }]}>
        By using Bexo, you agree to these terms. Bexo provides portfolio-building tools for personal professional use.
      </Text>
      <Text style={[typography.body, { color: colors.foreground, lineHeight: 24, marginBottom: 12 }]}>
        You are responsible for the accuracy of the information you publish. Bexo does not verify credentials or employment history.
      </Text>
      <Text style={[typography.body, { color: colors.foreground, lineHeight: 24, marginBottom: 12 }]}>
        You may not use Bexo to publish false, misleading, or harmful content. Accounts found violating this policy will be suspended.
      </Text>
      <Text style={[typography.body, { color: colors.foreground, lineHeight: 24 }]}>
        Bexo reserves the right to modify or discontinue the service at any time. For questions, contact support@mybexo.com.
      </Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({ scroll: { padding: 20 } });
