import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { typography, radius, spacing, shadow } from '@/constants/theme';
import { useProfileStore } from '@/stores/useProfileStore';
import { OnboardingShell } from '@/components/OnboardingShell';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FormField } from '@/components/FormField';
import { BexoButton } from '@/components/BexoButton';
import { YearPickerSheet } from '@/components/PickerSheets';

export default function ManualStep() {
  const colors = useColors();
  const router = useRouter();
  const { addEducation, addExperience, addProject, addSkill, setOnboardingStep, setManualReviewStepIndex } = useProfileStore();

  const [activeTab, setActiveTab] = useState<'edu' | 'exp' | 'project' | 'skills'>('edu');

  // Education form
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [field, setField] = useState('');
  const [startYear, setStartYear] = useState<number | null>(null);
  const [endYear, setEndYear] = useState<number | null>(null);
  const [showStartYear, setShowStartYear] = useState(false);
  const [showEndYear, setShowEndYear] = useState(false);

  // Experience form
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [expStartYear, setExpStartYear] = useState<number | null>(null);
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');

  // Project form
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [techStack, setTechStack] = useState('');

  // Skills
  const [skillInput, setSkillInput] = useState('');
  const [addedSkills, setAddedSkills] = useState<string[]>([]);

  const addSkillLocal = () => {
    const s = skillInput.trim();
    if (s && !addedSkills.includes(s)) {
      setAddedSkills([...addedSkills, s]);
      addSkill({ name: s, category: '', level: 'intermediate' });
    }
    setSkillInput('');
  };

  const handleAddEdu = () => {
    if (!institution || !degree || !field || !startYear) return;
    addEducation({ institution, degree, field, start_year: startYear, end_year: endYear ?? undefined });
    setActiveTab('exp');
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddExp = () => {
    if (!company || !role || !expStartYear) return;
    addExperience({
      company, role,
      start_date: `${expStartYear}-01-01`,
      description,
      is_current: isCurrent,
    });
    setActiveTab('project');
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddProject = () => {
    if (!projTitle) return;
    addProject({
      title: projTitle,
      description: projDesc,
      tech_stack: techStack.split(',').map((s) => s.trim()).filter(Boolean),
    });
    setActiveTab('skills');
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleFinish = () => {
    setOnboardingStep('cards');
    router.push('/(onboarding)/cards');
  };

  const TABS = [
    { key: 'edu', label: 'Education', icon: 'book' as const },
    { key: 'exp', label: 'Experience', icon: 'briefcase' as const },
    { key: 'project', label: 'Projects', icon: 'code' as const },
    { key: 'skills', label: 'Skills', icon: 'zap' as const },
  ];

  return (
    <OnboardingShell step="manual" onBack={() => router.back()}>
      <ScreenHeader title="Add your details" subtitle="Fill in at least one in each section to unlock your portfolio." />

      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[
              styles.tab,
              {
                backgroundColor: activeTab === t.key ? colors.primary : colors.surface,
                borderColor: activeTab === t.key ? colors.primary : colors.border,
                borderRadius: 8,
              },
            ]}
            onPress={() => setActiveTab(t.key as typeof activeTab)}
          >
            <Feather
              name={t.icon}
              size={14}
              color={activeTab === t.key ? colors.primaryForeground : colors.mutedForeground}
            />
            <Text
              style={[
                typography.caption,
                {
                  color: activeTab === t.key ? colors.primaryForeground : colors.mutedForeground,
                  marginTop: 2,
                },
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {activeTab === 'edu' && (
          <View style={styles.form}>
            <FormField label="School / University" value={institution} onChangeText={setInstitution} placeholder="MIT" autoFocus />
            <FormField label="Degree" value={degree} onChangeText={setDegree} placeholder="B.S. Computer Science" />
            <FormField label="Field of study" value={field} onChangeText={setField} placeholder="Computer Science" />
            <TouchableOpacity
              style={[styles.yearPicker, { borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface }]}
              onPress={() => setShowStartYear(true)}
            >
              <Text style={[typography.body, { color: startYear ? colors.foreground : colors.mutedForeground }]}>
                {startYear ? `Started ${startYear}` : 'Start year'}
              </Text>
              <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.yearPicker, { borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface }]}
              onPress={() => setShowEndYear(true)}
            >
              <Text style={[typography.body, { color: endYear ? colors.foreground : colors.mutedForeground }]}>
                {endYear === 0 ? 'Present' : endYear ? `Graduated ${endYear}` : 'End year (or present)'}
              </Text>
              <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
            <BexoButton label="Add and continue to experience" onPress={handleAddEdu} disabled={!institution || !degree || !field || !startYear} />
            <YearPickerSheet visible={showStartYear} selected={startYear ?? undefined} onSelect={setStartYear} onClose={() => setShowStartYear(false)} />
            <YearPickerSheet visible={showEndYear} selected={endYear ?? undefined} onSelect={setEndYear} onClose={() => setShowEndYear(false)} allowCurrent />
          </View>
        )}

        {activeTab === 'exp' && (
          <View style={styles.form}>
            <FormField label="Company" value={company} onChangeText={setCompany} placeholder="Acme Corp" autoFocus />
            <FormField label="Role / Title" value={role} onChangeText={setRole} placeholder="Software Engineer" />
            <TouchableOpacity
              style={[styles.yearPicker, { borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface }]}
              onPress={() => setShowStartYear(true)}
            >
              <Text style={[typography.body, { color: expStartYear ? colors.foreground : colors.mutedForeground }]}>
                {expStartYear ? `Started ${expStartYear}` : 'Start year'}
              </Text>
              <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
            <FormField label="Description" value={description} onChangeText={setDescription} placeholder="What did you work on?" multiline numberOfLines={3} optional />
            <BexoButton label="Add and continue to projects" onPress={handleAddExp} disabled={!company || !role || !expStartYear} />
            <BexoButton label="Skip experience" onPress={() => setActiveTab('project')} variant="ghost" />
            <YearPickerSheet visible={showStartYear} selected={expStartYear ?? undefined} onSelect={setExpStartYear} onClose={() => setShowStartYear(false)} />
          </View>
        )}

        {activeTab === 'project' && (
          <View style={styles.form}>
            <FormField label="Project name" value={projTitle} onChangeText={setProjTitle} placeholder="My Awesome Project" autoFocus />
            <FormField label="Description" value={projDesc} onChangeText={setProjDesc} placeholder="What does it do?" multiline numberOfLines={3} optional />
            <FormField label="Tech stack" value={techStack} onChangeText={setTechStack} placeholder="React, Node.js, Postgres" hint="Comma-separated" optional />
            <BexoButton label="Add and continue to skills" onPress={handleAddProject} disabled={!projTitle} />
            <BexoButton label="Skip projects" onPress={() => setActiveTab('skills')} variant="ghost" />
          </View>
        )}

        {activeTab === 'skills' && (
          <View style={styles.form}>
            <FormField label="Add a skill" value={skillInput} onChangeText={setSkillInput} placeholder="e.g. TypeScript" autoFocus onSubmitEditing={addSkillLocal} returnKeyType="done" />
            <BexoButton label="Add skill" onPress={addSkillLocal} variant="secondary" disabled={!skillInput.trim()} />
            {addedSkills.length > 0 ? (
              <View style={styles.skillChips}>
                {addedSkills.map((s) => (
                  <View key={s} style={[styles.chip, { backgroundColor: colors.primary + '15', borderRadius: 8 }]}>
                    <Text style={[typography.bodySm, { color: colors.primary }]}>{s}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            <View style={styles.footer}>
              <BexoButton label="Review and continue" onPress={handleFinish} />
            </View>
          </View>
        )}
      </ScrollView>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5 },
  form: { gap: 4 },
  yearPicker: {
    height: 52,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  skillChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6 },
  footer: { marginTop: 16 },
});
