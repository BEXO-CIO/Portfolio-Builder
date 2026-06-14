import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography, radius, spacing } from '@/constants/theme';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { parseUpdateText } from '@/services/achievementParser';
import { BexoButton } from '@/components/BexoButton';

type UpdateType = 'achievement' | 'project' | 'role' | 'education';

const TYPE_OPTIONS: { key: UpdateType; label: string; placeholder: string }[] = [
  { key: 'achievement', label: 'Achievement', placeholder: 'Won 1st place at HackX 2026' },
  { key: 'project', label: 'Project', placeholder: 'Shipped Clarit — an AI flashcard app' },
  { key: 'role', label: 'New role', placeholder: 'Joined Stripe as a software engineering intern' },
  { key: 'education', label: 'Education', placeholder: 'Graduated from UC Berkeley with a B.S. in CS' },
];

export default function UpdateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addUpdate, updates } = usePortfolioStore();
  const [type, setType] = useState<UpdateType>('achievement');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [posted, setPosted] = useState(false);

  const currentPlaceholder = TYPE_OPTIONS.find((t) => t.key === type)?.placeholder ?? '';
  const topPad = Platform.OS === 'web' ? 67 : insets.top + 12;

  const handlePost = () => {
    if (!title.trim()) return;
    addUpdate({ type, title: title.trim(), description: description.trim() });
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTitle('');
    setDescription('');
    setPosted(true);
    setTimeout(() => setPosted(false), 2500);
  };

  const handleAutoDetect = () => {
    if (!title.trim()) return;
    const parsed = parseUpdateText(title);
    setType(parsed.type);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.scroll, { paddingTop: topPad, paddingBottom: insets.bottom + 100 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(0).springify()}>
        <Text style={[typography.h2, { color: colors.foreground, letterSpacing: -0.4, marginBottom: 6 }]}>Post an update</Text>
        <Text style={[typography.body, { color: colors.mutedForeground, marginBottom: 24 }]}>
          Share a win, new role, or shipped project.
        </Text>
      </Animated.View>

      {/* Type selector */}
      <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.typeRow}>
        {TYPE_OPTIONS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[
              styles.typeChip,
              {
                backgroundColor: type === t.key ? colors.primary : colors.surface,
                borderColor: type === t.key ? colors.primary : colors.border,
                borderRadius: radius.sm,
              },
            ]}
            onPress={() => setType(t.key)}
          >
            <Text
              style={[
                typography.caption,
                {
                  color: type === t.key ? colors.primaryForeground : colors.foreground,
                  fontFamily: 'DMSans_500Medium',
                },
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Title input */}
      <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.inputBlock}>
        <Text style={[typography.label, { color: colors.mutedForeground, marginBottom: 8, letterSpacing: 0.5 }]}>
          WHAT HAPPENED
        </Text>
        <TextInput
          style={[
            typography.bodyLg,
            styles.titleInput,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.foreground,
              borderRadius: radius.sm,
            },
          ]}
          value={title}
          onChangeText={(t) => { setTitle(t); if (t.length > 8) handleAutoDetect(); }}
          placeholder={currentPlaceholder}
          placeholderTextColor={colors.mutedForeground}
          autoFocus
          returnKeyType="next"
        />
      </Animated.View>

      {/* Description */}
      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.inputBlock}>
        <Text style={[typography.label, { color: colors.mutedForeground, marginBottom: 8, letterSpacing: 0.5 }]}>
          MORE DETAIL (optional)
        </Text>
        <TextInput
          style={[
            typography.body,
            styles.descInput,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.foreground,
              borderRadius: radius.sm,
            },
          ]}
          value={description}
          onChangeText={setDescription}
          placeholder="Add any extra context…"
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).springify()}>
        {posted ? (
          <View style={[styles.successBanner, { backgroundColor: colors.success + '15', borderRadius: radius.sm, borderColor: colors.success + '30' }]}>
            <Text style={[typography.body, { color: colors.success, fontFamily: 'DMSans_600SemiBold' }]}>
              Posted! It will appear on your portfolio shortly.
            </Text>
          </View>
        ) : (
          <BexoButton label="Post update" onPress={handlePost} disabled={!title.trim()} />
        )}
      </Animated.View>

      {/* Recent posts */}
      {updates.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.recents}>
          <Text style={[typography.label, { color: colors.mutedForeground, letterSpacing: 0.5, marginBottom: 12 }]}>
            RECENT UPDATES
          </Text>
          {updates.slice(0, 5).map((u) => (
            <View key={u.id} style={[styles.recentRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.typeDot, { backgroundColor: colors.primary }]} />
              <View style={styles.recentText}>
                <Text style={[typography.body, { color: colors.foreground }]}>{u.title}</Text>
                <Text style={[typography.caption, { color: colors.mutedForeground }]}>{u.type}</Text>
              </View>
            </View>
          ))}
        </Animated.View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1.5 },
  inputBlock: { marginBottom: 16 },
  titleInput: { height: 52, borderWidth: 1.5, paddingHorizontal: 14 },
  descInput: { minHeight: 90, borderWidth: 1.5, padding: 14 },
  successBanner: { padding: 16, borderWidth: 1, alignItems: 'center' },
  recents: { marginTop: 32 },
  recentRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12, alignItems: 'flex-start' },
  typeDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  recentText: { flex: 1 },
});
