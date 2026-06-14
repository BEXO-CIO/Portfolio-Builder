import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { typography } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  onDelete?: () => void;
  chevron?: boolean;
  leftIcon?: keyof typeof Feather.glyphMap;
};

export function ListRow({ title, subtitle, onPress, onDelete, chevron, leftIcon }: Props) {
  const colors = useColors();

  const content = (
    <View style={styles.inner}>
      {leftIcon ? (
        <Feather name={leftIcon} size={18} color={colors.mutedForeground} style={styles.leftIcon} />
      ) : null}
      <View style={styles.text}>
        <Text style={[typography.body, { color: colors.foreground, fontFamily: 'DMSans_500Medium' }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[typography.bodySm, { color: colors.mutedForeground, marginTop: 2 }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>
        {onDelete ? (
          <TouchableOpacity onPress={onDelete} hitSlop={12}>
            <Feather name="trash-2" size={16} color={colors.accent} />
          </TouchableOpacity>
        ) : chevron ? (
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.row, { borderBottomColor: colors.border }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>{content}</View>
  );
}

const styles = StyleSheet.create({
  row: { borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 14 },
  inner: { flexDirection: 'row', alignItems: 'center' },
  leftIcon: { marginRight: 12 },
  text: { flex: 1 },
  right: { marginLeft: 8 },
});
