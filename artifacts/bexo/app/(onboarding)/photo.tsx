import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useColors } from '@/hooks/useColors';
import { typography, radius, spacing } from '@/constants/theme';
import { useProfileStore } from '@/stores/useProfileStore';
import { uploadAvatar } from '@/services/upload';
import { OnboardingShell } from '@/components/OnboardingShell';
import { ScreenHeader } from '@/components/ScreenHeader';
import { BexoButton } from '@/components/BexoButton';

export default function PhotoStep() {
  const colors = useColors();
  const router = useRouter();
  const { profile, updateProfile, setOnboardingStep } = useProfileStore();
  const [localUri, setLocalUri] = useState<string | null>(profile?.avatar_url ?? null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setLocalUri(result.assets[0].uri);
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleNext = async () => {
    if (localUri && localUri !== profile?.avatar_url) {
      setUploading(true);
      const { url } = await uploadAvatar(profile?.user_id ?? 'user', localUri);
      updateProfile({ avatar_url: url ?? localUri });
      setUploading(false);
    }
    setOnboardingStep('handle');
    router.push('/(onboarding)/handle');
  };

  const handleSkip = () => {
    setOnboardingStep('handle');
    router.push('/(onboarding)/handle');
  };

  return (
    <OnboardingShell step="photo" onBack={() => router.back()}>
      <ScreenHeader title="Add a photo" subtitle="A clear, friendly photo helps people recognise you." />
      <View style={styles.centered}>
        <TouchableOpacity onPress={pickImage} activeOpacity={0.85}>
          {localUri ? (
            <Animated.View entering={FadeIn.springify()}>
              <Image
                source={{ uri: localUri }}
                style={[styles.avatar, { borderColor: colors.primary, borderRadius: 60 }]}
              />
              <View style={[styles.editBadge, { backgroundColor: colors.primary, borderRadius: 20 }]}>
                <Feather name="camera" size={16} color={colors.primaryForeground} />
              </View>
            </Animated.View>
          ) : (
            <View
              style={[
                styles.placeholder,
                { backgroundColor: colors.muted, borderColor: colors.border, borderRadius: 60 },
              ]}
            >
              <Feather name="camera" size={32} color={colors.mutedForeground} />
              <Text style={[typography.bodySm, { color: colors.mutedForeground, marginTop: 8 }]}>
                Tap to add photo
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <BexoButton label="Continue" onPress={handleNext} loading={uploading} />
        {!localUri ? (
          <BexoButton label="Skip for now" onPress={handleSkip} variant="ghost" />
        ) : null}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatar: { width: 120, height: 120, borderWidth: 3 },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: { gap: 8, paddingBottom: 24 },
});
