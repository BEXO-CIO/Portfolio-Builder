import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// @ts-ignore
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { useColors } from '@/hooks/useColors';
import { typography } from '@/constants/theme';

import { BlurView } from 'expo-blur';

function TabIcon({ name, focused, color }: { name: any, focused: boolean, color: string }) {
  const scale = useSharedValue(focused ? 1.1 : 1);
  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, { damping: 12 });
  }, [focused]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={style}>
      <Feather name={name} size={20} color={color} />
    </Animated.View>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom + (Platform.OS === 'ios' ? 0 : 16) }]}>
      <BlurView
        intensity={80}
        tint={colors.isDark ? 'dark' : 'light'}
        style={[styles.tabBar, { backgroundColor: colors.isDark ? 'rgba(26,26,31,0.6)' : 'rgba(255,255,255,0.7)', borderColor: colors.border }]}
      >
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const isCenterPlus = route.name === 'update';
          const iconName = route.name === 'dashboard' ? 'home' : route.name === 'portfolio' ? 'globe' : 'plus';

          if (isCenterPlus) {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tabItem}
                activeOpacity={0.8}
              >
                <View style={[styles.centerIconWrap, { backgroundColor: '#10B981' }]}>
                  <Feather name="plus" size={24} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.8}
            >
              <View style={[styles.iconWrapper, isFocused && { backgroundColor: '#ECFDF5' }]}>
                <TabIcon name={iconName} focused={isFocused} color={isFocused ? '#059669' : colors.mutedForeground} />
                {isFocused && (
                  <Animated.Text entering={FadeIn.duration(200)} style={[styles.tabLabel, { color: '#059669' }]}>
                    {options.title}
                  </Animated.Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Custom 4th profile button */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/settings');
          }}
          activeOpacity={0.8}
        >
          <View style={styles.iconWrapper}>
            <Feather name="user" size={20} color={colors.mutedForeground} />
          </View>
        </TouchableOpacity>

      </BlurView>
    </View>
  );
}

export default function MainTabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Home' }} />
      <Tabs.Screen name="portfolio" options={{ title: 'Portfolio' }} />
      <Tabs.Screen name="update" options={{ title: 'Post' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    pointerEvents: 'box-none',
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  centerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  tabLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
  },
});
