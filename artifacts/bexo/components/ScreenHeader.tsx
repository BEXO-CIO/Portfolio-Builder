import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { typography } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  center?: boolean;
};

export function ScreenHeader({ title, subtitle, center = false }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.container, center && styles.centered]}>
      <Text style={[typography.h1, styles.title, { color: colors.foreground }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[typography.bodyLg, styles.subtitle, { color: colors.mutedForeground }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  centered: {
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 24,
  },
});
