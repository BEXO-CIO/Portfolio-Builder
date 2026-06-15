import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated as RNAnimated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import Animated, { FadeInDown, interpolate, Extrapolation, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography, shadow } from '@/constants/theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { EmptyState } from '@/components/EmptyState';

const { width } = Dimensions.get('window');

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Stats column component for inside the unified white card
function StatCol({ label, sublabel, value, icon, delay, showDivider }: {
  label: string; sublabel: string; value: number; icon: string; delay: number; showDivider?: boolean;
}) {
  const animVal = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.timing(animVal, {
      toValue: value,
      duration: 600,
      delay: delay * 80,
      useNativeDriver: false,
    }).start();
  }, [value]);

  return (
    <Animated.View entering={FadeInDown.delay(delay * 60).springify()} style={[styles.statCol, showDivider && styles.statDivider]}>
      <View style={styles.statIconWrap}>
        <Feather name={icon as any} size={18} color="#0B4239" />
      </View>
      <RNAnimated.Text style={styles.statValue}>
        {value}
      </RNAnimated.Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSublabel}>{sublabel}</Text>
    </Animated.View>
  );
}

// Background dot grid pattern component
function DotGrid() {
  return (
    <View style={styles.dotGridContainer}>
      {Array.from({ length: 4 }).map((_, r) => (
        <View key={`r-${r}`} style={styles.dotGridRow}>
          {Array.from({ length: 4 }).map((_, c) => (
            <View key={`c-${c}`} style={styles.dot} />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuthStore();
  const { profile, education, experiences, projects, skills, updates, notifications, getCompleteness, startSync } = useProfileStore();
  const { buildStatus, portfolioUrl } = usePortfolioStore();
  const completeness = getCompleteness();
  const hasUnread = notifications?.some(n => !n.is_read) ?? false;
  const topPad = Platform.OS === 'web' ? 67 : insets.top + 12;

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (profile?.user_id) {
      startSync(profile.user_id);
    }
    setTimeout(() => setRefreshing(false), 1500);
  }, [profile?.user_id]);

  const firstName = profile?.full_name?.split(' ')[0] ?? session?.user.displayName?.split(' ')[0] ?? 'there';
  const avatarUrl = profile?.avatar_url ?? session?.user.photoURL;

  const pulseAnim = useSharedValue(1);
  useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: interpolate(pulseAnim.value, [1, 1.4], [1, 0.4]),
  }));

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => { scrollY.value = e.contentOffset.y; },
  });

  const handleProgressClick = () => {
    if (completeness >= 100) return;
    
    const missing: { text: string, route: any }[] = [];
    const hasIdentity = !!(profile?.full_name && profile?.handle && profile?.avatar_url);
    if (!hasIdentity) missing.push({ text: '• Profile details (Name, Handle, Photo)', route: '/edit-profile' });
    
    const hasBio = !!(profile?.headline && profile?.bio && profile.bio.trim().length > 0 && profile?.location);
    if (!hasBio) missing.push({ text: '• Bio & Location (Add a headline, bio, and location)', route: '/edit-profile' });

    if (education.length < 1) missing.push({ text: '• Education (Add at least 1)', route: '/(main)/(tabs)/update' });
    if (experiences.length < 1) missing.push({ text: '• Experience (Add at least 1 role)', route: '/(main)/(tabs)/update' });
    if (projects.length < 1) missing.push({ text: '• Projects (Add at least 1 project)', route: '/(main)/(tabs)/update' });
    if (skills.length < 3) missing.push({ text: '• Skills (Add at least 3 skills)', route: '/edit-profile' });

    Alert.alert(
      'Missing Details',
      `Complete these to reach 100%:\n\n${missing.map(m => m.text).join('\n')}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update Profile', 
          onPress: () => {
            const route = missing[0]?.route || '/edit-profile';
            router.push(route);
          }
        }
      ]
    );
  };

  const headerHeight = 300 + topPad;

  const stickyHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [headerHeight - 100, headerHeight - 40], [0, 1], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [headerHeight - 100, headerHeight - 40], [-20, 0], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  const heroStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, headerHeight - 100], [1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, headerHeight], [0, -headerHeight * 0.4], Extrapolation.CLAMP);
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9F9' }}>
      {/* Background color for overscroll on iOS */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 400, backgroundColor: '#07443B' }} />

      {/* Sticky Blurred Header */}
      <Animated.View style={[styles.stickyHeader, { height: topPad + 44, paddingTop: topPad }, stickyHeaderStyle]}>
        <BlurView intensity={80} tint={colors.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFillObject} />
        <View style={styles.stickyHeaderContent}>
          <Text style={[typography.h3, { color: colors.foreground }]}>{getGreeting()} {firstName}</Text>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.stickyAvatar} /> : <View style={styles.stickyAvatar} />}
          </TouchableOpacity>
        </View>
        <View style={[styles.stickyBorder, { backgroundColor: colors.border }]} />
      </Animated.View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
            progressViewOffset={topPad + 20}
          />
        }
      >
        {/* ── Hero header section ────────────────────────────────────────────── */}
        <Animated.View style={heroStyle}>
          <LinearGradient
            colors={['#07443B', '#063A31', '#052A23']}
            style={[styles.hero, { paddingTop: topPad, paddingBottom: 80 }]} // Extra padding to go behind the card
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            {/* Notification Bell */}
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={[styles.notificationBellWrap, { top: topPad + 4 }]}
              hitSlop={12}
              activeOpacity={0.7}
            >
              <Feather name="bell" size={20} color="#FFFFFF" />
              {hasUnread && <View style={styles.notificationDot} />}
            </TouchableOpacity>
            <View style={{ position: 'absolute', right: 30, top: topPad + 120 }}>
              <DotGrid />
            </View>

            <View style={styles.heroRow}>
              <View style={styles.heroTextContainer}>
                <Text style={styles.greeting}>{getGreeting()}</Text>
                <Text style={styles.heroName}>
                  {firstName}
                  <Text style={{ color: '#10B981' }}>.</Text>
                </Text>

                <View style={styles.statusRow}>
                  {buildStatus === 'DONE' && (
                    <View style={styles.livePill}>
                      <View style={{ position: 'relative', width: 8, height: 8, marginRight: 6 }}>
                        <Animated.View style={[styles.liveDot, { position: 'absolute', backgroundColor: '#4ADE80' }, pulseStyle]} />
                        <View style={[styles.liveDot, { backgroundColor: '#4ADE80' }]} />
                      </View>
                      <Text style={styles.livePillText}>Portfolio live</Text>
                    </View>
                  )}
                </View>

                {/* Contact buttons */}
                <View style={styles.contactRow}>
                  <TouchableOpacity 
                    style={styles.contactBtn}
                    activeOpacity={0.7}
                    onPress={() => {
                      Alert.alert(
                        'Phone Number',
                        profile?.phone ?? 'No phone number available',
                        [{ text: 'Close', style: 'cancel' }]
                      );
                    }}
                  >
                    <Feather name="smartphone" size={14} color="#FFFFFF" />
                    <Text style={styles.contactBtnText}>
                      {profile?.phone ? profile.phone : 'Phone'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.contactBtn}
                    activeOpacity={0.7}
                    onPress={() => {
                      Alert.alert(
                        'Email Address',
                        profile?.email ?? 'No email available',
                        [{ text: 'Close', style: 'cancel' }]
                      );
                    }}
                  >
                    <Feather name="mail" size={14} color="#FFFFFF" />
                    <Text style={styles.contactBtnText}>
                      {profile?.email ? (profile.email.length > 20 ? `${profile.email.slice(0, 17)}...` : profile.email) : 'Email'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Avatar */}
              <View style={styles.avatarContainer}>
                <TouchableOpacity onPress={() => router.push('/settings')} hitSlop={8}>
                  {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitial}>
                        {firstName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                <View style={[styles.onlineBadge, buildStatus !== 'DONE' && { backgroundColor: '#4B5563', borderColor: '#063A31' }]}>
                  <Text style={styles.onlineText}>{buildStatus === 'DONE' ? 'Online' : 'Offline'}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.body}>

          {/* ── Unified Stats Card ──────────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.unifiedCard}>
            {/* Progress Section */}
            {completeness < 100 && (
              <TouchableOpacity activeOpacity={0.7} onPress={handleProgressClick} style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Your Progress</Text>
                  <Text style={styles.progressPercent}>{Math.round(completeness)}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <LinearGradient
                    colors={['#0B4239', '#10B981']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${Math.max(10, completeness)}%` as any }]}
                  />
                </View>
              </TouchableOpacity>
            )}

            {/* Stats Row inside Unified Card */}
            <View style={styles.statsRow}>
              <StatCol label="Experience" sublabel="Years" value={experiences.length} icon="briefcase" delay={1} showDivider />
              <StatCol label="Projects" sublabel="Completed" value={projects.length} icon="code" delay={2} showDivider />
              <StatCol label="Skills" sublabel="Mastered" value={skills.length} icon="zap" delay={3} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Pressable
              style={styles.urlCard}
              onPress={() => {
                if (buildStatus === 'DONE' && portfolioUrl) {
                  Linking.openURL(portfolioUrl.startsWith('http') ? portfolioUrl : `https://${portfolioUrl}`);
                } else {
                  router.push('/(main)/(tabs)/portfolio');
                }
              }}
            >
              <View style={styles.urlIconWrap}>
                <Feather name={buildStatus === 'DONE' ? 'globe' : 'lock'} size={20} color="#FFFFFF" />
              </View>
              <View style={styles.urlTextWrap}>
                <Text style={styles.urlPrimaryText}>
                  {buildStatus === 'DONE' && portfolioUrl
                    ? portfolioUrl
                    : profile?.handle ? `${profile.handle}.mybexo.com` : 'yourhandle.mybexo.com'}
                </Text>
                <Text style={styles.urlSubText}>Visit your portfolio website</Text>
              </View>
              <View style={styles.urlActionBtn}>
                <Feather name="arrow-up-right" size={20} color="#FFFFFF" />
              </View>
            </Pressable>
          </Animated.View>

          {/* ── Recent updates ──────────────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(120).springify()} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Updates</Text>
              <TouchableOpacity onPress={() => router.push('/(main)/(tabs)/update')} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.viewAllText}>View all</Text>
                <Feather name="arrow-right" size={14} color="#10B981" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>

            {updates?.length === 0 || !updates ? (
              <EmptyState icon="activity" title="No updates yet" message="Post an achievement, new role, or project." />
            ) : (
              (updates as any[]).slice(0, 3).map((u: any) => (
                <TouchableOpacity
                  key={u.id}
                  style={styles.updateCard}
                  activeOpacity={0.7}
                  onPress={() => router.push({ pathname: '/edit-item', params: { id: u.id, category: 'update' } })}
                >
                  <View style={styles.updateIconWrap}>
                    <Feather name={u.type === 'role' ? 'briefcase' : u.type === 'education' ? 'book-open' : u.type === 'project' ? 'terminal' : 'star'} size={16} color="#0B3A36" />
                  </View>
                  <View style={styles.updateTextContent}>
                    <Text style={styles.updateItemTitle}>{u.title}</Text>
                    <Text style={styles.updateItemSub}>{u.type}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.updateTime}>{formatRelative(u.created_at)}</Text>
                    <Feather name="chevron-right" size={14} color="#10B981" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </Animated.View>

          {/* ── Quote Footer ────────────────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(160).springify()} style={{ marginBottom: 40 }}>
            <View style={styles.quoteCard}>
              <View style={styles.quoteIconWrap}>
                <Feather name="message-square" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.quoteText}>Discipline today, success tomorrow.</Text>
              <View style={{ position: 'absolute', right: 16, top: 20, opacity: 0.15 }}>
                 <DotGrid />
              </View>
            </View>
          </Animated.View>

        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {},
  stickyHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 100,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stickyHeaderContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: -4 },
  stickyAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.1)' },
  stickyBorder: { position: 'absolute', bottom: 0, left: 0, right: 0, height: StyleSheet.hairlineWidth },

  hero: {
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 60, // Ensure overlap
  },
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 16 },
  heroTextContainer: { flex: 1, paddingRight: 16 },
  greeting: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: '#E5E7EB', marginBottom: 4 },
  heroName: { fontFamily: 'DMSans_700Bold', fontSize: 34, color: '#FFFFFF', letterSpacing: -0.8, lineHeight: 40 },
  statusRow: { marginTop: 6, marginBottom: 16 },
  heroSub: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: '#D1D5DB' },
  livePill: { flexDirection: 'row', alignItems: 'center' },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  livePillText: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: '#4ADE80' },
  
  contactRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  contactBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  contactBtnText: { color: '#FFFFFF', fontFamily: 'DMSans_500Medium', fontSize: 13 },

  avatarContainer: { position: 'relative' },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: '#10B981', ...shadow.lg },
  avatarPlaceholder: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#10B981',
  },
  avatarInitial: { fontFamily: 'DMSans_700Bold', fontSize: 28, color: '#FFFFFF' },
  onlineBadge: {
    position: 'absolute', bottom: -6, alignSelf: 'center',
    backgroundColor: '#059669', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 12, borderWidth: 2, borderColor: '#063A31',
  },
  onlineText: { color: '#FFFFFF', fontSize: 10, fontFamily: 'DMSans_600SemiBold' },

  notificationBellWrap: {
    position: 'absolute',
    right: 110,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#063A31',
  },
  dotGridContainer: { gap: 4 },
  dotGridRow: { flexDirection: 'row', gap: 4 },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.2)' },

  body: { paddingHorizontal: 20, marginTop: -60 }, // Pull up over the hero gradient
  
  unifiedCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 5,
  },
  progressSection: { marginBottom: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progressTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: '#111827' },
  progressPercent: { fontFamily: 'DMSans_700Bold', fontSize: 15, color: '#059669' },
  progressTrack: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 20 },
  statCol: { flex: 1, alignItems: 'center' },
  statDivider: { borderRightWidth: 1, borderRightColor: '#F3F4F6' },
  statIconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 8, backgroundColor: '#ECFDF5' },
  statValue: { fontFamily: 'DMSans_700Bold', fontSize: 22, color: '#111827' },
  statLabel: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: '#374151', marginTop: 2 },
  statSublabel: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: '#6B7280' },

  urlCard: {
    backgroundColor: '#0B4239', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 24,
    shadowColor: '#0B3A36', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
  },
  urlIconWrap: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  urlTextWrap: { flex: 1 },
  urlPrimaryText: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: '#FFFFFF', marginBottom: 2 },
  urlSubText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  urlActionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 16, color: '#111827' },
  viewAllText: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: '#10B981' },
  
  updateCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2 },
  updateIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  updateTextContent: { flex: 1 },
  updateItemTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: '#111827', marginBottom: 2 },
  updateItemSub: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#6B7280' },
  updateTime: { fontFamily: 'DMSans_500Medium', fontSize: 11, color: '#10B981' },

  quickAccessGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  quickAccessBtn: { width: (width - 40 - 24) / 4, backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  quickAccessLabel: { fontFamily: 'DMSans_500Medium', fontSize: 11, color: '#111827' },

  quoteCard: { backgroundColor: '#0B4239', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  quoteIconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  quoteText: { flex: 1, fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#FFFFFF' },
});
