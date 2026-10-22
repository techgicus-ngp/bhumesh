// services/auth_service.dart — Firestore only (no firebase_auth), same as the Flutter app
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where, limit, onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { userFromMap, userToMap, isAdmin, isGuest } from '../models/user';

const SESSION_KEY = 'session_user';
let currentUser = null;
export const getCurrentUser = () => currentUser;

// ─── Local session persistence (localStorage replaces shared_preferences) ───
const saveSession = (user) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ ...userToMap(user), password: '' })); // never persist password
};
const loadCachedSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return userFromMap(map, map.uid ?? '');
  } catch {
    return null;
  }
};
export const clearSession = () => localStorage.removeItem(SESSION_KEY);

/** Re-validates cached session against Firestore; falls back to cache if offline. */
export async function restoreSession() {
  const cached = loadCachedSession();
  if (!cached) return null;
  try {
    const snap = await getDoc(doc(db, 'users', cached.uid));
    if (!snap.exists()) { clearSession(); return null; }
    const fresh = userFromMap(snap.data(), snap.id);
    if (!isAdmin(fresh) && !isGuest(fresh) && !fresh.isAccessGranted) { clearSession(); return null; }
    currentUser = fresh;
    saveSession(fresh);
    return fresh;
  } catch {
    currentUser = cached;
    return cached;
  }
}

// ─── Admin & Guest bootstrap ────────────────────────────────────────────────
async function ensureAccount({ email, password, name, role }) {
  const snap = await getDocs(query(collection(db, 'users'), where('email', '==', email), limit(1)));
  if (snap.empty) {
    const ref = doc(collection(db, 'users'));
    await setDoc(ref, {
      uid: ref.id, email, password, name, groupName: '', role,
      createdDate: new Date().toISOString(), isAccessGranted: true,
    });
  }
}
export async function ensureAdminExists() {
  await ensureAccount({ email: 'admin@gmail.com', password: 'admin@1223', name: 'Admin', role: 'admin' });
  await ensureAccount({ email: 'location@gmail.com', password: 'location@pass', name: 'Guest', role: 'guest' });
}

// ─── Sign in / out ──────────────────────────────────────────────────────────
export async function signIn(email, password) {
  const snap = await getDocs(query(
    collection(db, 'users'),
    where('email', '==', email.trim()),
    where('password', '==', password.trim()),
    limit(1),
  ));
  if (snap.empty) throw new Error('Invalid email or password.');
  const user = userFromMap(snap.docs[0].data(), snap.docs[0].id);
  if (!isAdmin(user) && !isGuest(user) && !user.isAccessGranted) {
    throw new Error('Access not granted. Please contact your administrator.');
  }
  currentUser = user;
  saveSession(user);
  return user;
}

export async function signOut() {
  currentUser = null;
  clearSession();
}

// ─── Employees ──────────────────────────────────────────────────────────────
export async function registerEmployee({ email, name, password }) {
  const existing = await getDocs(query(collection(db, 'users'), where('email', '==', email.trim()), limit(1)));
  if (!existing.empty) throw new Error('Email already registered.');
  const ref = doc(collection(db, 'users'));
  const user = {
    uid: ref.id, email: email.trim(), name: name.trim(), password: password.trim(),
    role: 'employee', createdDate: new Date(), isAccessGranted: false, assignedSiteIds: [],
  };
  await setDoc(ref, userToMap(user));
  return user;
}

export const setEmployeeAccess = (uid, granted) => updateDoc(doc(db, 'users', uid), { isAccessGranted: granted });
export const deleteEmployee = (uid) => deleteDoc(doc(db, 'users', uid));

export function getEmployees(cb, onError) {
  return onSnapshot(
    query(collection(db, 'users'), where('role', '==', 'employee')),
    (snap) => cb(snap.docs.map((d) => userFromMap(d.data(), d.id))),
    onError,
  );
}
