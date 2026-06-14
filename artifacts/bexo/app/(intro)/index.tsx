import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography, radius } from '@/constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { BexoButton } from '@/components/BexoButton';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '✦',
    title: 'Your portfolio,\nbuilt from your phone.',
    body: 'Upload your resume or fill in a few details. Bexo turns them into a live portfolio site in minutes.',
  },
  {
    emoji: '◈',
    title: 'A link that\nactually works.',
    body: 'Share {handle}.mybexo.com anywhere — jobs, LinkedIn, DMs. It loads fast, looks great, works everywhere.',
  },
  {
    emoji: '◎',
    title: 'Keep it fresh\nwithout the friction.',
    body: 'Post an update in two taps. New role, project shipped, award won — your site reflects it immediately.',
  },
  {
    emoji: '◉',
    title: 'Built for\nearly careers.',
    body: 'Made for students and new grads building their first professional presence. No fuss. Just your work, presented well.',
  },
];

export default function IntroScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setHasSeenWalkthrough = useAuthStore((s) => s.setHasSeenWalkthrough);
  const scrollRef = useRef<ScrollView>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => {
        const next = (prev + 1) % SLIDES.length;
        scrollRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleContinue = () => {
    setHasSeenWalkthrough(true);
    router.replace('/(auth)');
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top + 24;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad }]}>
        <Text style={[typography.h2, { color: colors.primary, fontFamily: 'DMSans_700Bold', letterSpacing: -0.5 }]}>
          bexo
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveSlide(idx);
        }}
        style={styles.carousel}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <Animated.View entering={FadeInDown.delay(i * 60).springify()}>
              <Text style={[styles.emoji, { color: colors.primary }]}>{slide.emoji}</Text>
              <Text style={[typography.display, styles.slideTitle, { color: colors.foreground }]}>
                {slide.title}
              </Text>
              <Text style={[typography.bodyLg, styles.slideBody, { color: colors.mutedForeground }]}>
                {slide.body}
              </Text>
            </Animated.View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === activeSlide ? colors.primary : colors.border },
            ]}
          />
        ))}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24, paddingHorizontal: 24 }]}>
        <BexoButton label="Get started" onPress={handleContinue} />
        <TouchableOpacity onPress={handleContinue} style={styles.skip}>
          <Text style={[typography.body, { color: colors.mutedForeground }]}>Skip intro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 8 },
  carousel: { flex: 1 },
  slide: { paddingHorizontal: 24, paddingTop: 48 },
  emoji: { fontSize: 36, marginBottom: 24 },
  slideTitle: { marginBottom: 16, letterSpacing: -0.5 },
  slideBody: { lineHeight: 26 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 24 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  footer: { gap: 12 },
  skip: { alignItems: 'center', paddingVertical: 8 },
});
