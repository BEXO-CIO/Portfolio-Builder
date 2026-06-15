import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
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

// ── Date Picker (Month + Year horizontal scroller) ───────────────────────────

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PICKER_YEARS = Array.from({ length: 40 }, (_, i) => new Date().getFullYear() + 5 - i);

type DatePickerProps = {
  visible: boolean;
  /** If true, only shows year selector (no month row) */
  yearOnly?: boolean;
  /** Current formatted value like "Jan 2024" or "2024" */
  value?: string;
  onConfirm: (formatted: string) => void;
  onClose: () => void;
};

export function DatePickerSheet({ visible, yearOnly, value, onConfirm, onClose }: DatePickerProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  // Parse initial month/year from value
  const parsedMonth = (() => {
    if (value) {
      const parts = value.split(' ');
      if (parts.length === 2 && SHORT_MONTHS.includes(parts[0])) return parts[0];
    }
    return SHORT_MONTHS[new Date().getMonth()];
  })();
  const parsedYear = (() => {
    if (value) {
      const parts = value.split(' ');
      if (parts.length === 2) return parts[1];
      if (parts.length === 1 && parts[0].length === 4) return parts[0];
    }
    return new Date().getFullYear().toString();
  })();

  const [tempMonth, setTempMonth] = useState(parsedMonth);
  const [tempYear, setTempYear] = useState(parsedYear);

  // Reset when opening
  React.useEffect(() => {
    if (visible) {
      setTempMonth(parsedMonth);
      setTempYear(parsedYear);
    }
  }, [visible]);

  const handleConfirm = () => {
    const formatted = yearOnly ? tempYear : `${tempMonth} ${tempYear}`;
    onConfirm(formatted);
    onClose();
  };

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
          <Text style={[typography.h3, { color: colors.foreground }]}>Select Date</Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {!yearOnly && (
          <>
            <Text style={[typography.label, { color: colors.mutedForeground, paddingHorizontal: 20, marginBottom: 8 }]}>MONTH</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
              {SHORT_MONTHS.map(m => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setTempMonth(m)}
                  style={[styles.dateChip, {
                    backgroundColor: tempMonth === m ? colors.primary : colors.background,
                    borderColor: tempMonth === m ? colors.primary : colors.border,
                  }]}
                >
                  <Text style={[typography.body, { color: tempMonth === m ? '#fff' : colors.foreground }]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <Text style={[typography.label, { color: colors.mutedForeground, paddingHorizontal: 20, marginTop: 24, marginBottom: 8 }]}>YEAR</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
          {PICKER_YEARS.map(y => (
            <TouchableOpacity
              key={y}
              onPress={() => setTempYear(y.toString())}
              style={[styles.dateChip, {
                backgroundColor: tempYear === y.toString() ? colors.primary : colors.background,
                borderColor: tempYear === y.toString() ? colors.primary : colors.border,
              }]}
            >
              <Text style={[typography.body, { color: tempYear === y.toString() ? '#fff' : colors.foreground }]}>{y}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.dateConfirmBtn, { backgroundColor: colors.primary }]}
          onPress={handleConfirm}
        >
          <Text style={[typography.body, { color: '#fff', fontFamily: 'DMSans_600SemiBold' }]}>Confirm Date</Text>
        </TouchableOpacity>
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
  dateChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  dateConfirmBtn: {
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
});
