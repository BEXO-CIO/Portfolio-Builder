import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, Pressable, RefreshControl } from 'react-native';
import Animated, { FadeInDown, FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { useColors } from '@/hooks/useColors';
import { typography, radius, spacing } from '@/constants/theme';
import { useProfileStore, Update } from '@/stores/useProfileStore';
import { parseUpdateText } from '@/services/achievementParser';
import { BexoButton } from '@/components/BexoButton';
import { uploadFile } from '@/services/upload';
import { Image } from 'expo-image';

type UpdateType = 'achievement' | 'project' | 'role' | 'education';

const TYPE_OPTIONS: { key: UpdateType; label: string; placeholder: string }[] = [
  { key: 'achievement', label: 'Achievement', placeholder: 'Won 1st place at HackX 2026' },
  { key: 'project', label: 'Project', placeholder: 'Shipped Clarit — an AI flashcard app' },
  { key: 'role', label: 'New role', placeholder: 'Joined Stripe as a software engineering intern' },
  { key: 'education', label: 'Education', placeholder: 'Graduated from UC Berkeley with a B.S. in CS' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = Array.from({length: 40}, (_, i) => new Date().getFullYear() + 5 - i); // From 5 years in future to 35 in past

export default function UpdateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addUpdate, updates, profile } = useProfileStore();
  const [type, setType] = useState<UpdateType>('achievement');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Media / Links
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [localPdfUri, setLocalPdfUri] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState('');

  // Role
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);

  // Education
  const [institutionName, setInstitutionName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [percentage, setPercentage] = useState('');

  const [isPosting, setIsPosting] = useState(false);
  const [posted, setPosted] = useState(false);

  // Picker State
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(null);
  const [tempMonth, setTempMonth] = useState(MONTHS[new Date().getMonth()]);
  const [tempYear, setTempYear] = useState(new Date().getFullYear().toString());

  const currentPlaceholder = TYPE_OPTIONS.find((t) => t.key === type)?.placeholder ?? '';
  const topPad = Platform.OS === 'web' ? 67 : insets.top + 12;

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (profile?.user_id) {
      useProfileStore.getState().startSync(profile.user_id);
    }
    setTimeout(() => setRefreshing(false), 1500);
  }, [profile?.user_id]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri);
      setLocalPdfUri(null); // Clear pdf if photo selected
    }
  };

  const pickPdf = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (result.assets && result.assets.length > 0) {
      setLocalPdfUri(result.assets[0].uri);
      setLocalImageUri(null); // Clear photo if pdf selected
    }
  };

  const openPicker = (target: 'start' | 'end', currentVal: string) => {
    setPickerTarget(target);
    if (currentVal) {
      const parts = currentVal.split(' ');
      if (parts.length === 2 && MONTHS.includes(parts[0])) {
        setTempMonth(parts[0]);
        setTempYear(parts[1]);
      } else if (parts.length === 1 && parts[0].length === 4) {
        setTempMonth('Jan');
        setTempYear(parts[0]);
      }
    } else {
      setTempMonth(MONTHS[new Date().getMonth()]);
      setTempYear(new Date().getFullYear().toString());
    }
    setPickerVisible(true);
  };

  const confirmPicker = () => {
    const formatted = type === 'education' ? tempYear : `${tempMonth} ${tempYear}`;
    if (pickerTarget === 'start') setStartDate(formatted);
    if (pickerTarget === 'end') setEndDate(formatted);
    setPickerVisible(false);
  };

  const handlePost = async () => {
    if (!title.trim() || !profile?.user_id) return;
    setIsPosting(true);
    
    let uploadedImageUrl: string | undefined = undefined;
    let uploadedPdfUrl: string | undefined = undefined;

    if (localImageUri) {
      const res = await uploadFile(profile.user_id, localImageUri, 'updates');
      if (res.url) uploadedImageUrl = res.url;
    }
    
    if (localPdfUri) {
      const res = await uploadFile(profile.user_id, localPdfUri, 'updates', `document-${Date.now()}.pdf`);
      if (res.url) uploadedPdfUrl = res.url;
    }

    const newUpdate: any = { type, title: title.trim(), description: description.trim() };
    
    if (type === 'achievement' || type === 'project') {
      if (uploadedImageUrl) newUpdate.image_url = uploadedImageUrl;
      if (uploadedPdfUrl) newUpdate.pdf_url = uploadedPdfUrl;
      if (linkUrl.trim()) newUpdate.link_url = linkUrl.trim();
    } else if (type === 'role') {
      if (companyName.trim()) newUpdate.company_name = companyName.trim();
      if (jobTitle.trim()) newUpdate.job_title = jobTitle.trim();
      if (startDate.trim()) newUpdate.start_date = startDate.trim();
      if (!isCurrent && endDate.trim()) newUpdate.end_date = endDate.trim();
      newUpdate.is_current = isCurrent;
    } else if (type === 'education') {
      if (institutionName.trim()) newUpdate.institution_name = institutionName.trim();
      if (specialization.trim()) newUpdate.specialization = specialization.trim();
      if (percentage.trim()) newUpdate.percentage = percentage.trim();
      if (startDate.trim()) newUpdate.start_date = startDate.trim();
      if (endDate.trim()) newUpdate.end_date = endDate.trim();
    }

    addUpdate(newUpdate);
    
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Clear fields
    setTitle('');
    setDescription('');
    setLocalImageUri(null);
    setLocalPdfUri(null);
    setLinkUrl('');
    setCompanyName('');
    setJobTitle('');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setInstitutionName('');
    setSpecialization('');
    setPercentage('');

    setIsPosting(false);
    setPosted(true);
    setTimeout(() => setPosted(false), 3000);
  };

  const handleAutoDetect = () => {
    if (!title.trim()) return;
    const parsed = parseUpdateText(title);
    setType(parsed.type);
  };

  const renderTypeFields = () => {
    if (type === 'achievement' || type === 'project') {
      return (
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={[typography.label, { color: colors.mutedForeground, marginBottom: 8, letterSpacing: 0.5 }]}>
            ATTACHMENTS (optional)
          </Text>
          <View style={styles.attachmentRow}>
            <TouchableOpacity onPress={pickImage} style={[styles.attachmentBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Feather name="image" size={20} color={localImageUri ? colors.primary : colors.mutedForeground} />
              <Text style={[typography.caption, { color: localImageUri ? colors.primary : colors.foreground, marginLeft: 6 }]}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickPdf} style={[styles.attachmentBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Feather name="file-text" size={20} color={localPdfUri ? colors.primary : colors.mutedForeground} />
              <Text style={[typography.caption, { color: localPdfUri ? colors.primary : colors.foreground, marginLeft: 6 }]}>PDF</Text>
            </TouchableOpacity>
          </View>
          
          {(localImageUri || localPdfUri) && (
            <View style={[styles.previewBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              {localImageUri && <Image source={{ uri: localImageUri }} style={styles.previewImage} contentFit="cover" />}
              {localPdfUri && (
                <View style={styles.pdfPreview}>
                  <Feather name="file" size={24} color={colors.primary} />
                  <Text style={[typography.caption, { color: colors.foreground, marginLeft: 8 }]}>PDF Selected</Text>
                </View>
              )}
              <TouchableOpacity style={styles.removeBtn} onPress={() => { setLocalImageUri(null); setLocalPdfUri(null); }}>
                <Feather name="x-circle" size={20} color={colors.destructive || 'red'} />
              </TouchableOpacity>
            </View>
          )}

          <TextInput
            style={[typography.body, styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground, marginTop: 12 }]}
            value={linkUrl}
            onChangeText={setLinkUrl}
            placeholder="Add a link (e.g., https://github.com/...)"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
          />
        </Animated.View>
      );
    }

    if (type === 'role') {
      return (
        <Animated.View entering={FadeInDown.delay(100).springify()} style={{ gap: 12 }}>
          <TextInput
            style={[typography.body, styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="Company Name"
            placeholderTextColor={colors.mutedForeground}
          />
          <TextInput
            style={[typography.body, styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
            value={jobTitle}
            onChangeText={setJobTitle}
            placeholder="Job Title"
            placeholderTextColor={colors.mutedForeground}
          />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => openPicker('start', startDate)}
              style={[styles.input, { flex: 1, backgroundColor: colors.surface, borderColor: colors.border, justifyContent: 'center' }]}
            >
              <Text style={[typography.body, { color: startDate ? colors.foreground : colors.mutedForeground }]}>
                {startDate || "Start Date"}
              </Text>
            </TouchableOpacity>
            {!isCurrent && (
              <TouchableOpacity
                onPress={() => openPicker('end', endDate)}
                style={[styles.input, { flex: 1, backgroundColor: colors.surface, borderColor: colors.border, justifyContent: 'center' }]}
              >
                <Text style={[typography.body, { color: endDate ? colors.foreground : colors.mutedForeground }]}>
                  {endDate || "End Date"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={() => setIsCurrent(!isCurrent)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <View style={[styles.checkbox, { borderColor: isCurrent ? colors.primary : colors.border, backgroundColor: isCurrent ? colors.primary : 'transparent' }]}>
              {isCurrent && <Feather name="check" size={14} color="#fff" />}
            </View>
            <Text style={[typography.body, { color: colors.foreground, marginLeft: 8 }]}>I am currently working here</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    if (type === 'education') {
      return (
        <Animated.View entering={FadeInDown.delay(100).springify()} style={{ gap: 12 }}>
          <TextInput
            style={[typography.body, styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
            value={institutionName}
            onChangeText={setInstitutionName}
            placeholder="Institution Name"
            placeholderTextColor={colors.mutedForeground}
          />
          <TextInput
            style={[typography.body, styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
            value={specialization}
            onChangeText={setSpecialization}
            placeholder="Specialization (e.g., B.S. Computer Science)"
            placeholderTextColor={colors.mutedForeground}
          />
          <TextInput
            style={[typography.body, styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
            value={percentage}
            onChangeText={setPercentage}
            placeholder="Percentage / CGPA (optional)"
            placeholderTextColor={colors.mutedForeground}
          />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => openPicker('start', startDate)}
              style={[styles.input, { flex: 1, backgroundColor: colors.surface, borderColor: colors.border, justifyContent: 'center' }]}
            >
              <Text style={[typography.body, { color: startDate ? colors.foreground : colors.mutedForeground }]}>
                {startDate || "Start Year"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openPicker('end', endDate)}
              style={[styles.input, { flex: 1, backgroundColor: colors.surface, borderColor: colors.border, justifyContent: 'center' }]}
            >
              <Text style={[typography.body, { color: endDate ? colors.foreground : colors.mutedForeground }]}>
                {endDate || "End Year"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      );
    }

    return null;
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={[styles.scroll, { paddingTop: topPad, paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            progressViewOffset={topPad}
          />
        }
      >
        <Animated.View entering={FadeInDown.delay(0).springify()}>
          <Text style={[typography.h2, { color: colors.foreground, letterSpacing: -0.4, marginBottom: 6 }]}>Post an update</Text>
          <Text style={[typography.body, { color: colors.mutedForeground, marginBottom: 24 }]}>
            Share a win, new role, or shipped project.
          </Text>
        </Animated.View>

        {/* Type selector */}
        <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.typeRow}>
          {TYPE_OPTIONS.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.typeChip,
                {
                  backgroundColor: type === t.key ? colors.primary : colors.surface,
                  borderColor: type === t.key ? colors.primary : colors.border,
                  borderRadius: radius.sm,
                },
              ]}
              onPress={() => setType(t.key)}
            >
              <Text
                style={[
                  typography.caption,
                  {
                    color: type === t.key ? colors.primaryForeground : colors.foreground,
                    fontFamily: 'DMSans_500Medium',
                  },
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Title input */}
        <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.inputBlock}>
          <Text style={[typography.label, { color: colors.mutedForeground, marginBottom: 8, letterSpacing: 0.5 }]}>
            WHAT HAPPENED
          </Text>
          <TextInput
            style={[
              typography.bodyLg,
              styles.titleInput,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground, borderRadius: radius.sm },
            ]}
            value={title}
            onChangeText={(t) => { setTitle(t); if (t.length > 8) handleAutoDetect(); }}
            placeholder={currentPlaceholder}
            placeholderTextColor={colors.mutedForeground}
            autoFocus
            returnKeyType="next"
          />
        </Animated.View>

        {/* Dynamic Fields */}
        <View style={styles.inputBlock}>
          {renderTypeFields()}
        </View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(120).springify()} style={styles.inputBlock}>
          <Text style={[typography.label, { color: colors.mutedForeground, marginBottom: 8, letterSpacing: 0.5 }]}>
            MORE DETAIL (optional)
          </Text>
          <TextInput
            style={[
              typography.body,
              styles.descInput,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground, borderRadius: radius.sm },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add any extra context…"
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).springify()}>
          {posted ? (
            <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)} style={[styles.successBanner, { backgroundColor: colors.success + '15', borderRadius: radius.sm, borderColor: colors.success + '30' }]}>
              <Feather name="check-circle" size={24} color={colors.success} style={{ marginBottom: 8 }} />
              <Text style={[typography.bodyLg, { color: colors.success, fontFamily: 'DMSans_600SemiBold', textAlign: 'center' }]}>
                Successfully Posted!
              </Text>
              <Text style={[typography.caption, { color: colors.success, textAlign: 'center', marginTop: 4, opacity: 0.8 }]}>
                It will appear on your portfolio shortly.
              </Text>
            </Animated.View>
          ) : (
            <BexoButton 
              label={isPosting ? "Posting..." : "Post update"} 
              onPress={handlePost} 
              disabled={!title.trim() || isPosting} 
            />
          )}
        </Animated.View>

        {/* Recent posts */}
        {updates.length > 0 && !posted && (
          <Animated.View entering={FadeInDown.delay(160).springify()} style={styles.recents}>
            <Text style={[typography.label, { color: colors.mutedForeground, letterSpacing: 0.5, marginBottom: 12 }]}>
              RECENT UPDATES
            </Text>
            {updates.slice(0, 5).map((u) => (
              <View key={u.id} style={[styles.recentRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.typeDot, { backgroundColor: colors.primary }]} />
                <View style={styles.recentText}>
                  <Text style={[typography.body, { color: colors.foreground }]}>{u.title}</Text>
                  <Text style={[typography.caption, { color: colors.mutedForeground }]}>{u.type}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal visible={pickerVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setPickerVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.background }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[typography.h3, { color: colors.foreground }]}>Select Date</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Feather name="x" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {type !== 'education' && (
              <>
                <Text style={[typography.label, { color: colors.mutedForeground, marginTop: 16, marginBottom: 8 }]}>MONTH</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}>
                  {MONTHS.map(m => (
                    <TouchableOpacity 
                      key={m} 
                      onPress={() => setTempMonth(m)}
                      style={[styles.pickerChip, { 
                        backgroundColor: tempMonth === m ? colors.primary : colors.surface,
                        borderColor: tempMonth === m ? colors.primary : colors.border
                      }]}
                    >
                      <Text style={[typography.body, { color: tempMonth === m ? '#fff' : colors.foreground }]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <Text style={[typography.label, { color: colors.mutedForeground, marginTop: 24, marginBottom: 8 }]}>YEAR</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}>
              {YEARS.map(y => (
                <TouchableOpacity 
                  key={y} 
                  onPress={() => setTempYear(y.toString())}
                  style={[styles.pickerChip, { 
                    backgroundColor: tempYear === y.toString() ? colors.primary : colors.surface,
                    borderColor: tempYear === y.toString() ? colors.primary : colors.border
                  }]}
                >
                  <Text style={[typography.body, { color: tempYear === y.toString() ? '#fff' : colors.foreground }]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.confirmBtn, { backgroundColor: colors.primary, marginTop: 32 }]} 
              onPress={confirmPicker}
            >
              <Text style={[typography.body, { color: '#fff', fontFamily: 'DMSans_600SemiBold' }]}>Confirm Date</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1.5 },
  inputBlock: { marginBottom: 16 },
  titleInput: { height: 52, borderWidth: 1.5, paddingHorizontal: 14 },
  input: { height: 50, borderWidth: 1.5, paddingHorizontal: 14, borderRadius: 8 },
  descInput: { minHeight: 90, borderWidth: 1.5, padding: 14 },
  successBanner: { padding: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  recents: { marginTop: 32 },
  recentRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12, alignItems: 'flex-start' },
  typeDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  recentText: { flex: 1 },
  attachmentRow: { flexDirection: 'row', gap: 10 },
  attachmentBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1.5, borderRadius: 8, flex: 1, justifyContent: 'center' },
  previewBox: { marginTop: 12, borderWidth: 1, borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewImage: { width: 60, height: 60, borderRadius: 6 },
  pdfPreview: { flexDirection: 'row', alignItems: 'center' },
  removeBtn: { padding: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerChip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  confirmBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
});
