import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useColors';
import { typography, radius } from '@/constants/theme';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 60 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type YearProps = {
  visible: boolean;
  selected?: number;
  onSelect: (year: number) => void;
  onClose: () => void;
  allowCurrent?: boolean;
};

export function YearPickerSheet({ visible, selected, onSelect, onClose, allowCurrent }: YearProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const items = allowCurrent ? ['Present', ...YEARS.map(String)] : YEARS.map(String);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            paddingBottom: insets.bottom + 16,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        <View style={styles.sheetHeader}>
          <Text style={[typography.h3, { color: colors.foreground }]}>Select Year</Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={items}
          keyExtractor={(item) => item}
          style={styles.list}
          renderItem={({ item }) => {
            const val = item === 'Present' ? 0 : parseInt(item);
            const isSelected = selected === val;
            return (
              <TouchableOpacity
                style={[styles.item, { borderBottomColor: colors.border }]}
                onPress={() => { onSelect(val); onClose(); }}
              >
                <Text
                  style={[
                    typography.bodyLg,
                    {
                      color: isSelected ? colors.primary : colors.foreground,
                      fontFamily: isSelected ? 'DMSans_600SemiBold' : 'DMSans_400Regular',
                    },
                  ]}
                >
                  {item}
                </Text>
                {isSelected ? (
                  <Feather name="check" size={16} color={colors.primary} />
                ) : null}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Modal>
  );
}

type MonthProps = {
  visible: boolean;
  selected?: string;
  onSelect: (month: string) => void;
  onClose: () => void;
};

export function MonthPickerSheet({ visible, selected, onSelect, onClose }: MonthProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            paddingBottom: insets.bottom + 16,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        <View style={styles.sheetHeader}>
          <Text style={[typography.h3, { color: colors.foreground }]}>Select Month</Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={MONTHS}
          keyExtractor={(item) => item}
          style={styles.list}
          renderItem={({ item }) => {
            const isSelected = selected === item;
            return (
              <TouchableOpacity
                style={[styles.item, { borderBottomColor: colors.border }]}
                onPress={() => { onSelect(item); onClose(); }}
              >
                <Text
                  style={[
                    typography.bodyLg,
                    {
                      color: isSelected ? colors.primary : colors.foreground,
                      fontFamily: isSelected ? 'DMSans_600SemiBold' : 'DMSans_400Regular',
                    },
                  ]}
                >
                  {item}
                </Text>
                {isSelected ? (
                  <Feather name="check" size={16} color={colors.primary} />
                ) : null}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

type DayProps = {
  visible: boolean;
  selected?: number;
  onSelect: (day: number) => void;
  onClose: () => void;
};

export function DayPickerSheet({ visible, selected, onSelect, onClose }: DayProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            paddingBottom: insets.bottom + 16,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        <View style={styles.sheetHeader}>
          <Text style={[typography.h3, { color: colors.foreground }]}>Select Day</Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={DAYS}
          keyExtractor={(item) => item}
          style={styles.list}
          renderItem={({ item }) => {
            const val = parseInt(item);
            const isSelected = selected === val;
            return (
              <TouchableOpacity
                style={[styles.item, { borderBottomColor: colors.border }]}
                onPress={() => { onSelect(val); onClose(); }}
              >
                <Text
                  style={[
                    typography.bodyLg,
                    {
                      color: isSelected ? colors.primary : colors.foreground,
                      fontFamily: isSelected ? 'DMSans_600SemiBold' : 'DMSans_400Regular',
                    },
                  ]}
                >
                  {item}
                </Text>
                {isSelected ? (
                  <Feather name="check" size={16} color={colors.primary} />
                ) : null}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(28,25,23,0.4)' },
  sheet: { maxHeight: '70%' },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12 },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  list: { paddingHorizontal: 20 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
