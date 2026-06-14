import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { typography, radius } from '@/constants/theme';
import { useProfileStore } from '@/stores/useProfileStore';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FormField } from '@/components/FormField';
import { SkillTag } from '@/components/SkillTag';
import { BexoButton } from '@/components/BexoButton';

const PALETTES = [
  { id: 'midnight', label: 'Midnight', bg: '#1C1917', fg: '#F7F5F0' },
  { id: 'emerald', label: 'Emerald', bg: '#0D6B5C', fg: '#F7F5F0' },
  { id: 'coral', label: 'Coral', bg: '#C45C4A', fg: '#F7F5F0' },
  { id: 'paper', label: 'Paper', bg: '#F7F5F0', fg: '#1C1917' },
];

export default function EditCardsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { profile, skills, updateProfile, addSkill, removeSkill } = useProfileStore();
  const [headline, setHeadline] = useState(profile?.headline ?? '');
  const [location, setLocation] = useState(profile?.location ?? '');
  const [palette, setPalette] = useState(profile?.identity_card_palette ?? 'midnight');
  const [newSkill, setNewSkill] = useState('');

  const handleSave = () => {
    updateProfile({ headline, location, identity_card_palette: palette });
    router.back();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <ScreenHeader title="Identity card" subtitle="Shown at the top of your portfolio." />

      <FormField label="Headline" value={headline} onChangeText={setHeadline} placeholder="Software Engineer · UC Berkeley" />
      <FormField label="Location" value={location} onChangeText={setLocation} placeholder="San Francisco, CA" optional />

      <Text style={[typography.label, { color: colors.mutedForeground, marginBottom: 10, letterSpacing: 0.5 }]}>
        CARD PALETTE
      </Text>
      <View style={styles.palettes}>
        {PALETTES.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[
              styles.paletteBox,
              { backgroundColor: p.bg, borderColor: palette === p.id ? colors.primary : 'transparent', borderRadius: radius.sm },
            ]}
            onPress={() => setPalette(p.id)}
          >
            <Text style={[typography.caption, { color: p.fg }]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[typography.label, { color: colors.mutedForeground, marginVertical: 12, letterSpacing: 0.5 }]}>
        SKILLS ON CARD
      </Text>
      <View style={styles.skillsWrap}>
        {skills.map((s) => (
          <SkillTag key={s.id} label={s.name} selected onPress={() => removeSkill(s.name)} />
        ))}
      </View>
      <FormField
        label="Add skill"
        value={newSkill}
        onChangeText={setNewSkill}
        placeholder="e.g. Python"
        onSubmitEditing={() => {
          if (newSkill.trim()) {
            addSkill({ name: newSkill.trim(), category: '', level: 'intermediate' });
            setNewSkill('');
          }
        }}
        returnKeyType="done"
      />

      <BexoButton label="Save changes" onPress={handleSave} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 48 },
  palettes: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  paletteBox: { flex: 1, padding: 12, alignItems: 'center', borderWidth: 2 },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap' },
});
