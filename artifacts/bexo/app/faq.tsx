import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { useColors } from '@/hooks/useColors';
import { typography, radius } from '@/constants/theme';

const FAQS = [
  { q: 'How does Bexo work?', a: 'You sign in with your phone, complete your profile, and Bexo automatically generates a live portfolio at yourhandle.mybexo.com.' },
  { q: 'What is the 90% completion rule?', a: 'Your portfolio builds once your profile hits 90% — that means a name, handle, photo, bio, at least one experience, education, project, 3 skills, and theme/font selected.' },
  { q: 'Can I change my handle?', a: 'Yes — visit your profile settings to update your handle. Note that changing it will update your portfolio URL.' },
  { q: 'Is my resume stored?', a: 'Your resume is uploaded to private, encrypted storage. Only you can access it. The parsed content is stored in your profile.' },
  { q: 'How do I share my portfolio?', a: 'Tap the Share button on the Dashboard or Portfolio tab to copy your link or share via WhatsApp.' },
  { q: 'Can I make my portfolio private?', a: 'Not yet — all published portfolios are public. Private mode is on the roadmap.' },
];

export default function FAQScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
    >
      <Text style={[typography.h2, { color: colors.foreground, marginBottom: 20 }]}>FAQ</Text>
      {FAQS.map((faq, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.item, { borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface }]}
          onPress={() => setExpanded(expanded === i ? null : i)}
          activeOpacity={0.85}
        >
          <View style={styles.row}>
            <Text style={[typography.body, { flex: 1, color: colors.foreground, fontFamily: 'DMSans_600SemiBold' }]}>{faq.q}</Text>
            <Feather name={expanded === i ? 'chevron-up' : 'chevron-down'} size={18} color={colors.mutedForeground} />
          </View>
          {expanded === i ? (
            <Text style={[typography.body, { color: colors.mutedForeground, marginTop: 10, lineHeight: 22 }]}>{faq.a}</Text>
          ) : null}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  item: { padding: 16, marginBottom: 10, borderWidth: 1.5 },
  row: { flexDirection: 'row', alignItems: 'center' },
});
