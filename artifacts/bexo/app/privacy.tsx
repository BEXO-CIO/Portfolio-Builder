import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { typography } from '@/constants/theme';

export default function PrivacyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
      <Text style={[typography.h2, { color: colors.foreground, marginBottom: 16 }]}>Privacy Policy</Text>
      <Text style={[typography.bodyLg, { color: colors.mutedForeground, lineHeight: 26, marginBottom: 16 }]}>
        Last updated: June 2026
      </Text>
      <Text style={[typography.body, { color: colors.foreground, lineHeight: 24, marginBottom: 12 }]}>
        Bexo collects your phone number, email address, and profile information you provide during onboarding. This data is used solely to operate your portfolio and authenticate your account.
      </Text>
      <Text style={[typography.body, { color: colors.foreground, lineHeight: 24, marginBottom: 12 }]}>
        Resume files are stored in private, encrypted storage. Parsed resume data is stored in your profile and visible only to you (and publicly via your portfolio once published).
      </Text>
      <Text style={[typography.body, { color: colors.foreground, lineHeight: 24, marginBottom: 12 }]}>
        We do not sell your data to third parties. Analytics on your portfolio (views, clicks) are collected anonymously and shown only to you.
      </Text>
      <Text style={[typography.body, { color: colors.foreground, lineHeight: 24 }]}>
        To delete your account and all associated data, contact support@mybexo.com. Deletion is processed within 30 days.
      </Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({ scroll: { padding: 20 } });
