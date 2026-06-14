import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
    <Animated.ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: Math.max(insets.top, 20), paddingBottom: insets.bottom + 32 }
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View entering={FadeInDown.delay(0).springify()}>
        <ScreenHeader title="Edit Profile" />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(40).springify()}>
        <FormField label="Full name" value={fullName} onChangeText={setFullName} placeholder="Your Name" autoCapitalize="words" />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(80).springify()}>
        <FormField label="Headline" value={headline} onChangeText={setHeadline} placeholder="Software Engineer · UC Berkeley" />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(120).springify()}>
        <FormField label="Bio" value={bio} onChangeText={setBio} placeholder="A few sentences about yourself…" multiline numberOfLines={4} optional />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(160).springify()}>
        <FormField label="Location" value={location} onChangeText={setLocation} placeholder="San Francisco, CA" optional />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <FormField label="Website" value={website} onChangeText={setWebsite} placeholder="https://yoursite.com" keyboardType="url" optional />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(240).springify()}>
        <FormField label="LinkedIn" value={linkedin} onChangeText={setLinkedin} placeholder="https://linkedin.com/in/you" keyboardType="url" optional />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(280).springify()}>
        <FormField label="GitHub" value={github} onChangeText={setGithub} placeholder="https://github.com/you" keyboardType="url" optional />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(320).springify()} style={{ marginTop: 12 }}>
        <BexoButton label="Save changes" onPress={handleSave} />
      </Animated.View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
});
