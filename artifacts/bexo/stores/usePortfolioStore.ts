import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type BuildStatus = 'queued' | 'building' | 'done' | 'failed' | null;

type Update = {
  id: string;
  type: 'project' | 'achievement' | 'role' | 'education';
  title: string;
  description: string;
  created_at: string;
};

type PortfolioStore = {
  buildStatus: BuildStatus;
  portfolioUrl: string | null;
  buildLog: string | null;
  buildStartedAt: number | null;
  updates: Update[];

  triggerBuild: (profileId: string) => Promise<void>;
  setBuildStatus: (status: BuildStatus) => void;
  addUpdate: (u: Omit<Update, 'id' | 'created_at'>) => void;
  removeUpdate: (id: string) => void;
  reset: () => void;
};

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      buildStatus: null,
      portfolioUrl: null,
      buildLog: null,
      buildStartedAt: null,
      updates: [],

      triggerBuild: async (profileId) => {
        const handle = profileId;
        set({ buildStatus: 'queued', buildStartedAt: Date.now(), buildLog: null });

        await new Promise((r) => setTimeout(r, 1500));
        set({ buildStatus: 'building', buildLog: 'Compiling portfolio...' });

        await new Promise((r) => setTimeout(r, 3000));
        set({
          buildStatus: 'done',
          portfolioUrl: `https://${handle}.mybexo.com`,
          buildLog: 'Build complete.',
        });
      },

      setBuildStatus: (buildStatus) => set({ buildStatus }),

      addUpdate: (u) =>
        set((s) => ({
          updates: [
            { ...u, id: makeId(), created_at: new Date().toISOString() },
            ...s.updates,
          ],
        })),

      removeUpdate: (id) =>
        set((s) => ({ updates: s.updates.filter((u) => u.id !== id) })),

      reset: () =>
        set({ buildStatus: null, portfolioUrl: null, buildLog: null, updates: [] }),
    }),
    {
      name: 'bexo-portfolio-v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
