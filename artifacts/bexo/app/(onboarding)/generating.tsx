import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useColors } from '@/hooks/useColors';
import { typography, spacing } from '@/constants/theme';
import { useProfileStore } from '@/stores/useProfileStore';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { BuildStatusCard } from '@/components/BuildStatusCard';
import { ProgressRing } from '@/components/ProgressRing';
import { BexoButton } from '@/components/BexoButton';
import { OnboardingShell } from '@/components/OnboardingShell';

/**
 * Returns the route to the specific onboarding screen where the user
 * should go to fill in missing data, based on completeness weights.
 */
function getMissingRoute(store: ReturnType<typeof useProfileStore.getState>): string {
  const { profile, education, experiences, projects, skills } = store;
  if (!profile?.avatar_url) return '/(onboarding)/photo';
  if (!profile?.handle || profile.handle.length < 3) return '/(onboarding)/handle';
  if (!profile?.headline || !profile?.bio || !profile.bio.trim() || !profile?.location) return '/(onboarding)/about';
  if (education.length < 1 || experiences.length < 1 || projects.length < 1) return '/(onboarding)/cards';
  if (skills.length < 3) return '/(onboarding)/cards';
  if (profile.portfolio_theme === 'default' && profile.portfolio_font === 'modern') return '/(onboarding)/theme';
  return '/(onboarding)/preference';
}

export default function GeneratingScreen() {
  const colors = useColors();
  const router = useRouter();
  const { profile, getCompleteness, updateProfile, setOnboardingStep } = useProfileStore();
  const { buildStatus, portfolioUrl, buildLog, triggerBuild } = usePortfolioStore();
  const triggered = useRef(false);
  const completeness = getCompleteness();

  useEffect(() => {
    if (!triggered.current && completeness >= 90 && buildStatus !== 'DONE' && buildStatus !== 'BUILDING') {
      triggered.current = true;
      triggerBuild(profile?.user_id ?? 'user');
    }
  }, []);

  useEffect(() => {
    if (buildStatus === 'DONE') {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      updateProfile({ is_published: true });
      setOnboardingStep('completed');
      setTimeout(() => {
        router.replace('/(main)/(tabs)/dashboard');
      }, 2000);
    }
  }, [buildStatus]);

  const isReady = completeness >= 90;

  const handleGoBack = () => {
    const route = getMissingRoute(useProfileStore.getState());
    router.push(route as any);
  };

  return (
    <OnboardingShell step="generating" onBack={() => router.back()}>
      <View style={styles.center}>
        <Animated.View entering={FadeIn.springify()} style={styles.ringWrap}>
          <ProgressRing percent={completeness} size={96} strokeWidth={6} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.textBlock}>
          <Text style={[typography.h2, { color: colors.foreground, textAlign: 'center', letterSpacing: -0.3 }]}>
            {buildStatus === 'DONE'
              ? 'Your portfolio is live!'
              : buildStatus === 'FAILED'
              ? 'Something went wrong'
              : isReady
              ? 'Building your portfolio…'
              : 'Almost there'}
          </Text>
          <Text style={[typography.body, { color: colors.mutedForeground, textAlign: 'center', marginTop: 10 }]}>
            {buildStatus === 'DONE'
              ? `Visit ${portfolioUrl}`
              : buildStatus === 'FAILED'
              ? 'Please try again in a moment.'
              : isReady
              ? 'Compiling your content and applying your theme.'
              : `Your profile is ${Math.round(completeness)}% complete. Reach 90% to generate your site.`}
          </Text>
        </Animated.View>

        {buildStatus ? (
          <Animated.View entering={FadeInDown.delay(160).springify()} style={styles.card}>
            <BuildStatusCard status={buildStatus} portfolioUrl={portfolioUrl} buildLog={buildLog} />
          </Animated.View>
        ) : null}

        {buildStatus === 'FAILED' ? (
          <BexoButton
            label="Try again"
            onPress={() => { triggered.current = false; triggerBuild(profile?.user_id ?? 'user'); }}
          />
        ) : null}

        {!isReady ? (
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <BexoButton
              label="Complete missing details"
              onPress={handleGoBack}
              variant="secondary"
            />
          </Animated.View>
        ) : null}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 24 },
  ringWrap: { alignItems: 'center' },
  textBlock: { alignItems: 'center', gap: 4, paddingHorizontal: 12 },
  card: { width: '100%' },
});
