/**
 * firestoreService.ts
 * Centralised Firestore operations for Bexo.
 * All reads/writes go through here — keeping stores clean.
 *
 * Collections:
 *   users/{uid}                    — user profile & settings
 *   users/{uid}/education/{id}     — education entries
 *   users/{uid}/experiences/{id}   — work experience entries
 *   users/{uid}/projects/{id}      — project entries
 *   users/{uid}/skills/{id}        — skill entries
 *   users/{uid}/research/{id}      — research entries
 *   portfolios/{uid}               — public portfolio mirror (written by Cloud Function)
 */

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  Unsubscribe,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

// ── User Profile ────────────────────────────────────────────────────────────

export async function upsertUser(uid: string, data: Record<string, any>) {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getUserProfile(uid: string): Promise<DocumentData | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateUserFields(uid: string, fields: Record<string, any>) {
  await updateDoc(doc(db, 'users', uid), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}

/** Real-time listener for the user's profile document */
export function subscribeToProfile(
  uid: string,
  onData: (data: DocumentData | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    onData(snap.exists() ? snap.data() : null);
  }, (err) => {
    console.warn('[Firestore] subscribeToProfile error:', err);
  });
}

// ── Handle Uniqueness ────────────────────────────────────────────────────────

const RESERVED_HANDLES = ['admin', 'bexo', 'team', 'support', 'help', 'api', 'www', 'app'];

export async function checkHandleAvailable(handle: string, currentUid?: string): Promise<boolean> {
  if (RESERVED_HANDLES.includes(handle.toLowerCase())) return false;
  const snap = await getDocs(
    query(collection(db, 'users'), where('handle', '==', handle))
  );
  if (snap.empty) return true;
  // If only the current user has this handle, it's still "available" for them
  if (snap.size === 1 && currentUid && snap.docs[0].id === currentUid) return true;
  return false;
}

// ── Sub-collections (Education, Experience, Projects, Skills, Research) ──────

type SubCollection = 'education' | 'experiences' | 'projects' | 'skills' | 'research';

export async function addSubItem(
  uid: string,
  sub: SubCollection,
  id: string,
  data: Record<string, any>
) {
  await setDoc(doc(db, 'users', uid, sub, id), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateSubItem(
  uid: string,
  sub: SubCollection,
  id: string,
  data: Record<string, any>
) {
  await updateDoc(doc(db, 'users', uid, sub, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSubItem(uid: string, sub: SubCollection, id: string) {
  await deleteDoc(doc(db, 'users', uid, sub, id));
}

export async function getSubCollection(uid: string, sub: SubCollection): Promise<DocumentData[]> {
  const snap = await getDocs(collection(db, 'users', uid, sub));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Bulk-write all items of a sub-collection (used during onboarding after resume parse) */
export async function bulkWriteSubCollection(
  uid: string,
  sub: SubCollection,
  items: Array<{ id: string; [key: string]: any }>
) {
  const batch = writeBatch(db);
  for (const item of items) {
    const { id, ...rest } = item;
    batch.set(doc(db, 'users', uid, sub, id), {
      ...rest,
      updatedAt: serverTimestamp(),
    });
  }
  await batch.commit();
}

/** Real-time listener for a sub-collection */
export function subscribeToSubCollection(
  uid: string,
  sub: SubCollection,
  onData: (items: DocumentData[]) => void
): Unsubscribe {
  return onSnapshot(collection(db, 'users', uid, sub), (snap) => {
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.warn(`[Firestore] subscribeToSubCollection(${sub}) error:`, err);
  });
}

// ── Portfolio (public mirror) ─────────────────────────────────────────────────

/** Real-time listener on the public portfolio document */
export function subscribeToPortfolio(
  uid: string,
  onData: (data: DocumentData | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'portfolios', uid), (snap) => {
    onData(snap.exists() ? snap.data() : null);
  }, (err) => {
    console.warn('[Firestore] subscribeToPortfolio error:', err);
  });
}

export async function triggerPortfolioRebuild(uid: string) {
  await updateDoc(doc(db, 'portfolios', uid), {
    buildStatus: 'QUEUED',
    updatedAt: serverTimestamp(),
  });
}
