import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { typography } from '@/constants/theme';
import { BexoButton } from './BexoButton';

type Props = {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, message, actionLabel, onAction }: Props) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <View style={[styles.iconBg, { backgroundColor: colors.muted, borderRadius: 24 }]}>
        <Feather name={icon} size={28} color={colors.mutedForeground} />
      </View>
      <Text style={[typography.h3, styles.title, { color: colors.foreground }]}>{title}</Text>
      {message ? (
        <Text style={[typography.body, styles.message, { color: colors.mutedForeground }]}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <BexoButton label={actionLabel} onPress={onAction} variant="secondary" fullWidth={false} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 32 },
  iconBg: { width: 64, height: 64, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { textAlign: 'center', marginBottom: 8 },
  message: { textAlign: 'center', maxWidth: 260 },
  action: { marginTop: 20 },
});
