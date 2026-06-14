import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { typography, radius, shadow } from '@/constants/theme';
import type { BuildStatus } from '@/stores/usePortfolioStore';

type Props = {
  status: BuildStatus;
  portfolioUrl?: string | null;
  buildLog?: string | null;
};

const CONFIG: Record<
  NonNullable<BuildStatus>,
  { label: string; icon: keyof typeof Feather.glyphMap; color: string }
> = {
  queued: { label: 'Queued…', icon: 'clock', color: '#78716C' },
  building: { label: 'Building your portfolio…', icon: 'loader', color: '#B45309' },
  done: { label: 'Portfolio is live!', icon: 'check-circle', color: '#0D6B5C' },
  failed: { label: 'Build failed', icon: 'alert-circle', color: '#B91C1C' },
};

export function BuildStatusCard({ status, portfolioUrl, buildLog }: Props) {
  const colors = useColors();
  if (!status) return null;

  const cfg = CONFIG[status];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
          ...shadow.sm,
        },
      ]}
    >
      <View style={styles.row}>
        {status === 'building' ? (
          <ActivityIndicator size="small" color={colors.warning} style={styles.icon} />
        ) : (
          <Feather name={cfg.icon} size={20} color={cfg.color} style={styles.icon} />
        )}
        <View style={styles.textBlock}>
          <Text style={[typography.body, { color: colors.foreground, fontFamily: 'DMSans_600SemiBold' }]}>
            {cfg.label}
          </Text>
          {portfolioUrl && status === 'done' ? (
            <Text style={[typography.bodySm, { color: colors.primary, marginTop: 2 }]}>
              {portfolioUrl}
            </Text>
          ) : buildLog ? (
            <Text style={[typography.caption, { color: colors.mutedForeground, marginTop: 2 }]}>
              {buildLog}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 12 },
  textBlock: { flex: 1 },
});
