import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { typography, radius } from '@/constants/theme';

type Action = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
};

type Props = {
  actions: Action[];
};

export function ProfileActionStrip({ actions }: Props) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      {actions.map((a) => (
        <TouchableOpacity
          key={a.label}
          style={[
            styles.item,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.md,
            },
          ]}
          onPress={a.onPress}
          activeOpacity={0.8}
        >
          <Feather name={a.icon} size={20} color={colors.primary} />
          <Text style={[typography.caption, styles.label, { color: colors.foreground }]}>
            {a.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  item: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
  },
  label: { textAlign: 'center' },
});
