// services/site_visit_service.dart
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { siteVisitFromMap, siteVisitToMap } from '../models/siteVisit';

const col = () => collection(db, 'site_visits');
const subscribe = (q, cb, onError) =>
  onSnapshot(q, (snap) => cb(snap.docs.map((d) => siteVisitFromMap(d.data(), d.id))), onError);

export async function submitVisit(visit) {
  const ref = doc(col());
  const model = { ...visit, id: ref.id };
  await setDoc(ref, siteVisitToMap(model));
  return model;
}
export const getEmployeeVisits = (employeeId, cb, onError) =>
  subscribe(query(col(), where('employeeId', '==', employeeId), orderBy('visitDate', 'desc')), cb, onError);
export const getAllVisits = (cb, onError) => subscribe(query(col(), orderBy('visitDate', 'desc')), cb, onError);
export const deleteVisit = (id) => deleteDoc(doc(db, 'site_visits', id));
