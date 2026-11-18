// Client-side watcher: notices plot status changes made by ANY tool (they all write to Firestore `maps/*`)
// while this app is open (tab can be in the background). No Cloud Function / Blaze plan needed.
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const norm = (s) => String(s ?? '').trim().toLowerCase();
const isPlot = (p) => (p.type ?? 'plot') === 'plot';
const keyOf = (p) => String(p.plotId ?? p.srNo ?? p.plotNo ?? '');
const labelOf = (p) => `Plot ${p.plotNo || p.srNo || p.plotId || '?'}`;
const snapshotOf = (plots) =>
  new Map((plots ?? []).filter(isPlot).map((p) => [keyOf(p), { status: p.status || 'Available', label: labelOf(p) }]));

/** Message text for a list of changes. */
export function describeChanges(mapName, changes) {
  const where = mapName || 'a layout';
  if (changes.length === 1) {
    const c = changes[0];
    return { title: 'Plot status updated', body: `${c.label} (${where}): ${c.from} → ${c.to}` };
  }
  return {
    title: `${changes.length} plots updated`,
    body: `${where}: ` + changes.slice(0, 3).map((c) => `${c.label} → ${c.to}`).join(', ')
      + (changes.length > 3 ? ` +${changes.length - 3} more` : ''),
  };
}

/**
 * onChange({ mapId, mapName, changes:[{label, from, to}] }) fires only for changes that happen AFTER the
 * first load, and not for edits made by this browser itself. Returns an unsubscribe function.
 */
export function watchPlotStatus(onChange) {
  const known = new Map(); // mapId -> Map(plotKey -> {status,label})
  return onSnapshot(
    collection(db, 'maps'),
    (snap) => {
      snap.docChanges().forEach((ch) => {
        const id = ch.doc.id;
        const data = ch.doc.data();
        const next = snapshotOf(data.plots);
        const prev = known.get(id);
        known.set(id, next);
        if (ch.type !== 'modified' || !prev || ch.doc.metadata.hasPendingWrites) return;
        const changes = [];
        next.forEach((cur, k) => {
          const old = prev.get(k);
          if (old && norm(old.status) !== norm(cur.status)) changes.push({ label: cur.label, from: old.status, to: cur.status });
        });
        if (changes.length) onChange({ mapId: id, mapName: data.name, changes });
      });
    },
    (err) => console.warn('[plot-watch] listener error', err),
  );
}
