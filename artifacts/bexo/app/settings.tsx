import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography, radius } from '@/constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { ListRow } from '@/components/ListRow';

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuthStore();
  const { profile, reset: resetProfile } = useProfileStore();
  const { reset: resetPortfolio } = usePortfolioStore();

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          resetProfile();
          resetPortfolio();
          router.replace('/(auth)');
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
    >
      <Text style={[typography.h3, { color: colors.foreground, marginBottom: 20 }]}>Settings</Text>

      <SectionLabel label="ACCOUNT" colors={colors} />
      <ListRow title="Edit Profile" onPress={() => { router.back(); router.push('/edit-profile'); }} chevron leftIcon="user" />
      <ListRow title="Identity Card" onPress={() => { router.back(); router.push('/(main)/cards'); }} chevron leftIcon="credit-card" />

      <SectionLabel label="PORTFOLIO" colors={colors} />
      <ListRow title="FAQ" onPress={() => router.push('/faq')} chevron leftIcon="help-circle" />
      <ListRow title="Privacy Policy" onPress={() => router.push('/privacy')} chevron leftIcon="shield" />
      <ListRow title="Terms of Service" onPress={() => router.push('/terms')} chevron leftIcon="file-text" />

      <SectionLabel label="DANGER ZONE" colors={colors} />
      <TouchableOpacity style={[styles.signOut, { borderColor: colors.destructive + '30', borderRadius: radius.sm }]} onPress={handleSignOut}>
        <Feather name="log-out" size={18} color={colors.destructive} />
        <Text style={[typography.body, { color: colors.destructive, marginLeft: 10, fontFamily: 'DMSans_500Medium' }]}>
          Sign out
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SectionLabel({ label, colors }: { label: string; colors: any }) {
  return (
    <Text style={[typography.caption, { color: colors.mutedForeground, letterSpacing: 0.8, marginTop: 24, marginBottom: 8 }]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  signOut: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, marginTop: 8 },
});
