import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Unsubscribe } from '@firebase/firestore';

import { subscribeToPortfolio, triggerPortfolioRebuild } from '@/services/firestoreService';

export type BuildStatus = 'QUEUED' | 'BUILDING' | 'DONE' | 'FAILED' | null;

type PortfolioStore = {
  buildStatus: BuildStatus;
  portfolioUrl: string | null;
  buildLog: string | null;
  buildStartedAt: number | null;

  _unsub: Unsubscribe | null;

  startSync: (uid: string) => void;
  stopSync: () => void;
  
  triggerBuild: (uid: string) => Promise<void>;
  reset: () => void;
};

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      buildStatus: null,
      portfolioUrl: null,
      buildLog: null,
      buildStartedAt: null,
      _unsub: null,

      startSync: (uid) => {
        const { stopSync } = get();
        stopSync(); // Clear existing

        const unsub = subscribeToPortfolio(uid, (data) => {
          if (data) {
            set({
              buildStatus: data.buildStatus ?? null,
              portfolioUrl: data.portfolioUrl ?? null,
              buildLog: data.buildLog ?? null,
              buildStartedAt: data.buildStartedAt ?? null,
            });
          } else {
            set({
              buildStatus: null,
              portfolioUrl: null,
              buildLog: null,
              buildStartedAt: null,
            });
          }
        });
        set({ _unsub: unsub });
      },

      stopSync: () => {
        const { _unsub } = get();
        if (_unsub) _unsub();
        set({ _unsub: null });
      },

      triggerBuild: async (uid) => {
        // Optimistic update
        set({ buildStatus: 'QUEUED', buildStartedAt: Date.now(), buildLog: 'Build requested...' });
        
        try {
          await triggerPortfolioRebuild(uid);
        } catch (err) {
          console.warn('[PortfolioStore] triggerBuild failed:', err);
          // Revert on failure
          set({ buildStatus: 'FAILED', buildLog: 'Failed to request build.' });
        }
      },

      reset: () => {
        const { stopSync } = get();
        stopSync();
        set({
          buildStatus: null,
          portfolioUrl: null,
          buildLog: null,
          buildStartedAt: null,
        });
      },
    }),
    {
      name: 'bexo-portfolio-v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ _unsub, ...rest }) => rest, // Don't persist unsub function
    }
  )
);
