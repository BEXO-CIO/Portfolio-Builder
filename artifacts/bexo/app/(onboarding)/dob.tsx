import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { typography, radius } from '@/constants/theme';
import { useProfileStore } from '@/stores/useProfileStore';
import { OnboardingShell } from '@/components/OnboardingShell';
import { ScreenHeader } from '@/components/ScreenHeader';
import { BexoButton } from '@/components/BexoButton';
import { YearPickerSheet, MonthPickerSheet, DayPickerSheet } from '@/components/PickerSheets';

export default function DobStep() {
  const colors = useColors();
  const router = useRouter();
  const { updateProfile, setOnboardingStep } = useProfileStore();
  const [day, setDay] = useState<number | null>(null);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState<number | null>(null);
  const [showDay, setShowDay] = useState(false);
  const [showMonth, setShowMonth] = useState(false);
  const [showYear, setShowYear] = useState(false);

  const handleNext = () => {
    if (day && month && year) {
      const monthIndex = [
        'January','February','March','April','May','June',
        'July','August','September','October','November','December',
      ].indexOf(month) + 1;
      const dobStr = `${year}-${String(monthIndex).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      updateProfile({ dob: dobStr });
    }
    setOnboardingStep('theme');
    router.push('/(onboarding)/theme');
  };

  const filled = !!day && !!month && !!year;

  return (
    <OnboardingShell step="dob" onBack={() => router.back()}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Date of birth" subtitle="Used to personalise your experience. Only the year appears publicly." />

        <TouchableOpacity
          style={[styles.picker, { borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.surface }]}
          onPress={() => setShowDay(true)}
        >
          <Text style={[typography.bodyLg, { color: day ? colors.foreground : colors.mutedForeground }]}>
            {day ? String(day) : 'Day'}
          </Text>
          <Feather name="chevron-down" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.picker, { borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.surface }]}
          onPress={() => setShowMonth(true)}
        >
          <Text style={[typography.bodyLg, { color: month ? colors.foreground : colors.mutedForeground }]}>
            {month || 'Month'}
          </Text>
          <Feather name="chevron-down" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.picker, { borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.surface }]}
          onPress={() => setShowYear(true)}
        >
          <Text style={[typography.bodyLg, { color: year ? colors.foreground : colors.mutedForeground }]}>
            {year ? String(year) : 'Year'}
          </Text>
          <Feather name="chevron-down" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>

        <View style={styles.footer}>
          <BexoButton label="Continue" onPress={handleNext} />
          {!filled ? (
            <BexoButton label="Skip" onPress={handleNext} variant="ghost" />
          ) : null}
        </View>

        <DayPickerSheet visible={showDay} selected={day ?? undefined} onSelect={setDay} onClose={() => setShowDay(false)} />
        <MonthPickerSheet visible={showMonth} selected={month} onSelect={setMonth} onClose={() => setShowMonth(false)} />
        <YearPickerSheet visible={showYear} selected={year ?? undefined} onSelect={setYear} onClose={() => setShowYear(false)} />
      </ScrollView>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  picker: {
    height: 52,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  footer: { gap: 8, paddingTop: 8, paddingBottom: 24 },
});
