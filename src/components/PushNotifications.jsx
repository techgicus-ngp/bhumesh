// Mounted once in App.jsx. For admin/employee users:
//  1) watches Firestore for plot-status changes and notifies (toast when the tab is visible, system notification otherwise)
//  2) optionally registers the device for FCM background push (needs the Cloud Function deployed)
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { enablePush, onForegroundPush, pushSupported, showLocalNotification } from '../services/pushService';
import { watchPlotStatus, describeChanges } from '../services/plotStatusWatcher';

const notifOk = typeof window !== 'undefined' && 'Notification' in window;
// Set VITE_DISABLE_LOCAL_WATCHER=true once the Cloud Function is deployed, to avoid duplicate notifications.
const LOCAL_WATCHER = String(import.meta.env.VITE_DISABLE_LOCAL_WATCHER || '') !== 'true';

export default function PushNotifications() {
  const { user } = useAuth();
  const toast = useToast();
  const [needsPrompt, setNeedsPrompt] = useState(false);
  const isStaff = ['employee', 'admin'].includes(user?.role); // guests excluded

  // Permission prompt + optional FCM registration
  useEffect(() => {
    if (!isStaff || !notifOk) { setNeedsPrompt(false); return; }
    if (Notification.permission === 'default') setNeedsPrompt(true);
    if (Notification.permission === 'granted') enablePush(user).catch((e) => console.warn('[push] FCM register skipped:', e?.message || e));
    let unsub = () => {};
    let alive = true;
    (async () => {
      if (!(await pushSupported())) return;
      const u = await onForegroundPush((payload) => {
        const n = payload.notification || {};
        toast(`${n.title || 'Plot update'}: ${n.body || ''}`, 'info');
      });
      if (alive) unsub = u; else u();
    })().catch(() => {});
    return () => { alive = false; unsub(); };
  }, [isStaff, user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // In-app Firestore watcher (works without any server)
  useEffect(() => {
    if (!isStaff || !LOCAL_WATCHER) return undefined;
    return watchPlotStatus(({ mapId, mapName, changes }) => {
      const { title, body } = describeChanges(mapName, changes);
      if (document.visibilityState === 'visible' && document.hasFocus()) toast(`${title}: ${body}`, 'info');
      else showLocalNotification(title, body, `/maps/${mapId}`, `plot-${mapId}`);
    });
  }, [isStaff, user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isStaff || !needsPrompt) return null;
  return (
    <div className="push-banner">
      <span>Get notified when a plot becomes Available / Booked / Sold.</span>
      <button
        onClick={async () => {
          const res = await Notification.requestPermission();
          setNeedsPrompt(false);
          if (res === 'granted') {
            enablePush(user).catch((e) => console.warn('[push] FCM register skipped:', e?.message || e));
            toast('Notifications enabled', 'success');
          } else {
            toast('Notifications not enabled', 'error');
          }
        }}
      >Enable</button>
      <button className="push-banner__x" onClick={() => setNeedsPrompt(false)} aria-label="Dismiss">✕</button>
    </div>
  );
}
