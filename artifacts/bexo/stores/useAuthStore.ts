/**
 * useAuthStore — Bexo Two-Step Mandatory Verification
 *
 * FLOW (both steps are mandatory for every user):
 *   Step 1: Phone number → SMS OTP → Firebase Phone Auth user created
 *   Step 2: Google OAuth → linkWithCredential → email linked to same Firebase user
 *
 * After both are verified, session.phoneVerified AND session.emailVerified are true.
 * The root index.tsx gates access to onboarding/dashboard on both flags.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  signInWithCredential,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { auth } from '@/services/firebase';
import { sendPhoneOtp, confirmPhoneOtp, resetRecaptcha } from '@/services/authService';
import { upsertUser } from '@/services/firestoreService';

export type BexoSession = {
  user: {
    id: string;
    phone: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  };
  phoneVerified: boolean;
  emailVerified: boolean;
  access_token: string;
};

type AuthStore = {
  session: BexoSession | null;
  isLoading: boolean;
  phoneNumber: string;
  otpSentAt: number | null;
  hasSeenWalkthrough: boolean;

  /** In-memory only — NOT persisted */
  _verificationId: string | null;

  // ── Setters ────────────────────────────────────────────────────────────────
  setPhoneNumber: (phone: string) => void;
  setOtpSentAt: (ts: number | null) => void;
  getOtpRemainingSeconds: () => number;
  setHasSeenWalkthrough: (v: boolean) => void;

  // ── Step 1: Phone OTP ──────────────────────────────────────────────────────
  sendOtp: (phone: string, verifier: any) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, code: string) => Promise<{ error: string | null }>;

  // ── Step 2: Google OAuth (link to phone-auth user) ─────────────────────────
  linkGoogle: (idToken: string, accessToken?: string) => Promise<{ error: string | null }>;

  // ── Sign Out ───────────────────────────────────────────────────────────────
  signOut: () => Promise<void>;

  /** Internal: sync session from live Firebase User */
  _syncUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      session: null,
      isLoading: false,
      phoneNumber: '',
      otpSentAt: null,
      hasSeenWalkthrough: false,
      _verificationId: null,

      setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
      setOtpSentAt: (otpSentAt) => set({ otpSentAt }),
      setHasSeenWalkthrough: (v) => set({ hasSeenWalkthrough: v }),

      getOtpRemainingSeconds: () => {
        const { otpSentAt } = get();
        if (!otpSentAt) return 0;
        const elapsed = Math.floor((Date.now() - otpSentAt) / 1000);
        return Math.max(0, 600 - elapsed);
      },

      // ── STEP 1A: Send SMS OTP ───────────────────────────────────────────────
      sendOtp: async (phone, verifier) => {
        set({ isLoading: true, phoneNumber: phone });
        const { verificationId, error } = await sendPhoneOtp(phone, verifier);
        if (error) {
          set({ isLoading: false });
          return { error };
        }
        if (!verificationId && !__DEV__) {
          set({ isLoading: false });
          return { error: 'Failed to send OTP. Please try again.' };
        }
        // In DEV mode, verificationId might be null which is fine, we just fall back
        set({ isLoading: false, otpSentAt: Date.now(), _verificationId: verificationId });
        return { error: null };
      },

      // ── STEP 1B: Verify SMS Code → creates Firebase phone-auth user ─────────
      verifyOtp: async (_phone, code) => {
        set({ isLoading: true });
        const verificationId = get()._verificationId;

        // ── DEV fallback (Expo Go / emulator, no real SMS) ──────────────────
        if (!verificationId) {
          await new Promise((r) => setTimeout(r, 800));
          const phone = get().phoneNumber;
          const digits = phone.replace(/\D/g, '');
          const valid =
            code === '000000' ||
            (digits.endsWith('9999999999') && (code === '001234' || code === '123456'));

          if (!valid) {
            set({ isLoading: false });
            return { error: 'Wrong code. Use 0000 for any number.' };
          }

          const uid = 'dev-' + digits.slice(-6);
          const session: BexoSession = {
            user: { id: uid, phone, email: null, displayName: null, photoURL: null },
            phoneVerified: true,
            emailVerified: false,   // ← must still do Google step
            access_token: 'dev_' + Date.now(),
          };
          set({ session, isLoading: false });

          // Bootstrap Firestore
          upsertUser(uid, { uid, phone, phoneVerified: true }).catch(console.warn);
          return { error: null };
        }

        // ── Real Firebase Phone Auth ────────────────────────────────────────
        const { credential, error } = await confirmPhoneOtp(verificationId, code);
        if (error || !credential) {
          set({ isLoading: false });
          return { error: error ?? 'Incorrect or expired code — try again.' };
        }

        const user = credential.user;
        const session: BexoSession = {
          user: {
            id: user.uid,
            phone: user.phoneNumber ?? get().phoneNumber,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
          phoneVerified: true,
          emailVerified: false,   // ← must still do Google step
          access_token: 'firebase_' + user.uid,
        };
        set({ session, isLoading: false, _verificationId: null });

        // Bootstrap Firestore
        upsertUser(user.uid, {
          uid: user.uid,
          phone: user.phoneNumber ?? get().phoneNumber,
          phoneVerified: true,
        }).catch(console.warn);

        return { error: null };
      },

      // ── STEP 2: Link Google to the existing phone-auth Firebase user ────────
      linkGoogle: async (idToken, accessToken) => {
        set({ isLoading: true });
        const currentSession = get().session;

        // ── DEV mode: fake Google link ────────────────────────────────────
        if (__DEV__ && idToken.startsWith('dev-')) {
          await new Promise((r) => setTimeout(r, 600));
          const uid = currentSession?.user.id ?? 'dev-user';
          const updatedSession: BexoSession = {
            user: {
              id: uid,
              phone: currentSession?.user.phone ?? '',
              email: 'dev@gmail.com',
              displayName: 'Dev User',
              photoURL: null,
            },
            phoneVerified: true,
            emailVerified: true,
            access_token: 'dev_google_' + Date.now(),
          };
          set({ session: updatedSession, isLoading: false });
          upsertUser(uid, { email: 'dev@gmail.com', emailVerified: true, googleLinked: true }).catch(console.warn);
          return { error: null };
        }

        try {
          const googleCredential = GoogleAuthProvider.credential(idToken, accessToken);
          const firebaseUser = auth.currentUser;

          let uid: string;
          let email: string | null;
          let displayName: string | null;
          let photoURL: string | null;

          if (firebaseUser) {
            // Link Google to the existing phone-auth user
            try {
              const result = await linkWithCredential(firebaseUser, googleCredential);
              uid = result.user.uid;
              email = result.user.email;
              displayName = result.user.displayName;
              photoURL = result.user.photoURL;
            } catch (err: any) {
              if (err.code === 'auth/credential-already-in-use') {
                return { error: 'This Google account is already linked to another Bexo profile.' };
              }
              return { error: mapAuthError(err.code) };
            }
          } else {
            // No real Firebase user (e.g. used DEV phone auth bypass).
            // Let's sign them in directly with Google to create a REAL Firebase account!
            try {
              const result = await signInWithCredential(auth, googleCredential);
              uid = result.user.uid;
              email = result.user.email;
              displayName = result.user.displayName;
              photoURL = result.user.photoURL;
            } catch (err: any) {
              return { error: mapAuthError(err.code) };
            }
          }

          const updatedSession: BexoSession = {
            user: {
              id: currentSession?.user.id ?? uid,
              phone: currentSession?.user.phone ?? '',
              email,
              displayName,
              photoURL,
            },
            phoneVerified: true,
            emailVerified: true,   // ← Google verified = email verified
            access_token: 'firebase_' + uid,
          };
          set({ session: updatedSession, isLoading: false });

          // Sync Google info to Firestore
          upsertUser(currentSession?.user.id ?? uid, {
            email,
            displayName,
            photoURL,
            emailVerified: true,
            googleLinked: true,
          }).catch(console.warn);

          return { error: null };
        } catch (err: any) {
          console.error('[AuthStore] linkGoogle error:', err.code, err.message);
          set({ isLoading: false });
          const msg =
            err.code === 'auth/account-exists-with-different-credential'
              ? 'This Google account is linked to a different phone number.'
              : 'Google verification failed. Please try again.';
          return { error: msg };
        }
      },

      // ── Sign Out ────────────────────────────────────────────────────────────
      signOut: async () => {
        await firebaseSignOut(auth).catch(console.warn);
        resetRecaptcha();
        set({ session: null, _verificationId: null, phoneNumber: '', otpSentAt: null });
      },

      _syncUser: (user) => {
        const prev = get().session;
        if (!user) {
          // If we have a DEV session, don't wipe it just because Firebase is empty
          if (prev?.user.id.startsWith('dev-')) return;
          // Otherwise, Firebase says we're logged out
          set({ session: null });
          return;
        }
        if (!prev) return; // Don't create a session from listener alone — needs explicit flow
        // Update the session with latest Firebase user data
        set({
          session: {
            ...prev,
            user: {
              id: user.uid,
              phone: user.phoneNumber ?? prev.user.phone,
              email: user.email ?? prev.user.email,
              displayName: user.displayName ?? prev.user.displayName,
              photoURL: user.photoURL ?? prev.user.photoURL,
            },
          },
        });
      },
    }),
    {
      name: 'bexo-auth-v4',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ _verificationId, ...rest }) => rest,
    }
  )
);

// Attach Firebase auth state listener
onAuthStateChanged(auth, (user) => {
  useAuthStore.getState()._syncUser(user);
});
