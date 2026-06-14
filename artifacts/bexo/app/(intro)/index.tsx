import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography } from '@/constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { BexoButton } from '@/components/BexoButton';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: '✦',
    title: 'Your portfolio,\nbuilt from your phone.',
    body: 'Upload your resume or fill in a few details. Bexo turns them into a live portfolio site in minutes.',
  },
  {
    icon: '◈',
    title: 'A link that\nactually works.',
    body: 'Share {handle}.mybexo.com anywhere — jobs, LinkedIn, DMs. It loads fast, looks great, works everywhere.',
  },
  {
    icon: '◎',
    title: 'Keep it fresh\nwithout the friction.',
    body: 'Post an update in two taps. New role, project shipped, award won — your site reflects it immediately.',
  },
  {
    icon: '◉',
    title: 'Built for\nearly careers.',
    body: 'Made for students and new grads building their first professional presence. No fuss. Just your work, presented well.',
  },
];

export default function IntroScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setHasSeenWalkthrough = useAuthStore((s) => s.setHasSeenWalkthrough);
  const [activeSlide, setActiveSlide] = useState(0);

  const scrollX = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleContinue = () => {
    setHasSeenWalkthrough(true);
    router.replace('/(auth)');
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top + 24;

  const bgColors = [
    colors.background,
    colors.primaryLight,
    colors.warningLight,
    colors.infoLight,
  ];

  const rootStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(
      scrollX.value,
      [0, width, width * 2, width * 3],
      bgColors
    );
    return { backgroundColor: bg };
  });

  return (
    <Animated.View style={[styles.root, rootStyle]}>
      <View style={[styles.header, { paddingTop: topPad }]}>
        <Text style={[typography.h2, { color: colors.primary, fontFamily: 'DMSans_700Bold', letterSpacing: -0.5 }]}>
          bexo
        </Text>
      </View>

      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveSlide(idx);
        }}
        style={styles.carousel}
      >
        {SLIDES.map((slide, i) => {
          const slideStyle = useAnimatedStyle(() => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            
            const translateY = interpolate(
              scrollX.value,
              inputRange,
              [40, 0, -40],
              Extrapolation.CLAMP
            );
            
            const opacity = interpolate(
              scrollX.value,
              inputRange,
              [0, 1, 0],
              Extrapolation.CLAMP
            );

            return {
              opacity,
              transform: [{ translateY }],
            };
          });

          const iconStyle = useAnimatedStyle(() => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const scale = interpolate(
              scrollX.value,
              inputRange,
              [0.5, 1, 0.5],
              Extrapolation.CLAMP
            );
            const rotate = interpolate(
              scrollX.value,
              inputRange,
              [-45, 0, 45],
              Extrapolation.CLAMP
            );
            return {
              transform: [{ scale }, { rotate: `${rotate}deg` }],
            };
          });

          return (
            <View key={i} style={[styles.slide, { width }]}>
              <Animated.View style={iconStyle}>
                <Text style={[styles.emoji, { color: colors.primary }]}>{slide.icon}</Text>
              </Animated.View>
              <Animated.View style={slideStyle}>
                <Text style={[typography.display, styles.slideTitle, { color: colors.foreground }]}>
                  {slide.title}
                </Text>
                <Text style={[typography.bodyLg, styles.slideBody, { color: colors.mutedForeground }]}>
                  {slide.body}
                </Text>
              </Animated.View>
            </View>
          );
        })}
      </Animated.ScrollView>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => {
          const dotStyle = useAnimatedStyle(() => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const widthVal = interpolate(
              scrollX.value,
              inputRange,
              [6, 24, 6],
              Extrapolation.CLAMP
            );
            const opacity = interpolate(
              scrollX.value,
              inputRange,
              [0.4, 1, 0.4],
              Extrapolation.CLAMP
            );
            return { width: widthVal, opacity };
          });

          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: colors.primary },
                dotStyle,
              ]}
            />
          );
        })}
      </View>

      <Animated.View entering={FadeInDown.delay(300).springify()} style={[styles.footer, { paddingBottom: insets.bottom + 24, paddingHorizontal: 24 }]}>
        <BexoButton label="Get started" onPress={handleContinue} />
        <TouchableOpacity onPress={handleContinue} style={styles.skip}>
          <Text style={[typography.body, { color: colors.mutedForeground }]}>Skip intro</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 8 },
  carousel: { flex: 1 },
  slide: { paddingHorizontal: 24, paddingTop: 48 },
  emoji: { fontSize: 48, marginBottom: 24 },
  slideTitle: { marginBottom: 16, letterSpacing: -0.5 },
  slideBody: { lineHeight: 26 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 24 },
  dot: { height: 6, borderRadius: 3 },
  footer: { gap: 12 },
  skip: { alignItems: 'center', paddingVertical: 8 },
});
