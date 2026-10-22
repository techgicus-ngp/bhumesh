// Replaces intl NumberFormat / DateFormat + string_extension.dart
export const toDate = (v) => {
  if (!v) return null;
  if (typeof v.toDate === 'function') return v.toDate(); // Firestore Timestamp
  const d = new Date(v);
  return isNaN(d) ? null : d;
};

const inr0 = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const fmtCurrency = (n) => inr0.format(Number(n) || 0);
export const fmtNum = (n, digits = 0) =>
  new Intl.NumberFormat('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Number(n) || 0);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const p2 = (n) => String(n).padStart(2, '0');
export const fmtDate = (d) => `${p2(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
export const fmtDateShort = (d) => `${p2(d.getDate())} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
export const fmtDateTime = (d) => {
  const h = d.getHours() % 12 || 12;
  return `${fmtDate(d)}, ${p2(h)}:${p2(d.getMinutes())} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
};
export const fmtMapDate = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

const CAP = { road: 'Road', open_space: 'Open Space', plot: 'Plot', standard: 'Standard', auto_fill: 'Auto Fill', circular: 'Circular', straight: 'Straight', curve: 'Curve' };
export const capitalize = (s) => {
  if (!s) return s;
  if (CAP[s]) return CAP[s];
  return s[0].toUpperCase() + s.slice(1).toLowerCase();
};

const HI = { 0: '०', 1: '१', 2: '२', 3: '३', 4: '४', 5: '५', 6: '६', 7: '७', 8: '८', 9: '९' };
export const toHindiNumber = (s) => String(s).replace(/[0-9]/g, (c) => HI[c]);
export const containsIgnoreCase = (a, b) => a.toLowerCase().includes(b.toLowerCase());
