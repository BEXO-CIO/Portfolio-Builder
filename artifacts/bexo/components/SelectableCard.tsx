import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { typography, radius } from '@/constants/theme';

type Props = {
  selected: boolean;
  onPress: () => void;
  title: string;
  subtitle?: string;
  /** Optional render prop for a left-side preview (e.g. theme mini-mockup) */
  preview?: React.ReactNode;
  /** Optional render prop for custom content (e.g. font sample text) */
  content?: React.ReactNode;
};

/**
 * Shared selectable card with checkmark, used by theme.tsx, font.tsx, and
 * potentially other onboarding pickers. Eliminates the duplicate card+check+footer
 * pattern that was previously copy-pasted across multiple files.
 */
export function SelectableCard({ selected, onPress, title, subtitle, preview, content }: Props) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          borderColor: selected ? colors.primary : colors.border,
          borderRadius: radius.md,
          backgroundColor: colors.surface,
          borderWidth: selected ? 2 : 1.5,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {preview && <View style={styles.previewSlot}>{preview}</View>}
      <View style={styles.info}>
        {content ?? (
          <>
            <Text style={[typography.body, { color: colors.foreground, fontFamily: 'DMSans_600SemiBold' }]}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={[typography.bodySm, { color: colors.mutedForeground, marginTop: 2 }]}>
                {subtitle}
              </Text>
            ) : null}
          </>
        )}
      </View>
      {selected ? (
        <View style={[styles.check, { backgroundColor: colors.primary, borderRadius: 12 }]}>
          <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    gap: 12,
  },
  previewSlot: {},
  info: { flex: 1, gap: 4 },
  check: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
