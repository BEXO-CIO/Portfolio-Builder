import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  padHorizontal?: boolean;
  padTop?: boolean;
};

export function ScreenShell({
  children,
  scroll = false,
  padHorizontal = true,
  padTop = false,
}: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const topPad = padTop ? (Platform.OS === 'web' ? 67 : insets.top) : 0;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const containerStyle = [
    styles.container,
    {
      backgroundColor: colors.background,
      paddingHorizontal: padHorizontal ? 20 : 0,
      paddingTop: topPad,
      paddingBottom: bottomPad,
    },
  ];

  if (scroll) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.background }}
          contentContainerStyle={containerStyle}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View style={containerStyle}>{children}</View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
