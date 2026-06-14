import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { useProfileStore } from '@/stores/useProfileStore';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FormField } from '@/components/FormField';
import { BexoButton } from '@/components/BexoButton';

export default function EditProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useProfileStore();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [headline, setHeadline] = useState(profile?.headline ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [location, setLocation] = useState(profile?.location ?? '');
  const [website, setWebsite] = useState(profile?.website ?? '');
  const [linkedin, setLinkedin] = useState(profile?.linkedin_url ?? '');
  const [github, setGithub] = useState(profile?.github_url ?? '');

  const handleSave = () => {
    updateProfile({
      full_name: fullName.trim(),
      headline: headline.trim(),
      bio: bio.trim(),
      location: location.trim(),
      website: website.trim(),
      linkedin_url: linkedin.trim(),
      github_url: github.trim(),
    });
    router.back();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
      keyboardShouldPersistTaps="handled"
    >
      <ScreenHeader title="Edit Profile" />
      <FormField label="Full name" value={fullName} onChangeText={setFullName} placeholder="Your Name" autoCapitalize="words" />
      <FormField label="Headline" value={headline} onChangeText={setHeadline} placeholder="Software Engineer · UC Berkeley" />
      <FormField label="Bio" value={bio} onChangeText={setBio} placeholder="A few sentences about yourself…" multiline numberOfLines={4} optional />
      <FormField label="Location" value={location} onChangeText={setLocation} placeholder="San Francisco, CA" optional />
      <FormField label="Website" value={website} onChangeText={setWebsite} placeholder="https://yoursite.com" keyboardType="url" optional />
      <FormField label="LinkedIn" value={linkedin} onChangeText={setLinkedin} placeholder="https://linkedin.com/in/you" keyboardType="url" optional />
      <FormField label="GitHub" value={github} onChangeText={setGithub} placeholder="https://github.com/you" keyboardType="url" optional />
      <BexoButton label="Save changes" onPress={handleSave} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
});
