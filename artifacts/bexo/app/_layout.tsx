import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  useFonts as useDMSansFonts,
} from '@expo-google-fonts/dm-sans';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
  useFonts as useMonoFonts,
} from '@expo-google-fonts/jetbrains-mono';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/ErrorBoundary';
// Initialise Firebase + attach onAuthStateChanged session listener early.
// This import is a deliberate side-effect — do not remove or tree-shake.
import '@/services/firebase';
import '@/stores/useAuthStore';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [dmFontsLoaded, dmFontError] = useDMSansFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  const [monoFontsLoaded, monoFontError] = useMonoFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  const fontsLoaded = dmFontsLoaded && monoFontsLoaded;
  const fontError = dmFontError || monoFontError;

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch((err) => {
        console.warn('[SplashScreen] hideAsync failed:', err.message);
      });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(intro)/index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(onboarding)" />
                <Stack.Screen name="(main)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="edit-profile"
                  options={{ headerShown: false, presentation: 'modal' }}
                />
                <Stack.Screen
                  name="settings"
                  options={{ headerShown: false, presentation: 'modal' }}
                />
                <Stack.Screen
                  name="notifications"
                  options={{ headerShown: false, presentation: 'modal' }}
                />
                <Stack.Screen
                  name="details"
                  options={{ headerShown: true, title: 'Details' }}
                />
                <Stack.Screen
                  name="edit-item"
                  options={{ headerShown: false, presentation: 'modal' }}
                />
                <Stack.Screen name="faq" options={{ headerShown: false }} />
                <Stack.Screen name="privacy" options={{ headerShown: false }} />
                <Stack.Screen name="terms" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
