import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';

export default function RootIndex() {
  const session = useAuthStore((s) => s.session);
  const onboardingStep = useProfileStore((s) => s.onboardingStep);
  const isOnboardingGateComplete = useProfileStore((s) => s.isOnboardingGateComplete);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!ready) return <View style={{ flex: 1, backgroundColor: '#F7F5F0' }} />;

  if (!session) {
    return <Redirect href="/(auth)" />;
  }

  if (onboardingStep === 'completed' || isOnboardingGateComplete()) {
    return <Redirect href="/(main)/(tabs)/dashboard" />;
  }

  const step = onboardingStep || 'email';
  const route = step === 'manual_review' ? 'manual-review' : step;
  return <Redirect href={`/(onboarding)/${route}` as `/${string}`} />;
}
