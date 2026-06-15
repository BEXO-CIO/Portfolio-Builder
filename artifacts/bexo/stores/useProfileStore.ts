import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { type Unsubscribe, writeBatch, doc } from 'firebase/firestore';

import { useAuthStore } from './useAuthStore';
import {
  upsertUser,
  updateUserFields,
  checkHandleAvailable,
  addSubItem,
  updateSubItem,
  deleteSubItem,
  bulkWriteSubCollection,
  subscribeToProfile,
  subscribeToSubCollection,
} from '@/services/firestoreService';
import { db } from '@/services/firebase';

export type OnboardingStep =
  | 'email'
  | 'photo'
  | 'handle'
  | 'resume'
  | 'manual'
  | 'manual_review'
  | 'cards'
  | 'about'
  | 'dob'
  | 'theme'
  | 'font'
  | 'preference'
  | 'generating'
  | 'completed';

export type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_year: number;
  end_year?: number;
  gpa?: string;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  start_date: string;
  end_date?: string;
  description: string;
  is_current: boolean;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  live_url?: string;
  github_url?: string;
  image_url?: string;
  image_urls?: string[];
  pdf_urls?: string[];
  link_urls?: string[];
};

export type Research = {
  id: string;
  title: string;
  publication?: string;
  description: string;
  url?: string;
  year?: number;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
};

export type Profile = {
  id: string;
  user_id: string;
  handle: string;
  full_name: string;
  headline: string;
  bio: string;
  avatar_url?: string;
  location?: string;
  website?: string;
  linkedin_url?: string;
  github_url?: string;
  custom_links?: { id: string; label: string; url: string }[];
  resume_url?: string;
  email?: string;
  phone?: string;
  is_published: boolean;
  portfolio_theme: string;
  portfolio_font: string;
  identity_card_palette: string;
  identity_card_template: string;
  identity_card_font?: string;
  dob?: string;
  website_preference?: string;
  phone_verified: boolean;
  email_verified: boolean;
};

export type ParsedResume = {
  headline?: string;
  bio?: string;
  location?: string;
  education: Omit<Education, 'id'>[];
  experiences: Omit<Experience, 'id'>[];
  projects: Omit<Project, 'id'>[];
  skills: { name: string; category?: string; level?: string }[];
  research?: Omit<Research, 'id'>[];
};

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function defaultProfile(userId: string, phone: string): Profile {
  return {
    id: makeId(),
    user_id: userId,
    handle: '',
    full_name: '',
    headline: '',
    bio: '',
    phone,
    phone_verified: true,
    email_verified: false,
    is_published: false,
    portfolio_theme: 'default',
    portfolio_font: 'modern',
    identity_card_palette: 'midnight',
    identity_card_template: 'standard',
  };
}

export type Update = {
  id: string;
  type: 'project' | 'achievement' | 'role' | 'education';
  title: string;
  description: string;
  created_at: string;
  
  // Media / Links
  image_url?: string;
  pdf_url?: string;
  link_url?: string;
  image_urls?: string[];
  pdf_urls?: string[];
  link_urls?: string[];

  // Role specific
  company_name?: string;
  job_title?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;

  // Education specific
  institution_name?: string;
  specialization?: string;
  percentage?: string;
};

export type BexoNotification = {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'view' | 'build';
  created_at: string;
  is_read: boolean;
};

type ProfileStore = {
  profile: Profile | null;
  education: Education[];
  experiences: Experience[];
  projects: Project[];
  skills: Skill[];
  research: Research[];
  updates: Update[];
  notifications: BexoNotification[];
  isLoading: boolean;
  onboardingStep: OnboardingStep;
  manualReviewStepIndex: number;
  parsedResumeData: ParsedResume | null;

  _unsubs: Unsubscribe[];

  initProfile: (userId: string, phone: string) => void;
  updateProfile: (partial: Partial<Profile>) => void;
  checkHandle: (handle: string) => Promise<boolean>;
  setOnboardingStep: (step: OnboardingStep) => void;
  setManualReviewStepIndex: (i: number) => void;
  setParsedResumeData: (data: ParsedResume | null) => void;
  applyParsedResume: (data: ParsedResume) => void;
  isOnboardingGateComplete: () => boolean;
  getCompleteness: () => number;

  startSync: (uid: string) => void;
  stopSync: () => void;

  addEducation: (e: Omit<Education, 'id'>) => void;
  updateEducation: (id: string, e: Partial<Education>) => void;
  removeEducation: (id: string) => void;

  addExperience: (e: Omit<Experience, 'id'>) => void;
  updateExperience: (id: string, e: Partial<Experience>) => void;
  removeExperience: (id: string) => void;

  addProject: (p: Omit<Project, 'id'>) => void;
  updateProject: (id: string, p: Partial<Project>) => void;
  removeProject: (id: string) => void;

  addSkill: (s: Omit<Skill, 'id'>) => void;
  removeSkill: (name: string) => void;

  addResearch: (r: Omit<Research, 'id'>) => void;
  removeResearch: (id: string) => void;

  addUpdate: (u: Omit<Update, 'id' | 'created_at'>) => void;
  updateUpdate: (id: string, u: Partial<Update>) => void;
  removeUpdate: (id: string) => void;

  addNotification: (title: string, description: string, type: BexoNotification['type']) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;

  reset: () => void;
};


const COMPLETENESS_WEIGHTS = {
  identity: 20,   // full_name + handle + avatar_url
  bio: 15,        // headline + bio + location
  education: 15,
  experience: 15,
  projects: 15,
  skills: 10,
  preferences: 10, // theme + font
} as const;

// Track if we've already done an upsert in this sync session to prevent infinite loops
let hasUpsertedThisSession = false;

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profile: null,
      education: [],
      experiences: [],
      projects: [],
      skills: [],
      research: [],
      updates: [],
      notifications: [],
      isLoading: false,
      onboardingStep: 'photo',
      manualReviewStepIndex: 0,
      parsedResumeData: null,
      _unsubs: [],

      startSync: (uid) => {
        const { stopSync } = get();
        stopSync(); // Clear existing

        if (uid.startsWith('dev-')) {
          // Dev mode users aren't authenticated with Firebase, so Firestore will reject.
          // But we still need a profile!
          const { profile } = get();
          const authSession = useAuthStore.getState().session;
          const fallbackPhone = authSession?.user.phone ?? '';
          const fallbackEmail = authSession?.user.email ?? '';
          const fallbackName = authSession?.user.displayName ?? '';

          if (!profile || profile.user_id !== uid) {
            const newProfile: Profile = {
              id: makeId(),
              user_id: uid,
              handle: 'devuser',
              full_name: fallbackName || 'Dev User',
              headline: 'Software Engineer',
              bio: 'A passionate developer building the next generation of web applications.',
              location: 'San Francisco, CA',
              phone: fallbackPhone,
              email: fallbackEmail,
              phone_verified: true,
              email_verified: true,
              is_published: false,
              portfolio_theme: 'default',
              portfolio_font: 'modern',
              identity_card_palette: 'midnight',
              identity_card_template: 'standard',
              custom_links: [],
            };
            set({ profile: newProfile });
          } else {
            // Update email, phone, name if they are empty
            set((s) => ({
              profile: s.profile ? {
                ...s.profile,
                full_name: s.profile.full_name || fallbackName || 'Dev User',
                phone: s.profile.phone || fallbackPhone,
                email: s.profile.email || fallbackEmail,
              } : null
            }));
          }

          // Dev mode default mock notifications
          set({
            notifications: [
              {
                id: 'welcome',
                title: 'Welcome to Bexo!',
                description: 'Complete your profile to 90% to build and publish your portfolio site.',
                type: 'info',
                created_at: new Date().toISOString(),
                is_read: false,
              },
              {
                id: 'resume-parse',
                title: 'Resume Parsed Successfully',
                description: 'Your resume has been processed and your profile fields are prefilled.',
                type: 'success',
                created_at: new Date(Date.now() - 3600000).toISOString(),
                is_read: true,
              }
            ]
          });

          return;
        }

        hasUpsertedThisSession = false;
        const unsubs: Unsubscribe[] = [];

        // 1. Profile
        unsubs.push(subscribeToProfile(uid, (data) => {
          if (data) {
            const authSession = useAuthStore.getState().session;
            const fallbackPhone = authSession?.user.phone ?? '';
            const fallbackEmail = authSession?.user.email ?? '';
            const fallbackName = authSession?.user.displayName ?? '';
            const fallbackAvatar = authSession?.user.photoURL ?? '';

            const mergedProfile: Profile = {
              id: data.id || makeId(),
              user_id: uid,
              handle: data.handle || '',
              full_name: data.full_name || data.displayName || fallbackName || '',
              headline: data.headline || '',
              bio: data.bio || '',
              phone: data.phone || fallbackPhone,
              email: data.email || fallbackEmail,
              phone_verified: data.phone_verified ?? data.phoneVerified ?? true,
              email_verified: data.email_verified ?? data.emailVerified ?? true,
              is_published: data.is_published ?? false,
              portfolio_theme: data.portfolio_theme || 'default',
              portfolio_font: data.portfolio_font || 'modern',
              identity_card_palette: data.identity_card_palette || 'midnight',
              identity_card_template: data.identity_card_template || 'standard',
              avatar_url: data.avatar_url || data.photoURL || fallbackAvatar || undefined,
              linkedin_url: data.linkedin_url || undefined,
              github_url: data.github_url || undefined,
              custom_links: data.custom_links || [],
              location: data.location || undefined,
              website: data.website || undefined,
              resume_url: data.resume_url || undefined,
              dob: data.dob || undefined,
              website_preference: data.website_preference || undefined,
              identity_card_font: data.identity_card_font || undefined,
            };

            // If some fields were missing in firestore, let's save them so they're in firestore too!
            const needsUpsert = 
              !('id' in data) || 
              !('portfolio_theme' in data) || 
              !('portfolio_font' in data) || 
              !('phone' in data) || 
              !('email' in data) || 
              !('full_name' in data) || 
              !('email_verified' in data);
            
            if (needsUpsert && !hasUpsertedThisSession) {
              hasUpsertedThisSession = true;
              upsertUser(uid, mergedProfile).catch((err) => {
                console.warn('Failed to upsert missing profile fields:', err);
              });
            }

            set({ profile: mergedProfile });
          } else {
            // No profile document in firestore at all! Create one using auth session data
            const authSession = useAuthStore.getState().session;
            const fallbackPhone = authSession?.user.phone ?? '';
            const fallbackEmail = authSession?.user.email ?? '';
            const fallbackName = authSession?.user.displayName ?? '';
            const fallbackAvatar = authSession?.user.photoURL ?? '';

            const newProfile: Profile = {
              id: makeId(),
              user_id: uid,
              handle: '',
              full_name: fallbackName,
              headline: '',
              bio: '',
              phone: fallbackPhone,
              email: fallbackEmail,
              phone_verified: true,
              email_verified: true,
              is_published: false,
              portfolio_theme: 'default',
              portfolio_font: 'modern',
              identity_card_palette: 'midnight',
              identity_card_template: 'standard',
              avatar_url: fallbackAvatar || undefined,
              custom_links: [],
            };
            upsertUser(uid, newProfile).catch(console.warn);
            set({ profile: newProfile });
          }
        }));

        // 2. Sub-collections
        unsubs.push(subscribeToSubCollection(uid, 'education', (docs) => set({ education: docs as Education[] })));
        unsubs.push(subscribeToSubCollection(uid, 'experiences', (docs) => set({ experiences: docs as Experience[] })));
        unsubs.push(subscribeToSubCollection(uid, 'projects', (docs) => set({ projects: docs as Project[] })));
        unsubs.push(subscribeToSubCollection(uid, 'skills', (docs) => set({ skills: docs as Skill[] })));
        unsubs.push(subscribeToSubCollection(uid, 'research', (docs) => set({ research: docs as Research[] })));
        unsubs.push(subscribeToSubCollection(uid, 'updates', (docs) => set({ updates: docs as Update[] })));
        unsubs.push(subscribeToSubCollection(uid, 'notifications', (docs) => {
          const sorted = (docs as BexoNotification[]).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          if (sorted.length === 0) {
            const defaultNotifs: BexoNotification[] = [
              {
                id: 'welcome',
                title: 'Welcome to Bexo!',
                description: 'Complete your profile to 90% to build and publish your portfolio site.',
                type: 'info',
                created_at: new Date().toISOString(),
                is_read: false,
              }
            ];
            defaultNotifs.forEach(n => addSubItem(uid, 'notifications', n.id, n).catch(console.warn));
            set({ notifications: defaultNotifs });
          } else {
            set({ notifications: sorted });
          }
        }));

        set({ _unsubs: unsubs });
      },

      stopSync: () => {
        get()._unsubs.forEach((u) => u?.());
        set({ _unsubs: [] });
      },

      initProfile: (userId, phone) => {
        const { profile } = get();
        if (!profile || profile.user_id !== userId) {
          const newProfile = defaultProfile(userId, phone);
          set({ profile: newProfile });

          upsertUser(userId, {
            uid: userId,
            phone,
            full_name: newProfile.full_name || '',
          }).catch((err) => console.warn('[ProfileStore] upsertUser failed:', err));
        }
      },

      updateProfile: (partial) => {
        set((s) => ({
          profile: s.profile ? { ...s.profile, ...partial } : null,
        }));

        const { profile } = get();
        if (profile?.user_id) {
          const syncFields: Record<string, any> = {};
          const allowedKeys = [
            'full_name', 'handle', 'headline', 'bio', 'avatar_url',
            'location', 'website', 'linkedin_url', 'github_url',
            'custom_links',
            'email', 'is_published', 'portfolio_theme', 'portfolio_font',
            'email_verified', 'dob', 'resume_url', 'website_preference',
            'identity_card_font', 'phone', 'phone_verified'
          ] as const;
          for (const key of allowedKeys) {
            if (key in partial) syncFields[key] = (partial as any)[key];
          }
          if (Object.keys(syncFields).length > 0) {
            updateUserFields(profile.user_id, syncFields).catch((err) =>
              console.warn('[ProfileStore] updateUserFields failed:', err)
            );
          }
        }
      },

      checkHandle: async (handle) => {
        try {
          const { profile } = get();
          if (profile?.user_id?.startsWith('dev-')) {
            return true; // Dev mode bypass
          }
          return await checkHandleAvailable(handle, profile?.user_id);
        } catch (error) {
          console.error('[ProfileStore] checkHandle error:', error);
          return false;
        }
      },

      setOnboardingStep: (onboardingStep) => set({ onboardingStep }),
      setManualReviewStepIndex: (manualReviewStepIndex) => set({ manualReviewStepIndex }),
      setParsedResumeData: (parsedResumeData) => set({ parsedResumeData }),

      applyParsedResume: (data) => {
        const { updateProfile, profile } = get();
        const uid = profile?.user_id;
        
        if (data.headline) updateProfile({ headline: data.headline });
        if (data.bio) updateProfile({ bio: data.bio });
        if (data.location) updateProfile({ location: data.location });

        if (uid) {
          if (data.education?.length) {
            const items = data.education.map((e) => ({ ...e, id: makeId() }));
            set({ education: items as Education[] });
            bulkWriteSubCollection(uid, 'education', items).catch(console.warn);
          }
          if (data.experiences?.length) {
            const items = data.experiences.map((e) => ({ ...e, id: makeId() }));
            set({ experiences: items as Experience[] });
            bulkWriteSubCollection(uid, 'experiences', items).catch(console.warn);
          }
          if (data.projects?.length) {
            const items = data.projects.map((p) => ({ ...p, id: makeId() }));
            set({ projects: items as Project[] });
            bulkWriteSubCollection(uid, 'projects', items).catch(console.warn);
          }
          if (data.skills?.length) {
            const items = data.skills.map((s) => ({
              id: makeId(),
              name: s.name,
              category: s.category || '',
              level: (s.level as Skill['level']) || 'intermediate',
            }));
            set({ skills: items as Skill[] });
            bulkWriteSubCollection(uid, 'skills', items).catch(console.warn);
          }
          if (data.research?.length) {
            const items = data.research.map((r) => ({ ...r, id: makeId() }));
            set({ research: items as Research[] });
            bulkWriteSubCollection(uid, 'research', items).catch(console.warn);
          }
        }
      },

      getCompleteness: () => {
        const { profile, education, experiences, projects, skills } = get();
        if (!profile) return 0;
        let score = 0;

        const hasIdentity = !!(profile.full_name && profile.handle && profile.avatar_url);
        if (hasIdentity) score += COMPLETENESS_WEIGHTS.identity;

        const hasBio =
          !!(profile.headline && profile.bio && profile.bio.trim().length > 0 && profile.location);
        if (hasBio) score += COMPLETENESS_WEIGHTS.bio;

        if (education.length >= 1) score += COMPLETENESS_WEIGHTS.education;
        if (experiences.length >= 1) score += COMPLETENESS_WEIGHTS.experience;
        if (projects.length >= 1) score += COMPLETENESS_WEIGHTS.projects;
        if (skills.length >= 3) score += COMPLETENESS_WEIGHTS.skills;

        const hasPrefs = !!(
          profile.portfolio_theme !== 'default' || profile.portfolio_font !== 'modern'
        );
        if (hasPrefs) score += COMPLETENESS_WEIGHTS.preferences;

        return Math.min(100, score);
      },

      isOnboardingGateComplete: () => {
        return get().getCompleteness() >= 90;
      },

      addEducation: (e) => {
        const id = makeId();
        const uid = get().profile?.user_id;
        set((s) => ({ education: [...s.education, { ...e, id }] as Education[] }));
        if (uid) addSubItem(uid, 'education', id, e).catch(console.warn);
      },
      updateEducation: (id, e) => {
        const uid = get().profile?.user_id;
        set((s) => ({
          education: s.education.map((item) =>
            item.id === id ? { ...item, ...e } : item
          ) as Education[],
        }));
        if (uid) updateSubItem(uid, 'education', id, e).catch(console.warn);
      },
      removeEducation: (id) => {
        const uid = get().profile?.user_id;
        set((s) => ({ education: s.education.filter((e) => e.id !== id) }));
        if (uid) deleteSubItem(uid, 'education', id).catch(console.warn);
      },

      addExperience: (e) => {
        const id = makeId();
        const uid = get().profile?.user_id;
        set((s) => ({ experiences: [...s.experiences, { ...e, id }] as Experience[] }));
        if (uid) addSubItem(uid, 'experiences', id, e).catch(console.warn);
      },
      updateExperience: (id, e) => {
        const uid = get().profile?.user_id;
        set((s) => ({
          experiences: s.experiences.map((item) =>
            item.id === id ? { ...item, ...e } : item
          ) as Experience[],
        }));
        if (uid) updateSubItem(uid, 'experiences', id, e).catch(console.warn);
      },
      removeExperience: (id) => {
        const uid = get().profile?.user_id;
        set((s) => ({ experiences: s.experiences.filter((e) => e.id !== id) }));
        if (uid) deleteSubItem(uid, 'experiences', id).catch(console.warn);
      },

      addProject: (p) => {
        const id = makeId();
        const uid = get().profile?.user_id;
        set((s) => ({ projects: [...s.projects, { ...p, id }] as Project[] }));
        if (uid) addSubItem(uid, 'projects', id, p).catch(console.warn);
      },
      updateProject: (id, p) => {
        const uid = get().profile?.user_id;
        set((s) => ({
          projects: s.projects.map((item) =>
            item.id === id ? { ...item, ...p } : item
          ) as Project[],
        }));
        if (uid) updateSubItem(uid, 'projects', id, p).catch(console.warn);
      },
      removeProject: (id) => {
        const uid = get().profile?.user_id;
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
        if (uid) deleteSubItem(uid, 'projects', id).catch(console.warn);
      },

      addSkill: (s) => {
        const id = makeId();
        const uid = get().profile?.user_id;
        set((st) => ({ skills: [...st.skills, { ...s, id }] as Skill[] }));
        if (uid) addSubItem(uid, 'skills', id, s).catch(console.warn);
      },
      removeSkill: (name) => {
        const uid = get().profile?.user_id;
        const skill = get().skills.find((sk) => sk.name === name);
        if (skill) {
          set((s) => ({ skills: s.skills.filter((sk) => sk.name !== name) }));
          if (uid) deleteSubItem(uid, 'skills', skill.id).catch(console.warn);
        }
      },

      addResearch: (r) => {
        const id = makeId();
        const uid = get().profile?.user_id;
        set((s) => ({ research: [...s.research, { ...r, id }] as Research[] }));
        if (uid) addSubItem(uid, 'research', id, r).catch(console.warn);
      },
      removeResearch: (id) => {
        const uid = get().profile?.user_id;
        set((s) => ({ research: s.research.filter((r) => r.id !== id) }));
        if (uid) deleteSubItem(uid, 'research', id).catch(console.warn);
      },

      addUpdate: (u) => {
        const id = makeId();
        const uid = get().profile?.user_id;
        const newUpdate = { ...u, id, created_at: new Date().toISOString() };
        set((s) => ({ updates: [newUpdate, ...s.updates] as Update[] }));
        if (uid) addSubItem(uid, 'updates', id, newUpdate).catch(console.warn);
      },
      removeUpdate: (id) => {
        const uid = get().profile?.user_id;
        set((s) => ({ updates: s.updates.filter((u) => u.id !== id) }));
        if (uid) deleteSubItem(uid, 'updates', id).catch(console.warn);
      },
      updateUpdate: (id, u) => {
        const uid = get().profile?.user_id;
        set((s) => ({
          updates: s.updates.map((item) =>
            item.id === id ? { ...item, ...u } : item
          ) as Update[],
        }));
        if (uid) updateSubItem(uid, 'updates', id, u).catch(console.warn);
      },

      addNotification: (title, description, type) => {
        const id = makeId();
        const uid = get().profile?.user_id;
        const newNotif: BexoNotification = {
          id,
          title,
          description,
          type,
          created_at: new Date().toISOString(),
          is_read: false,
        };
        
        if (uid && !uid.startsWith('dev-')) {
          addSubItem(uid, 'notifications', id, newNotif).catch(console.warn);
        } else {
          set((s) => ({ notifications: [newNotif, ...s.notifications] }));
        }
      },
      
      markNotificationRead: (id) => {
        const uid = get().profile?.user_id;
        if (uid && !uid.startsWith('dev-')) {
          updateSubItem(uid, 'notifications', id, { is_read: true }).catch(console.warn);
        } else {
          set((s) => ({
            notifications: s.notifications.map((n) =>
              n.id === id ? { ...n, is_read: true } : n
            ),
          }));
        }
      },
      
      markAllNotificationsRead: async () => {
        const { notifications, profile } = get();
        if (!profile?.user_id) return;
        
        const unread = notifications.filter(n => !n.is_read);
        if (unread.length === 0) return;

        const batch = writeBatch(db);
        for (const n of unread) {
          batch.update(doc(db, 'users', profile.user_id, 'notifications', n.id), { is_read: true });
        }
        
        try {
          await batch.commit();
        } catch (err) {
          console.error('[ProfileStore] markAllNotificationsRead failed:', err);
        }
      },
      
      clearAllNotifications: async () => {
        const { notifications, profile } = get();
        if (!profile?.user_id) return;
        if (notifications.length === 0) return;

        const batch = writeBatch(db);
        for (const n of notifications) {
          batch.delete(doc(db, 'users', profile.user_id, 'notifications', n.id));
        }
        
        try {
          await batch.commit();
        } catch (err) {
          console.error('[ProfileStore] clearAllNotifications failed:', err);
        }
      },

      reset: () => {
        const { stopSync } = get();
        stopSync();
        set({
          profile: null,
          education: [],
          experiences: [],
          projects: [],
          skills: [],
          research: [],
          updates: [],
          notifications: [],
          onboardingStep: 'photo',
          parsedResumeData: null,
        });
      },
    }),
    {
      name: 'bexo-profile-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        const { _unsubs, ...rest } = state;
        return rest;
      },
    }
  )
);
