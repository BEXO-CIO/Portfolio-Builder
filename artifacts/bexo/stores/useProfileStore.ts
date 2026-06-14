import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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

type ProfileStore = {
  profile: Profile | null;
  education: Education[];
  experiences: Experience[];
  projects: Project[];
  skills: Skill[];
  research: Research[];
  isLoading: boolean;
  onboardingStep: OnboardingStep;
  manualReviewStepIndex: number;
  parsedResumeData: ParsedResume | null;

  initProfile: (userId: string, phone: string) => void;
  updateProfile: (partial: Partial<Profile>) => void;
  checkHandle: (handle: string) => Promise<boolean>;
  setOnboardingStep: (step: OnboardingStep) => void;
  setManualReviewStepIndex: (i: number) => void;
  setParsedResumeData: (data: ParsedResume | null) => void;
  applyParsedResume: (data: ParsedResume) => void;
  isOnboardingGateComplete: () => boolean;
  getCompleteness: () => number;

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

  reset: () => void;
};

const COMPLETENESS_WEIGHTS = {
  identity: 15,   // full_name + handle + avatar_url
  bio: 15,        // headline + bio + location
  contact: 10,    // email + phone_verified
  education: 15,
  experience: 15,
  projects: 15,
  skills: 10,
  preferences: 5, // theme + font
} as const;

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profile: null,
      education: [],
      experiences: [],
      projects: [],
      skills: [],
      research: [],
      isLoading: false,
      onboardingStep: 'email',
      manualReviewStepIndex: 0,
      parsedResumeData: null,

      initProfile: (userId, phone) => {
        const { profile } = get();
        if (!profile || profile.user_id !== userId) {
          set({ profile: defaultProfile(userId, phone) });
        }
      },

      updateProfile: (partial) => {
        set((s) => ({
          profile: s.profile ? { ...s.profile, ...partial } : null,
        }));
      },

      checkHandle: async (handle) => {
        await new Promise((r) => setTimeout(r, 400));
        const { profile } = get();
        const taken = ['admin', 'bexo', 'team', 'support', 'help'];
        if (taken.includes(handle.toLowerCase())) return false;
        if (profile?.handle === handle) return true;
        return true;
      },

      setOnboardingStep: (onboardingStep) => set({ onboardingStep }),
      setManualReviewStepIndex: (manualReviewStepIndex) => set({ manualReviewStepIndex }),
      setParsedResumeData: (parsedResumeData) => set({ parsedResumeData }),

      applyParsedResume: (data) => {
        const { updateProfile } = get();
        if (data.headline) updateProfile({ headline: data.headline });
        if (data.bio) updateProfile({ bio: data.bio });
        if (data.location) updateProfile({ location: data.location });

        if (data.education?.length) {
          set({ education: data.education.map((e) => ({ ...e, id: makeId() })) });
        }
        if (data.experiences?.length) {
          set({ experiences: data.experiences.map((e) => ({ ...e, id: makeId() })) });
        }
        if (data.projects?.length) {
          set({ projects: data.projects.map((p) => ({ ...p, id: makeId() })) });
        }
        if (data.skills?.length) {
          set({
            skills: data.skills.map((s) => ({
              id: makeId(),
              name: s.name,
              category: s.category || '',
              level: (s.level as Skill['level']) || 'intermediate',
            })),
          });
        }
        if (data.research?.length) {
          set({ research: data.research.map((r) => ({ ...r, id: makeId() })) });
        }
      },

      getCompleteness: () => {
        const { profile, education, experiences, projects, skills } = get();
        if (!profile) return 0;
        let score = 0;

        const hasIdentity = !!(profile.full_name && profile.handle && profile.avatar_url);
        if (hasIdentity) score += COMPLETENESS_WEIGHTS.identity;

        const hasBio =
          !!(profile.headline && profile.bio && profile.bio.length >= 20 && profile.location);
        if (hasBio) score += COMPLETENESS_WEIGHTS.bio;

        const hasContact = !!(profile.email && profile.phone_verified);
        if (hasContact) score += COMPLETENESS_WEIGHTS.contact;

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

      addEducation: (e) =>
        set((s) => ({ education: [...s.education, { ...e, id: makeId() }] })),
      updateEducation: (id, e) =>
        set((s) => ({
          education: s.education.map((item) =>
            item.id === id ? { ...item, ...e } : item
          ),
        })),
      removeEducation: (id) =>
        set((s) => ({ education: s.education.filter((e) => e.id !== id) })),

      addExperience: (e) =>
        set((s) => ({ experiences: [...s.experiences, { ...e, id: makeId() }] })),
      updateExperience: (id, e) =>
        set((s) => ({
          experiences: s.experiences.map((item) =>
            item.id === id ? { ...item, ...e } : item
          ),
        })),
      removeExperience: (id) =>
        set((s) => ({ experiences: s.experiences.filter((e) => e.id !== id) })),

      addProject: (p) =>
        set((s) => ({ projects: [...s.projects, { ...p, id: makeId() }] })),
      updateProject: (id, p) =>
        set((s) => ({
          projects: s.projects.map((item) =>
            item.id === id ? { ...item, ...p } : item
          ),
        })),
      removeProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      addSkill: (s) =>
        set((st) => ({ skills: [...st.skills, { ...s, id: makeId() }] })),
      removeSkill: (name) =>
        set((s) => ({ skills: s.skills.filter((sk) => sk.name !== name) })),

      addResearch: (r) =>
        set((s) => ({ research: [...s.research, { ...r, id: makeId() }] })),
      removeResearch: (id) =>
        set((s) => ({ research: s.research.filter((r) => r.id !== id) })),

      reset: () =>
        set({
          profile: null,
          education: [],
          experiences: [],
          projects: [],
          skills: [],
          research: [],
          onboardingStep: 'email',
          parsedResumeData: null,
        }),
    }),
    {
      name: 'bexo-profile-v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
