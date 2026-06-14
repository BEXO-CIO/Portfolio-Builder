import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useColors } from '@/hooks/useColors';
import { typography, radius, spacing, shadow } from '@/constants/theme';
import { useProfileStore } from '@/stores/useProfileStore';
import { uploadAndParseResume, friendlyResumeAiError } from '@/services/resumeParser';
import { OnboardingShell } from '@/components/OnboardingShell';
import { ScreenHeader } from '@/components/ScreenHeader';
import { BexoButton } from '@/components/BexoButton';

type Stage = 'idle' | 'uploading' | 'parsing' | 'done' | 'error';

export default function ResumeStep() {
  const colors = useColors();
  const router = useRouter();
  const { profile, setParsedResumeData, applyParsedResume, setOnboardingStep } = useProfileStore();
  const [fileName, setFileName] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [errMsg, setErrMsg] = useState('');

  const pickAndParse = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setFileName(asset.name);
    setStage('uploading');
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    await new Promise((r) => setTimeout(r, 400));
    setStage('parsing');

    const { data, error } = await uploadAndParseResume(asset.uri, profile?.user_id ?? 'user');
    if (error || !data) {
      setStage('error');
      setErrMsg(friendlyResumeAiError(error ?? 'Unknown'));
      return;
    }

    setParsedResumeData(data);
    applyParsedResume(data);
    setStage('done');
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleContinue = () => {
    setOnboardingStep('cards');
    router.push('/(onboarding)/cards');
  };

  const handleManual = () => {
    setOnboardingStep('manual');
    router.push('/(onboarding)/manual');
  };

  return (
    <OnboardingShell step="resume" onBack={() => router.back()}>
      <ScreenHeader
        title="Import your resume"
        subtitle="Upload a PDF and we'll pull out your experience, education, and skills automatically."
      />

      {stage === 'idle' || stage === 'error' ? (
        <Animated.View entering={FadeInDown.springify()}>
          <TouchableOpacity
            style={[
              styles.uploadBox,
              {
                backgroundColor: colors.surface,
                borderColor: stage === 'error' ? colors.accent : colors.border,
                borderRadius: radius.lg,
              },
            ]}
            onPress={pickAndParse}
            activeOpacity={0.8}
          >
            <Feather name="file-text" size={32} color={colors.mutedForeground} />
            <Text style={[typography.body, { color: colors.foreground, marginTop: 12, fontFamily: 'DMSans_600SemiBold' }]}>
              {fileName ?? 'Tap to upload PDF'}
            </Text>
            {stage === 'error' ? (
              <Text style={[typography.bodySm, { color: colors.accent, marginTop: 6, textAlign: 'center' }]}>
                {errMsg}
              </Text>
            ) : (
              <Text style={[typography.bodySm, { color: colors.mutedForeground, marginTop: 6 }]}>
                PDF • up to 10 MB
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      ) : stage === 'uploading' || stage === 'parsing' ? (
        <Animated.View entering={FadeIn.springify()} style={styles.parsingBox}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[typography.body, { color: colors.foreground, marginTop: 16, fontFamily: 'DMSans_600SemiBold' }]}>
            {stage === 'uploading' ? 'Uploading…' : 'Reading your resume…'}
          </Text>
          <Text style={[typography.bodySm, { color: colors.mutedForeground, marginTop: 4 }]}>
            This usually takes about 10 seconds
          </Text>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.springify()} style={styles.successBox}>
          <View style={[styles.checkCircle, { backgroundColor: colors.success + '15' }]}>
            <Feather name="check-circle" size={32} color={colors.success} />
          </View>
          <Text style={[typography.h3, { color: colors.foreground, marginTop: 12 }]}>
            Resume imported
          </Text>
          <Text style={[typography.body, { color: colors.mutedForeground, marginTop: 4, textAlign: 'center' }]}>
            We found your experience, education, and skills. Review and edit them in the next step.
          </Text>
        </Animated.View>
      )}

      <View style={styles.footer}>
        {stage === 'done' ? (
          <BexoButton label="Review and continue" onPress={handleContinue} />
        ) : (
          <>
            {stage !== 'uploading' && stage !== 'parsing' ? (
              <BexoButton label="Upload PDF resume" onPress={pickAndParse} />
            ) : null}
            <BexoButton label="Fill in manually instead" onPress={handleManual} variant="ghost" />
          </>
        )}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  uploadBox: {
    padding: 32,
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  parsingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  successBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  checkCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  footer: { gap: 8, paddingBottom: 24 },
});
