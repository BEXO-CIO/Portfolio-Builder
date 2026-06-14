import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export default function RootIndex() {
  const session = useAuthStore((s) => s.session);
  const onboardingStep = useProfileStore((s) => s.onboardingStep);
  const isOnboardingGateComplete = useProfileStore((s) => s.isOnboardingGateComplete);
  const startProfileSync = useProfileStore((s) => s.startSync);
  const stopProfileSync = useProfileStore((s) => s.stopSync);
  const startPortfolioSync = usePortfolioStore((s) => s.startSync);
  const stopPortfolioSync = usePortfolioStore((s) => s.stopSync);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (session?.user.id) {
      startProfileSync(session.user.id);
      startPortfolioSync(session.user.id);
    } else {
      stopProfileSync();
      stopPortfolioSync();
    }
  }, [session?.user.id]);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 120);
    return () => clearTimeout(t);
  }, []);

  if (!ready) return <View style={{ flex: 1, backgroundColor: '#0F0F11' }} />;

  // ── No session at all → go to phone entry
  if (!session) return <Redirect href="/(auth)" />;

  // ── Phone verified but Google not yet linked → force Google step
  if (session.phoneVerified && !session.emailVerified) {
    return <Redirect href="/(auth)/verify-email" />;
  }

  // ── Both verified → check onboarding progress
  if (session.phoneVerified && session.emailVerified) {
    if (onboardingStep === 'completed' || isOnboardingGateComplete()) {
      return <Redirect href="/(main)/(tabs)/dashboard" />;
    }
    const step = onboardingStep || 'photo'; // skip email step — email already verified via Google
    const route = step === 'manual_review' ? 'manual-review' : step;
    return <Redirect href={`/(onboarding)/${route}` as `/${string}`} />;
  }

  return <Redirect href="/(auth)" />;
}
