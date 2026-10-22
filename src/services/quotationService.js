// services/quotation_service.dart — Streams become onSnapshot subscriptions (return the unsubscribe fn)
import {
  collection, doc, addDoc, getDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { quotationFromMap, quotationToMap } from '../models/quotation';

const col = () => collection(db, 'quotations');
const subscribe = (q, cb, onError) =>
  onSnapshot(q, (snap) => cb(snap.docs.map((d) => quotationFromMap(d.data(), d.id))), onError);

export async function createQuotation(q) {
  const ref = await addDoc(col(), quotationToMap(q));
  return ref.id;
}
export const updateQuotation = (id, q) => updateDoc(doc(db, 'quotations', id), quotationToMap(q));
export const deleteQuotation = (id) => deleteDoc(doc(db, 'quotations', id));

export const getAllQuotations = (cb, onError) =>
  subscribe(query(col(), orderBy('quotationDate', 'desc')), cb, onError);

export const getEmployeeQuotations = (uid, cb, onError) =>
  subscribe(query(col(), where('createdByUid', '==', uid), orderBy('quotationDate', 'desc')), cb, onError);

export function getQuotationsForSites(siteIds, cb, onError) {
  if (!siteIds.length) { cb([]); return () => {}; }
  // NOTE: Firestore `in` supports max 30 values (same limit as whereIn in Flutter)
  return subscribe(
    query(col(), where('siteId', 'in', siteIds), orderBy('quotationDate', 'desc')), cb, onError);
}

export const updateBookingStatus = (id, { status, paymentDate }) =>
  updateDoc(doc(db, 'quotations', id), {
    status,
    paymentDate: paymentDate ? Timestamp.fromDate(paymentDate) : null,
  });

export async function getQuotation(id) {
  const s = await getDoc(doc(db, 'quotations', id));
  return s.exists() ? quotationFromMap(s.data(), s.id) : null;
}
