import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useColors } from '@/hooks/useColors';
import { typography } from '@/constants/theme';

export default function TermsScreen() {
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
          <Text style={[typography.h2, { color: colors.foreground }]}>Terms of Service</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(40).springify()}>
          <Text style={[typography.bodyLg, { color: colors.mutedForeground, marginBottom: 16 }]}>
            Last updated: June 2026
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <Text style={[typography.body, { color: colors.foreground, lineHeight: 24, marginBottom: 12 }]}>
            By using Bexo, you agree to these terms. Bexo provides portfolio-building tools for personal professional use.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify()}>
          <Text style={[typography.body, { color: colors.foreground, lineHeight: 24, marginBottom: 12 }]}>
            You are responsible for the accuracy of the information you publish. Bexo does not verify credentials or employment history.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).springify()}>
          <Text style={[typography.body, { color: colors.foreground, lineHeight: 24, marginBottom: 12 }]}>
            You may not use Bexo to publish false, misleading, or harmful content. Accounts found violating this policy will be suspended.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={[typography.body, { color: colors.foreground, lineHeight: 24 }]}>
            Bexo reserves the right to modify or discontinue the service at any time. For questions, contact support@mybexo.com.
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
