// Firestore access for the `maps` collection (inlined inside screens in the Flutter code)
import { collection, doc, getDocs, getDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { plotFromDoc, plotToMap } from '../models/plot';

export const toMapItem = (snap) => ({ id: snap.id, ...snap.data() });

/** Maps list; hides maps with isEnabled === false (same as Flutter) */
export async function loadEnabledMaps() {
  const snap = await getDocs(query(collection(db, 'maps'), orderBy('createdDate', 'desc')));
  return snap.docs.map(toMapItem).filter((m) => m.isEnabled !== false);
}
export async function getMap(id) {
  const s = await getDoc(doc(db, 'maps', id));
  return s.exists() ? toMapItem(s) : null;
}
export const deleteMap = (id) => deleteDoc(doc(db, 'maps', id));

/** Write the whole plots array + counters back (admin edit mode) */
export function updateMapPlots(mapId, plots, layoutBoundary) {
  return updateDoc(doc(db, 'maps', mapId), {
    plots: plots.map(plotToMap),
    layoutBoundary: layoutBoundary.map((p) => ({ lat: p.lat, lng: p.lng })),
    totalPlots: plots.filter((p) => p.type === 'plot').length,
    totalRoads: plots.filter((p) => p.type === 'road').length,
    totalOpenSpaces: plots.filter((p) => p.type === 'open_space').length,
  });
}

/** Plot lookup used by the quotation screen: searches every map's `plots` subcollection, then embedded `plots` array */
export async function findPlot(q) {
  const needle = q.trim().toLowerCase();
  const maps = await getDocs(collection(db, 'maps'));
  for (const m of maps.docs) {
    const data = m.data();
    const mapName = (data.name || '').trim() || m.id;
    const sub = await getDocs(collection(db, 'maps', m.id, 'plots'));
    for (const p of sub.docs) {
      const d = p.data();
      if (String(d.plotNo ?? '').toLowerCase() === needle || String(d.srNo ?? '').toLowerCase() === needle) {
        return { plot: plotFromDoc(d, p.id), mapId: m.id, mapName };
      }
    }
    for (const d of data.plots ?? []) {
      if (String(d.plotNo ?? '').toLowerCase() === needle) {
        return { plot: plotFromDoc(d), mapId: m.id, mapName };
      }
    }
  }
  return null;
}
