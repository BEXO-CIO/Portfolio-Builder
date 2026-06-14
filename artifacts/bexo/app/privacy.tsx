import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useColors } from '@/hooks/useColors';
import { typography } from '@/constants/theme';

export default function PrivacyScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Animated.ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: Math.max(insets.top, 20), paddingBottom: insets.bottom + 32 }]}
      >
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[typography.h2, { color: colors.foreground }]}>Privacy Policy</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(40).springify()}>
          <Text style={[typography.bodyLg, { color: colors.mutedForeground, lineHeight: 26, marginBottom: 16 }]}>
            Last updated: June 2026
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <Text style={[typography.body, { color: colors.foreground, lineHeight: 24, marginBottom: 12 }]}>
            Bexo collects your phone number, email address, and profile information you provide during onboarding. This data is used solely to operate your portfolio and authenticate your account.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify()}>
          <Text style={[typography.body, { color: colors.foreground, lineHeight: 24, marginBottom: 12 }]}>
            Resume files are stored in private, encrypted storage. Parsed resume data is stored in your profile and visible only to you (and publicly via your portfolio once published).
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).springify()}>
          <Text style={[typography.body, { color: colors.foreground, lineHeight: 24, marginBottom: 12 }]}>
            We do not sell your data to third parties. Analytics on your portfolio (views, clicks) are collected anonymously and shown only to you.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={[typography.body, { color: colors.foreground, lineHeight: 24 }]}>
            To delete your account and all associated data, contact support@mybexo.com. Deletion is processed within 30 days.
          </Text>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 16 },
  backBtn: { padding: 4 },
});
