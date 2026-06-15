import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useMemo } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { useColors } from '@/hooks/useColors';
import { typography, radius } from '@/constants/theme';
import { useProfileStore } from '@/stores/useProfileStore';
import { ScreenHeader } from '@/components/ScreenHeader';
import { BexoButton } from '@/components/BexoButton';
import { uploadFile } from '@/services/upload';

type ItemCategory = 'experience' | 'education' | 'project' | 'update';

export default function EditItemScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string; category: string }>();
  const itemId = params.id ?? '';
  const category = (params.category ?? 'update') as ItemCategory;

  const {
    profile,
    education, experiences, projects, updates,
    updateEducation, removeEducation,
    updateExperience, removeExperience,
    updateProject, removeProject,
    updateUpdate, removeUpdate,
  } = useProfileStore();
  const userId = profile?.user_id ?? 'user';

  // Find the item
  const item = useMemo(() => {
    switch (category) {
      case 'experience': return experiences.find(e => e.id === itemId);
      case 'education': return education.find(e => e.id === itemId);
      case 'project': return projects.find(p => p.id === itemId);
      case 'update': return updates.find(u => u.id === itemId);
      default: return null;
    }
  }, [category, itemId, education, experiences, projects, updates]);

  // --- Experience State ---
  const [role, setRole] = useState((item as any)?.role ?? '');
  const [company, setCompany] = useState((item as any)?.company ?? '');
  const [expDesc, setExpDesc] = useState((item as any)?.description ?? '');
  const [startDate, setStartDate] = useState((item as any)?.start_date ?? '');
  const [endDate, setEndDate] = useState((item as any)?.end_date ?? '');
  const [isCurrent, setIsCurrent] = useState((item as any)?.is_current ?? false);

  // --- Education State ---
  const [institution, setInstitution] = useState((item as any)?.institution ?? '');
  const [degree, setDegree] = useState((item as any)?.degree ?? '');
  const [field, setField] = useState((item as any)?.field ?? '');
  const [startYear, setStartYear] = useState(String((item as any)?.start_year ?? ''));
  const [endYear, setEndYear] = useState(String((item as any)?.end_year ?? ''));
  const [gpa, setGpa] = useState((item as any)?.gpa ?? '');

  // --- Project State ---
  const [projTitle, setProjTitle] = useState((item as any)?.title ?? '');
  const [projDesc, setProjDesc] = useState((item as any)?.description ?? '');
  const [techStack, setTechStack] = useState((item as any)?.tech_stack?.join(', ') ?? '');
  const [liveUrl, setLiveUrl] = useState((item as any)?.live_url ?? '');
  const [projGithub, setProjGithub] = useState((item as any)?.github_url ?? '');
  const [projImage, setProjImage] = useState<string | undefined>((item as any)?.image_url ?? undefined);
  const [projImages, setProjImages] = useState<string[]>((item as any)?.image_urls ?? ((item as any)?.image_url ? [(item as any).image_url] : []));
  const [isUploadingProjImage, setIsUploadingProjImage] = useState(false);
  const [projPdfs, setProjPdfs] = useState<string[]>((item as any)?.pdf_urls ?? []);
  const [isUploadingProjPdf, setIsUploadingProjPdf] = useState(false);
  const [projLinks, setProjLinks] = useState<string[]>((item as any)?.link_urls ?? []);

  // --- Update State ---
  const [updTitle, setUpdTitle] = useState((item as any)?.title ?? '');
  const [updDesc, setUpdDesc] = useState((item as any)?.description ?? '');
  const [updCompany, setUpdCompany] = useState((item as any)?.company_name ?? '');
  const [updJobTitle, setUpdJobTitle] = useState((item as any)?.job_title ?? '');
  const [updInstitution, setUpdInstitution] = useState((item as any)?.institution_name ?? '');
  const [updSpecialization, setUpdSpecialization] = useState((item as any)?.specialization ?? '');
  const [updImages, setUpdImages] = useState<string[]>((item as any)?.image_urls ?? ((item as any)?.image_url ? [(item as any).image_url] : []));
  const [isUploadingUpdImage, setIsUploadingUpdImage] = useState(false);
  const [updPdfs, setUpdPdfs] = useState<string[]>((item as any)?.pdf_urls ?? ((item as any)?.pdf_url ? [(item as any).pdf_url] : []));
  const [isUploadingUpdPdf, setIsUploadingUpdPdf] = useState(false);
  const [updLinks, setUpdLinks] = useState<string[]>((item as any)?.link_urls ?? ((item as any)?.link_url ? [(item as any).link_url] : []));

  const handlePickPhoto = async (type: 'project' | 'update') => {
    const currentImages = type === 'project' ? projImages : updImages;
    if (currentImages.length >= 5) {
      Alert.alert('Limit reached', 'You can upload up to 5 images.');
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'We need access to your media library to select photos.');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (pickerResult.canceled || !pickerResult.assets?.[0]) return;
      const asset = pickerResult.assets[0];

      if (type === 'project') {
        setIsUploadingProjImage(true);
        const { url, error } = await uploadFile(userId, asset.uri, 'projects');
        setIsUploadingProjImage(false);
        if (error || !url) {
          Alert.alert('Upload failed', error || 'Could not upload photo.');
        } else {
          setProjImages(prev => [...prev, url]);
        }
      } else {
        setIsUploadingUpdImage(true);
        const { url, error } = await uploadFile(userId, asset.uri, 'updates');
        setIsUploadingUpdImage(false);
        if (error || !url) {
          Alert.alert('Upload failed', error || 'Could not upload photo.');
        } else {
          setUpdImages(prev => [...prev, url]);
        }
      }
    } catch (error: any) {
      setIsUploadingProjImage(false);
      setIsUploadingUpdImage(false);
      Alert.alert('Error picking photo', error.message || 'Something went wrong');
    }
  };

  const handlePickFile = async (type: 'project' | 'update') => {
    const currentPdfs = type === 'project' ? projPdfs : updPdfs;
    if (currentPdfs.length >= 3) {
      Alert.alert('Limit reached', 'You can upload up to 3 PDF files.');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];

      if (type === 'project') {
        setIsUploadingProjPdf(true);
        const { url, error } = await uploadFile(userId, asset.uri, 'projects', asset.name);
        setIsUploadingProjPdf(false);
        if (error || !url) {
          Alert.alert('Upload failed', error || 'Could not upload PDF.');
        } else {
          setProjPdfs(prev => [...prev, url]);
        }
      } else {
        setIsUploadingUpdPdf(true);
        const { url, error } = await uploadFile(userId, asset.uri, 'updates', asset.name);
        setIsUploadingUpdPdf(false);
        if (error || !url) {
          Alert.alert('Upload failed', error || 'Could not upload PDF.');
        } else {
          setUpdPdfs(prev => [...prev, url]);
        }
      }
    } catch (error: any) {
      setIsUploadingProjPdf(false);
      setIsUploadingUpdPdf(false);
      Alert.alert('Error picking file', error.message || 'Something went wrong');
    }
  };

  const handleAddLink = (type: 'project' | 'update') => {
    const currentLinks = type === 'project' ? projLinks : updLinks;
    if (currentLinks.length >= 3) {
      Alert.alert('Limit reached', 'You can add up to 3 links.');
      return;
    }
    if (type === 'project') {
      setProjLinks(prev => [...prev, '']);
    } else {
      setUpdLinks(prev => [...prev, '']);
    }
  };

  const handleUpdateLinkValue = (type: 'project' | 'update', index: number, value: string) => {
    if (type === 'project') {
      setProjLinks(prev => prev.map((l, i) => i === index ? value : l));
    } else {
      setUpdLinks(prev => prev.map((l, i) => i === index ? value : l));
    }
  };

  const handleRemoveLink = (type: 'project' | 'update', index: number) => {
    if (type === 'project') {
      setProjLinks(prev => prev.filter((_, i) => i !== index));
    } else {
      setUpdLinks(prev => prev.filter((_, i) => i !== index));
    }
  };

  if (!item) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Feather name="alert-circle" size={48} color={colors.mutedForeground} />
        <Text style={[typography.body, { color: colors.mutedForeground, marginTop: 12 }]}>Item not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={[typography.body, { color: colors.primary }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSave = () => {
    switch (category) {
      case 'experience':
        updateExperience(itemId, {
          role: role.trim(),
          company: company.trim(),
          description: expDesc.trim(),
          start_date: startDate.trim(),
          end_date: endDate.trim() || undefined,
          is_current: isCurrent,
        });
        break;
      case 'education':
        updateEducation(itemId, {
          institution: institution.trim(),
          degree: degree.trim(),
          field: field.trim(),
          start_year: parseInt(startYear) || 0,
          end_year: endYear ? parseInt(endYear) : undefined,
          gpa: gpa.trim() || undefined,
        });
        break;
      case 'project':
        updateProject(itemId, {
          title: projTitle.trim(),
          description: projDesc.trim(),
          tech_stack: techStack.split(',').map((s: string) => s.trim()).filter(Boolean),
          live_url: liveUrl.trim() || undefined,
          github_url: projGithub.trim() || undefined,
          image_urls: projImages,
          pdf_urls: projPdfs,
          link_urls: projLinks.map(l => l.trim()).filter(Boolean),
          image_url: projImages[0] || undefined,
        });
        break;
      case 'update':
        updateUpdate(itemId, {
          title: updTitle.trim(),
          description: updDesc.trim(),
          company_name: updCompany.trim() || undefined,
          job_title: updJobTitle.trim() || undefined,
          institution_name: updInstitution.trim() || undefined,
          specialization: updSpecialization.trim() || undefined,
          image_urls: updImages,
          pdf_urls: updPdfs,
          link_urls: updLinks.map(l => l.trim()).filter(Boolean),
          image_url: updImages[0] || undefined,
          pdf_url: updPdfs[0] || undefined,
          link_url: updLinks.map(l => l.trim()).filter(Boolean)[0] || undefined,
        });
        break;
    }
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete this item?',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            switch (category) {
              case 'experience': removeExperience(itemId); break;
              case 'education': removeEducation(itemId); break;
              case 'project': removeProject(itemId); break;
              case 'update': removeUpdate(itemId); break;
            }
            if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            router.back();
          },
        },
      ]
    );
  };

  const getCategoryTitle = () => {
    switch (category) {
      case 'experience': return 'Edit Experience';
      case 'education': return 'Edit Education';
      case 'project': return 'Edit Project';
      case 'update': return 'Edit Update';
    }
  };

  const getCategoryIcon = (): keyof typeof Feather.glyphMap => {
    switch (category) {
      case 'experience': return 'briefcase';
      case 'education': return 'book-open';
      case 'project': return 'terminal';
      case 'update': return 'star';
    }
  };

  const renderMediaSection = (type: 'project' | 'update') => {
    const images = type === 'project' ? projImages : updImages;
    const pdfs = type === 'project' ? projPdfs : updPdfs;
    const links = type === 'project' ? projLinks : updLinks;
    const isUploadingImage = type === 'project' ? isUploadingProjImage : isUploadingUpdImage;
    const isUploadingPdf = type === 'project' ? isUploadingProjPdf : isUploadingUpdPdf;

    return (
      <View style={{ marginTop: 16, marginBottom: 14 }}>
        <Text style={[typography.label, { color: colors.mutedForeground, marginBottom: 12, letterSpacing: 0.4, textTransform: 'uppercase' }]}>
          Attachments & Media
        </Text>

        {/* Photos Grid */}
        <Text style={[typography.caption, { color: colors.mutedForeground, marginBottom: 8, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.3 }]}>
          Photos ({images.length} / 5)
        </Text>
        <View style={styles.mediaGrid}>
          {images.map((imgUrl, idx) => (
            <View key={`img-${idx}`} style={styles.thumbnailWrap}>
              <Image source={{ uri: imgUrl }} style={styles.thumbnail} />
              <TouchableOpacity
                onPress={() => {
                  if (type === 'project') {
                    setProjImages(prev => prev.filter((_, i) => i !== idx));
                  } else {
                    setUpdImages(prev => prev.filter((_, i) => i !== idx));
                  }
                }}
                style={[styles.smallRemoveBadge, { backgroundColor: colors.destructive }]}
              >
                <Feather name="x" size={10} color="#FFF" />
              </TouchableOpacity>
            </View>
          ))}
          {isUploadingImage && (
            <View style={[styles.thumbnailPlaceholder, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
          {!isUploadingImage && images.length < 5 && (
            <TouchableOpacity
              onPress={() => handlePickPhoto(type)}
              style={[styles.thumbnailPlaceholder, { borderColor: colors.border, backgroundColor: colors.surface }]}
            >
              <Feather name="plus" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* PDFs List */}
        <Text style={[typography.caption, { color: colors.mutedForeground, marginTop: 16, marginBottom: 8, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.3 }]}>
          PDF Documents ({pdfs.length} / 3)
        </Text>
        <View style={{ gap: 8 }}>
          {pdfs.map((pdfUrl, idx) => (
            <View key={`pdf-${idx}`} style={[styles.pdfRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Feather name="file-text" size={18} color={colors.primary} style={{ marginRight: 10 }} />
              <Text style={[typography.bodySm, { color: colors.foreground, flex: 1 }]} numberOfLines={1}>
                {pdfUrl.split('/').pop()?.split('?')[0] || `PDF Document ${idx + 1}`}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (type === 'project') {
                    setProjPdfs(prev => prev.filter((_, i) => i !== idx));
                  } else {
                    setUpdPdfs(prev => prev.filter((_, i) => i !== idx));
                  }
                }}
                style={{ padding: 4 }}
              >
                <Feather name="trash-2" size={16} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          ))}
          {isUploadingPdf && (
            <View style={[styles.pdfRow, { borderColor: colors.border, backgroundColor: colors.surface, justifyContent: 'center' }]}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
          {!isUploadingPdf && pdfs.length < 3 && (
            <TouchableOpacity
              onPress={() => handlePickFile(type)}
              style={[styles.pdfRow, { borderColor: colors.border, backgroundColor: colors.surface, borderStyle: 'dashed', justifyContent: 'center' }]}
            >
              <Feather name="plus" size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[typography.bodySm, { color: colors.primary, fontFamily: 'DMSans_600SemiBold' }]}>Add PDF Document</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Links List */}
        <Text style={[typography.caption, { color: colors.mutedForeground, marginTop: 16, marginBottom: 8, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.3 }]}>
          Web Links ({links.length} / 3)
        </Text>
        <View style={{ gap: 8 }}>
          {links.map((link, idx) => (
            <View key={`link-${idx}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TextInput
                style={[
                  typography.bodySm,
                  {
                    flex: 1,
                    height: 44,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1.5,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    color: colors.foreground,
                  },
                ]}
                value={link}
                onChangeText={(val) => handleUpdateLinkValue(type, idx, val)}
                placeholder="https://..."
                placeholderTextColor={colors.mutedForeground}
                keyboardType="url"
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => handleRemoveLink(type, idx)}
                style={{ padding: 6 }}
              >
                <Feather name="trash-2" size={18} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          ))}
          {links.length < 3 && (
            <TouchableOpacity
              onPress={() => handleAddLink(type)}
              style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, paddingVertical: 8 }}
            >
              <Feather name="plus-circle" size={18} color={colors.primary} />
              <Text style={[typography.bodySm, { color: colors.primary, fontFamily: 'DMSans_600SemiBold', marginLeft: 8 }]}>
                Add Link
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderFields = () => {
    switch (category) {
      case 'experience':
        return (
          <>
            <Field label="Role / Title" value={role} onChangeText={setRole} placeholder="Software Engineer" delay={80} />
            <Field label="Company" value={company} onChangeText={setCompany} placeholder="Stripe" delay={120} />
            <Field label="Description" value={expDesc} onChangeText={setExpDesc} placeholder="What you did…" multiline delay={160} />
            <Field label="Start Date" value={startDate} onChangeText={setStartDate} placeholder="Jun 2024" delay={200} />
            {!isCurrent && (
              <Field label="End Date" value={endDate} onChangeText={setEndDate} placeholder="Sep 2024" delay={240} />
            )}
            <Animated.View entering={FadeInDown.delay(280).springify()}>
              <TouchableOpacity onPress={() => setIsCurrent(!isCurrent)} style={styles.checkRow}>
                <View style={[styles.checkbox, { borderColor: isCurrent ? colors.primary : colors.border, backgroundColor: isCurrent ? colors.primary : 'transparent' }]}>
                  {isCurrent && <Feather name="check" size={14} color="#fff" />}
                </View>
                <Text style={[typography.body, { color: colors.foreground, marginLeft: 8 }]}>I am currently working here</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        );

      case 'education':
        return (
          <>
            <Field label="Institution" value={institution} onChangeText={setInstitution} placeholder="University of California, Berkeley" delay={80} />
            <Field label="Degree" value={degree} onChangeText={setDegree} placeholder="B.S." delay={120} />
            <Field label="Field of Study" value={field} onChangeText={setField} placeholder="Computer Science" delay={160} />
            <Field label="Start Year" value={startYear} onChangeText={setStartYear} placeholder="2021" keyboardType="number-pad" delay={200} />
            <Field label="End Year" value={endYear} onChangeText={setEndYear} placeholder="2025" keyboardType="number-pad" delay={240} />
            <Field label="GPA (optional)" value={gpa} onChangeText={setGpa} placeholder="3.8" delay={280} />
          </>
        );

      case 'project':
        return (
          <>
            <Field label="Title" value={projTitle} onChangeText={setProjTitle} placeholder="Pulse Dashboard" delay={80} />
            <Field label="Description" value={projDesc} onChangeText={setProjDesc} placeholder="What the project does…" multiline delay={120} />
            <Field label="Tech Stack (comma-separated)" value={techStack} onChangeText={setTechStack} placeholder="React, Node.js, PostgreSQL" delay={160} />
            <Field label="Live URL (optional)" value={liveUrl} onChangeText={setLiveUrl} placeholder="https://..." keyboardType="url" delay={200} />
            <Field label="GitHub URL (optional)" value={projGithub} onChangeText={setProjGithub} placeholder="https://github.com/..." keyboardType="url" delay={240} />
            {renderMediaSection('project')}
          </>
        );

      case 'update':
        return (
          <>
            <Field label="Title" value={updTitle} onChangeText={setUpdTitle} placeholder="Won 1st place at HackX" delay={80} />
            <Field label="Description" value={updDesc} onChangeText={setUpdDesc} placeholder="More context…" multiline delay={120} />
            {((item as any)?.type === 'role') && (
              <>
                <Field label="Company" value={updCompany} onChangeText={setUpdCompany} placeholder="Stripe" delay={160} />
                <Field label="Job Title" value={updJobTitle} onChangeText={setUpdJobTitle} placeholder="Software Engineer" delay={200} />
              </>
            )}
            {((item as any)?.type === 'education') && (
              <>
                <Field label="Institution" value={updInstitution} onChangeText={setUpdInstitution} placeholder="UC Berkeley" delay={160} />
                <Field label="Specialization" value={updSpecialization} onChangeText={setUpdSpecialization} placeholder="B.S. Computer Science" delay={200} />
              </>
            )}
            {renderMediaSection('update')}
          </>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingTop: Math.max(insets.top, 20), paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header with icon */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={{ marginRight: 12 }}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View style={[styles.headerIcon, { backgroundColor: colors.primary + '15' }]}>
            <Feather name={getCategoryIcon()} size={20} color={colors.primary} />
          </View>
          <Text style={[typography.h2, { color: colors.foreground, flex: 1, letterSpacing: -0.4 }]}>{getCategoryTitle()}</Text>
        </Animated.View>

        {/* Type badge for updates */}
        {category === 'update' && (item as any)?.type && (
          <Animated.View entering={FadeInDown.delay(40).springify()} style={{ marginBottom: 16 }}>
            <View style={[styles.typeBadge, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[typography.caption, { color: colors.primary, fontFamily: 'DMSans_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.5 }]}>
                {(item as any).type}
              </Text>
            </View>
          </Animated.View>
        )}

        {renderFields()}

        {/* Save + Delete buttons */}
        <Animated.View entering={FadeInDown.delay(320).springify()} style={{ marginTop: 24 }}>
          <BexoButton label="Save changes" onPress={handleSave} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(360).springify()} style={{ marginTop: 12 }}>
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.deleteBtn, { borderColor: colors.destructive || '#EF4444' }]}
          >
            <Feather name="trash-2" size={16} color={colors.destructive || '#EF4444'} />
            <Text style={[typography.body, { color: colors.destructive || '#EF4444', marginLeft: 8, fontFamily: 'DMSans_600SemiBold' }]}>
              Delete this {category === 'update' ? 'update' : category}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Reusable Field component
function Field({ label, value, onChangeText, placeholder, multiline, delay, keyboardType }: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  multiline?: boolean;
  delay: number;
  keyboardType?: 'default' | 'url' | 'number-pad';
}) {
  const colors = useColors();
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={{ marginBottom: 14 }}>
      <Text style={[typography.label, { color: colors.mutedForeground, marginBottom: 6, letterSpacing: 0.4, textTransform: 'uppercase' }]}>{label}</Text>
      <TextInput
        style={[
          typography.body,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1.5,
            borderRadius: 12,
            paddingHorizontal: 14,
            color: colors.foreground,
            ...(multiline ? { minHeight: 100, paddingTop: 14, textAlignVertical: 'top' as any } : { height: 50 }),
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={keyboardType === 'url' ? 'none' : 'sentences'}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  headerIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1.5,
    borderRadius: 12,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  thumbnailWrap: {
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallRemoveBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1.5,
    borderRadius: 10,
  },
});
