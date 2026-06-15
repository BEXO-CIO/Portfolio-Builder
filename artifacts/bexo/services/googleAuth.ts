/**
 * Google Sign-In via expo-auth-session + Firebase GoogleAuthProvider.
 *
 * HOW TO GET YOUR CLIENT ID:
 *   1. Firebase Console → mybexo → Authentication → Sign-in providers → Google → Enable
 *   2. Copy "Web SDK configuration" → Web client ID
 *   3. Replace GOOGLE_WEB_CLIENT_ID below with that value.
 *   4. Also add your Expo scheme to the authorized redirect URIs in Google Cloud Console.
 *
 * The redirect URI for Expo Go is: https://auth.expo.io/@<your-expo-username>/<slug>
 * For a bare build use: com.mybexo.app:/oauth2redirect/google
 */

import {
  makeRedirectUri,
  useAuthRequest,
  ResponseType,
} from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebase';

// Complete the web auth session so the in-app browser closes properly
WebBrowser.maybeCompleteAuthSession();

// ──────────────────────────────────────────────────────────────────────────────
// TODO: Replace with your real Web Client ID from Firebase Console
// Firebase Console → mybexo → Authentication → Sign-in providers → Google
// ──────────────────────────────────────────────────────────────────────────────
const GOOGLE_WEB_CLIENT_ID =
  '860803616355-REPLACE_WITH_YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';

const GOOGLE_IOS_CLIENT_ID =
  '860803616355-REPLACE_WITH_YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';

const GOOGLE_ANDROID_CLIENT_ID =
  '860803616355-REPLACE_WITH_YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';


// Export these so they can be used consistently across the app
export const GOOGLE_CLIENT_IDS = {
  web: '860803616355-fr9uc2gp3em7n9c99gqoccp2homoj09l.apps.googleusercontent.com',
  ios: '860803616355-fr9uc2gp3em7n9c99gqoccp2homoj09l.apps.googleusercontent.com',
  android: '860803616355-fr9uc2gp3em7n9c99gqoccp2homoj09l.apps.googleusercontent.com',
};

/**
 * Hook-based Google auth request builder.
 * Use this hook inside a component to get the `request` and `promptAsync`.
 */
export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_IDS.web,
    iosClientId: GOOGLE_CLIENT_IDS.ios,
    androidClientId: GOOGLE_CLIENT_IDS.android,
    redirectUri: makeRedirectUri({
      scheme: 'com.mybexo.app',
    }),
  });

  return { request, response, promptAsync };
}

/**
 * Given a Google ID token (from expo-auth-session response), sign in to Firebase.
 * Returns the Firebase UserCredential.
 */
export async function signInToFirebaseWithGoogle(
  idToken: string,
  accessToken?: string
): Promise<{ uid: string; email: string | null; displayName: string | null; photoURL: string | null; error: string | null }> {
  try {
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    const result = await signInWithCredential(auth, credential);
    const user = result.user;
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      error: null,
    };
  } catch (err: any) {
    console.error('[GoogleAuth] signInToFirebaseWithGoogle error:', err.code, err.message);
    return {
      uid: '',
      email: null,
      displayName: null,
      photoURL: null,
      error: mapGoogleAuthError(err.code),
    };
  }
}

function mapGoogleAuthError(code: string): string {
  switch (code) {
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    default:
      return 'Google sign-in failed. Please try again.';
  }
}
