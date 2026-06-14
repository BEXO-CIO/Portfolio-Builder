import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type BexoSession = {
  user: { id: string; phone: string };
  access_token: string;
};

type AuthStore = {
  session: BexoSession | null;
  isLoading: boolean;
  phoneNumber: string;
  otpSentAt: number | null;
  hasSeenWalkthrough: boolean;
  dataConsentAccepted: boolean;
  collectedEmail: string;
  collectedPhone: string;

  setSession: (session: BexoSession | null) => void;
  setPhoneNumber: (phone: string) => void;
  setOtpSentAt: (ts: number | null) => void;
  getOtpRemainingSeconds: () => number;
  setHasSeenWalkthrough: (v: boolean) => void;
  setDataConsentAccepted: (v: boolean) => void;
  setCollectedEmail: (email: string) => void;
  setCollectedPhone: (phone: string) => void;
  sendOtp: (phone: string) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, code: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      session: null,
      isLoading: false,
      phoneNumber: '',
      otpSentAt: null,
      hasSeenWalkthrough: false,
      dataConsentAccepted: false,
      collectedEmail: '',
      collectedPhone: '',

      setSession: (session) => set({ session }),
      setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
      setOtpSentAt: (otpSentAt) => set({ otpSentAt }),

      getOtpRemainingSeconds: () => {
        const { otpSentAt } = get();
        if (!otpSentAt) return 0;
        const elapsed = Math.floor((Date.now() - otpSentAt) / 1000);
        return Math.max(0, 600 - elapsed);
      },

      setHasSeenWalkthrough: (hasSeenWalkthrough) => set({ hasSeenWalkthrough }),
      setDataConsentAccepted: (dataConsentAccepted) => set({ dataConsentAccepted }),
      setCollectedEmail: (collectedEmail) => set({ collectedEmail }),
      setCollectedPhone: (collectedPhone) => set({ collectedPhone }),

      sendOtp: async (phone) => {
        set({ isLoading: true, phoneNumber: phone, otpSentAt: Date.now() });
        await new Promise((r) => setTimeout(r, 900));
        set({ isLoading: false });
        return { error: null };
      },

      verifyOtp: async (phone, code) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 900));
        if (code === '0000') {
          const userId = 'user-' + phone.replace(/\D/g, '').slice(-6);
          const session: BexoSession = {
            user: { id: userId, phone },
            access_token: 'mock_' + Date.now(),
          };
          set({ session, isLoading: false });
          return { error: null };
        }
        set({ isLoading: false });
        return { error: 'Incorrect code. Enter 0000 to continue.' };
      },

      signOut: async () => {
        set({ session: null });
      },
    }),
    {
      name: 'bexo-auth-v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
