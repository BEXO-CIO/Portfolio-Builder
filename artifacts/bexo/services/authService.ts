/**
 * Firebase Phone Auth service for Bexo.
 *
 * Flow:
 *  1. sendPhoneOtp(phoneNumber)   → sends SMS OTP, returns verificationId
 *  2. confirmPhoneOtp(verificationId, code) → verifies code, returns UserCredential
 *
 * Test numbers configured in Firebase Console (no real SMS needed in dev):
 *   +91 0000000000  →  code 0000
 *   +91 9999999999  →  code 1234
 */

import {
  ApplicationVerifier,
  PhoneAuthProvider,
  signInWithCredential,
  signInWithPhoneNumber,
  UserCredential,
} from 'firebase/auth';
import { auth } from './firebase';

export function resetRecaptcha() {
  // No-op for Expo verifier since it manages its own state
}

/**
 * Sends an SMS OTP to the given phone number via Firebase Phone Auth.
 * Returns the verificationId that must be passed to confirmPhoneOtp.
 */
export async function sendPhoneOtp(
  phoneNumber: string,
  verifier: ApplicationVerifier
): Promise<{ verificationId: string | null; error: string | null }> {
  try {
    if (!verifier) {
      console.warn('[AuthService] No verifier provided to sendPhoneOtp. Falling back to dev mode.');
      return { verificationId: null, error: null };
    }
    const phoneProvider = new PhoneAuthProvider(auth);
    const verificationId = await phoneProvider.verifyPhoneNumber(phoneNumber, verifier);
    return { verificationId, error: null };
  } catch (err: any) {
    console.error('[AuthService] sendPhoneOtp error:', err.code, err.message);
    return { verificationId: null, error: mapAuthError(err.code) };
  }
}

/**
 * Verifies the 6-digit SMS code using the verificationId from sendPhoneOtp.
 * Returns the signed-in UserCredential on success.
 */
export async function confirmPhoneOtp(
  verificationId: string,
  code: string
): Promise<{ credential: UserCredential | null; error: string | null }> {
  try {
    const phoneCredential = PhoneAuthProvider.credential(verificationId, code);
    const result = await signInWithCredential(auth, phoneCredential);
    return { credential: result, error: null };
  } catch (err: any) {
    console.error('[AuthService] confirmPhoneOtp error:', err.code, err.message);
    return { credential: null, error: mapAuthError(err.code) };
  }
}

/** Maps Firebase error codes to human-readable messages. */
function mapAuthError(code: string): string {
  switch (code) {
    case 'auth/invalid-phone-number':
      return 'Invalid phone number. Use format +91XXXXXXXXXX.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again in a few minutes.';
    case 'auth/invalid-verification-code':
    case 'auth/code-expired':
      return 'Incorrect or expired code — try again.';
    case 'auth/session-expired':
      return 'Session expired. Please request a new code.';
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded. Please try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
