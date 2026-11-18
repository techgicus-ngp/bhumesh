// Web push (FCM) for plot-status changes.
// Tokens are stored in Firestore `fcmTokens/{token}` so the Cloud Function can find logged-in employees.
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getMessaging, getToken, deleteToken, onMessage, isSupported } from 'firebase/messaging';
import { app, db } from '../firebase';

const TOKEN_KEY = 'fcm_token';
const env = import.meta.env;

const REQUIRED = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_APP_ID', 'VITE_FIREBASE_VAPID_KEY'];

export const pushSupported = async () => {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) return false;
  const missing = REQUIRED.filter((k) => !String(env[k] ?? '').trim());
  if (missing.length) {
    console.warn('[push] disabled — missing in .env (restart `npm run dev` after editing):', missing.join(', '));
    return false;
  }
  try { return await isSupported(); } catch { return false; }
};

async function registerSw() {
  const qs = new URLSearchParams({
    apiKey: env.VITE_FIREBASE_API_KEY || '',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: env.VITE_FIREBASE_APP_ID || '',
  });
  return navigator.serviceWorker.register(`/firebase-messaging-sw.js?${qs}`);
}

/** Ask permission (must be called from a click on iOS) and save the device token for this user. */
export async function enablePush(user, { askPermission = false } = {}) {
  if (!(await pushSupported())) return { ok: false, reason: 'unsupported' };
  if (Notification.permission === 'default' && askPermission) await Notification.requestPermission();
  if (Notification.permission !== 'granted') return { ok: false, reason: Notification.permission };

  const reg = await registerSw();
  const token = await getToken(getMessaging(app), {
    vapidKey: env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: reg,
  });
  if (!token) return { ok: false, reason: 'no-token' };

  await setDoc(doc(db, 'fcmTokens', token), {
    token,
    uid: user.uid,
    role: user.role,
    name: user.name,
    assignedSiteIds: user.assignedSiteIds ?? [],
    userAgent: navigator.userAgent.slice(0, 200),
    updatedAt: serverTimestamp(),
  });
  localStorage.setItem(TOKEN_KEY, token);
  return { ok: true, token };
}

/** Call on logout: stop pushes to this device for the departing user. */
export async function disablePush() {
  const token = localStorage.getItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  if (!token) return;
  try { await deleteDoc(doc(db, 'fcmTokens', token)); } catch (e) { console.warn('fcm token delete failed', e); }
  try { if (await pushSupported()) await deleteToken(getMessaging(app)); } catch { /* ignore */ }
}

/** Foreground messages (tab open) — returns an unsubscribe fn. */
export async function onForegroundPush(cb) {
  if (!(await pushSupported())) return () => {};
  return onMessage(getMessaging(app), cb);
}

/** System notification for a change seen by the in-app watcher (works with the tab in the background). */
export async function showLocalNotification(title, body, link = '/', tag = 'plot-status') {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;
  const opts = { body, icon: '/logo.png', tag, data: { link } };
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      const reg = regs.find((r) => (r.active?.scriptURL || '').includes('firebase-messaging-sw')) || regs[0];
      if (reg) { await reg.showNotification(title, opts); return; }
    }
  } catch { /* fall through */ }
  try {
    const n = new Notification(title, opts);
    n.onclick = () => { window.focus(); window.location.href = link; };
  } catch { /* unsupported */ }
}
