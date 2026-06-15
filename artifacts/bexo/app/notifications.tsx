import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, SectionList } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography, shadow } from '@/constants/theme';
import { useProfileStore, BexoNotification } from '@/stores/useProfileStore';

export default function NotificationsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
  } = useProfileStore();

  // Mark all as read after 1.5 seconds of viewing the screen
  useEffect(() => {
    const timer = setTimeout(() => {
      markAllNotificationsRead();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleClearAll = () => {
    Alert.alert('Clear History', 'Are you sure you want to delete all notifications?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: () => clearAllNotifications() },
    ]);
  };

  const getRelativeTime = (isoString: string) => {
    const elapsed = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(elapsed / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const getNotificationIconInfo = (type: BexoNotification['type']) => {
    switch (type) {
      case 'success':
        return { name: 'check-circle' as const, bg: '#DCFCE7', color: '#16A34A' };
      case 'build':
        return { name: 'globe' as const, bg: '#E6F4F1', color: '#0D6B5C' };
      case 'view':
        return { name: 'eye' as const, bg: '#F3E8FF', color: '#9333EA' };
      case 'warning':
        return { name: 'alert-triangle' as const, bg: '#FEF3C7', color: '#D97706' };
      default:
        return { name: 'info' as const, bg: '#DBEAFE', color: '#2563EB' };
    }
  };

  // Group notifications by date
  const groupNotifications = (items: BexoNotification[]) => {
    const today: BexoNotification[] = [];
    const yesterday: BexoNotification[] = [];
    const older: BexoNotification[] = [];

    const now = new Date();
    const todayStr = now.toDateString();

    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    const yestStr = yest.toDateString();

    items.forEach((item) => {
      const d = new Date(item.created_at);
      const dStr = d.toDateString();
      if (dStr === todayStr) {
        today.push(item);
      } else if (dStr === yestStr) {
        yesterday.push(item);
      } else {
        older.push(item);
      }
    });

    const sections = [];
    if (today.length > 0) sections.push({ title: 'Today', data: today });
    if (yesterday.length > 0) sections.push({ title: 'Yesterday', data: yesterday });
    if (older.length > 0) sections.push({ title: 'Older', data: older });
    return sections;
  };

  const sections = groupNotifications(notifications);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Sticky Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Feather name="chevron-down" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[typography.h3, { color: colors.foreground }]}>Notifications</Text>
          {unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllNotificationsRead}>
              <Text style={[styles.headerAction, { color: colors.primary }]}>Read all</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>
        <View style={[styles.border, { backgroundColor: colors.border }]} />
      </View>

      {/* Main List */}
      {notifications.length > 0 ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: '#059669' }]} />
              <Text style={[typography.overline, { color: colors.mutedForeground }]}>
                {title.toUpperCase()}
              </Text>
            </View>
          )}
          renderItem={({ item, index }) => {
            const iconInfo = getNotificationIconInfo(item.type);
            return (
              <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
                <TouchableOpacity
                  style={[
                    styles.notifRow,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                    !item.is_read && styles.unreadRow,
                  ]}
                  onPress={() => markNotificationRead(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconContainer, { backgroundColor: iconInfo.bg }]}>
                    <Feather name={iconInfo.name} size={18} color={iconInfo.color} />
                  </View>

                  <View style={styles.textContainer}>
                    <Text style={[typography.body, { color: colors.foreground, fontFamily: 'DMSans_600SemiBold', fontSize: 15 }]}>
                      {item.title}
                    </Text>
                    <Text style={[typography.bodySm, { color: colors.mutedForeground, marginTop: 4, lineHeight: 18 }]}>
                      {item.description}
                    </Text>
                    <Text style={[typography.caption, { color: colors.mutedForeground, marginTop: 6 }]}>
                      {getRelativeTime(item.created_at)}
                    </Text>
                  </View>

                  {!item.is_read && (
                    <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListFooterComponent={() => (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
              <Feather name="trash-2" size={16} color={colors.mutedForeground} />
              <Text style={[typography.bodySm, { color: colors.mutedForeground, fontFamily: 'DMSans_600SemiBold', marginLeft: 8 }]}>
                Clear notification history
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        /* Empty State */
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.primaryLight }]}>
            <Feather name="bell" size={40} color={colors.primary} />
          </View>
          <Text style={[typography.h3, { color: colors.foreground, marginTop: 20 }]}>
            All caught up!
          </Text>
          <Text style={[typography.body, { color: colors.mutedForeground, textAlign: 'center', marginTop: 10, paddingHorizontal: 40 }]}>
            We'll notify you here when your portfolio builds, gets views, or receives updates.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 70,
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  backBtn: { padding: 4 },
  headerAction: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    width: 60,
    textAlign: 'right',
  },
  border: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },

  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    ...shadow.sm,
  },
  unreadRow: {
    borderLeftWidth: 3,
    borderLeftColor: '#0D6B5C', // brand green accent on unread rows
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 6,
  },

  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    paddingVertical: 12,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
