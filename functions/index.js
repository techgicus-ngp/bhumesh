// Sends an FCM push to every logged-in employee device when a plot's status changes.
// Fires no matter WHO changed it (this app, the separate admin tool, the Firebase console, a script).
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { defineString } from 'firebase-functions/params';

initializeApp();
const db = getFirestore();

// Public URL of the Vercel site, e.g. https://your-app.vercel.app  (asked on first deploy)
const SITE_URL = defineString('SITE_URL');
const REGION = 'asia-south1'; // Mumbai — must match your Firestore region family for lowest latency

const norm = (s) => String(s ?? '').trim().toLowerCase();
const plotKey = (p) => String(p.plotId ?? p.srNo ?? p.plotNo ?? '');
const label = (p) => `Plot ${p.plotNo || p.srNo || p.plotId || '?'}`;
const isPlot = (p) => (p.type ?? 'plot') === 'plot';

/** Diff the embedded `plots` arrays of a map document. */
function diffEmbedded(before = [], after = []) {
  const old = new Map(before.filter(isPlot).map((p) => [plotKey(p), p]));
  const changes = [];
  for (const p of after.filter(isPlot)) {
    const o = old.get(plotKey(p));
    if (o && norm(o.status) !== norm(p.status)) {
      changes.push({ plot: label(p), from: o.status || 'Available', to: p.status || 'Available' });
    }
  }
  return changes;
}

async function notify(mapId, mapName, changes) {
  if (!changes.length) return;

  // Logged-in staff (employees + admin) = devices that registered a token and haven't logged out (token doc deleted on logout)
  const snap = await db.collection('fcmTokens').where('role', 'in', ['employee', 'admin']).get();
  const tokens = snap.docs.map((d) => d.id);
  if (!tokens.length) return;

  const where = mapName || 'a layout';
  const title = changes.length === 1 ? 'Plot status updated' : `${changes.length} plots updated`;
  const body = changes.length === 1
    ? `${changes[0].plot} (${where}): ${changes[0].from} → ${changes[0].to}`
    : `${where}: ` + changes.slice(0, 3).map((c) => `${c.plot} → ${c.to}`).join(', ')
      + (changes.length > 3 ? ` +${changes.length - 3} more` : '');
  const link = `${SITE_URL.value().replace(/\/$/, '')}/maps/${mapId}`;

  const dead = [];
  for (let i = 0; i < tokens.length; i += 500) {
    const batch = tokens.slice(i, i + 500);
    const res = await getMessaging().sendEachForMulticast({
      tokens: batch,
      notification: { title, body },
      data: { mapId, link },
      webpush: {
        notification: { icon: `${SITE_URL.value().replace(/\/$/, '')}/logo.png`, tag: `plot-${mapId}` },
        fcmOptions: { link },
      },
    });
    res.responses.forEach((r, idx) => {
      const code = r.error?.code;
      if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token') {
        dead.push(batch[idx]);
      }
    });
  }
  await Promise.all(dead.map((t) => db.collection('fcmTokens').doc(t).delete()));
}

// Case 1: plots stored inside the `maps/{mapId}` document (plots array)
export const onMapPlotsChanged = onDocumentUpdated({ document: 'maps/{mapId}', region: REGION }, async (event) => {
  const b = event.data.before.data();
  const a = event.data.after.data();
  const changes = diffEmbedded(b.plots, a.plots);
  await notify(event.params.mapId, a.name, changes);
});

// Case 2: plots stored as documents in `maps/{mapId}/plots/{plotId}`
export const onSubPlotChanged = onDocumentUpdated({ document: 'maps/{mapId}/plots/{plotId}', region: REGION }, async (event) => {
  const b = event.data.before.data();
  const a = event.data.after.data();
  if (!isPlot(a) || norm(b.status) === norm(a.status)) return;
  const map = await db.collection('maps').doc(event.params.mapId).get();
  await notify(event.params.mapId, map.data()?.name, [
    { plot: label(a), from: b.status || 'Available', to: a.status || 'Available' },
  ]);
});
