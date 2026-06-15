import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

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
  const [linkedin, setLinkedin] = useState(profile?.linkedin_url ?? '');
  const [github, setGithub] = useState(profile?.github_url ?? '');
  const [customLinks, setCustomLinks] = useState<{ id: string; label: string; url: string }[]>(profile?.custom_links ?? []);

  const handleSave = () => {
    updateProfile({
      full_name: fullName.trim(),
      headline: headline.trim(),
      bio: bio.trim(),
      location: location.trim(),
      linkedin_url: linkedin.trim(),
      github_url: github.trim(),
      custom_links: customLinks.map(l => ({ ...l, label: l.label.trim(), url: l.url.trim() })).filter(l => l.label || l.url),
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
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
        <FormField label="Bio" value={bio} onChangeText={setBio} placeholder="A few sentences about yourself…" multiline numberOfLines={4} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(160).springify()}>
        <FormField label="Location" value={location} onChangeText={setLocation} placeholder="San Francisco, CA" />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <FormField label="LinkedIn" value={linkedin} onChangeText={setLinkedin} placeholder="https://linkedin.com/in/you" keyboardType="url" optional />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(240).springify()}>
        <FormField label="GitHub" value={github} onChangeText={setGithub} placeholder="https://github.com/you" keyboardType="url" optional />
      </Animated.View>

      {customLinks.map((link, index) => (
        <Animated.View key={link.id} entering={FadeInDown.delay(280 + index * 40).springify()} style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <FormField 
                label={`Custom Link ${index + 1}`} 
                value={link.label} 
                onChangeText={(t: string) => {
                  const newLinks = [...customLinks];
                  newLinks[index].label = t;
                  setCustomLinks(newLinks);
                }} 
                placeholder="e.g. Medium" 
              />
            </View>
            <View style={{ flex: 2 }}>
              <FormField 
                label="URL" 
                value={link.url} 
                onChangeText={(t: string) => {
                  const newLinks = [...customLinks];
                  newLinks[index].url = t;
                  setCustomLinks(newLinks);
                }} 
                placeholder="https://..." 
                keyboardType="url" 
              />
            </View>
            <TouchableOpacity 
              onPress={() => setCustomLinks(customLinks.filter(l => l.id !== link.id))}
              style={{ justifyContent: 'center', alignItems: 'center', marginTop: 26, paddingHorizontal: 4 }}
            >
              <Feather name="trash-2" size={20} color={colors.destructive || 'red'} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      ))}

      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingVertical: 12 }}
          onPress={() => setCustomLinks([...customLinks, { id: Date.now().toString(), label: '', url: '' }])}
        >
          <Feather name="plus-circle" size={18} color={colors.primary} />
          <Text style={{ fontFamily: 'DMSans_500Medium', color: colors.primary, marginLeft: 8 }}>Add Custom Link</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(440).springify()} style={{ marginTop: 24 }}>
        <BexoButton label="Save changes" onPress={handleSave} />
      </Animated.View>
    </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
});
