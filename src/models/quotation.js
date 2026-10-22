// models/quotation_model.dart
import { Timestamp } from 'firebase/firestore';
import { toDate } from '../utils/format';

export const payByDaysDate = (q) => {
  const d = new Date(q.quotationDate);
  d.setDate(d.getDate() + q.payDaysDuration);
  return d;
};

export const payByMonthsDate = (q) => {
  const d = q.quotationDate;
  return new Date(d.getFullYear(), d.getMonth() + q.payMonthsDuration, d.getDate());
};

export function quotationToMap(q) {
  const { id, ...rest } = q;
  return {
    ...rest,
    quotationDate: Timestamp.fromDate(q.quotationDate),
    paymentDate: q.paymentDate ? Timestamp.fromDate(q.paymentDate) : null,
  };
}

const num = (v, fb = 0) => {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : fb;
};
const int = (v, fb = 0) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fb;
};

export function quotationFromMap(m, id) {
  return {
    id,
    customerName: m.customerName ?? '',
    mobileNumber: m.mobileNumber ?? '',
    address: m.address ?? '',
    projectName: m.projectName ?? '',
    plotNumber: m.plotNumber ?? '',
    khNo: m.khNo ?? '',
    plotSize: num(m.plotSize),
    ratePerSqFt: num(m.ratePerSqFt),
    totalPlotAmount: num(m.totalPlotAmount),
    bookingAmount: num(m.bookingAmount),
    downPayment: num(m.downPayment),
    loanAmount: num(m.loanAmount),
    stampDutyPercent: num(m.stampDutyPercent, 6),
    stampDutyAmount: num(m.stampDutyAmount),
    registrationPercent: num(m.registrationPercent),
    registrationAmount: num(m.registrationAmount),
    dsc: num(m.dsc),
    legalFees: num(m.legalFees),
    maintenance: num(m.maintenance),
    adminTotal: num(m.adminTotal),
    corpusFund: num(m.corpusFund),
    finalTotalAmount: num(m.finalTotalAmount),
    quotationDate: toDate(m.quotationDate) ?? new Date(),
    payDaysDuration: int(m.payDaysDuration, 30),
    payMonthsDuration: int(m.payMonthsDuration, 1),
    createdByUid: m.createdByUid ?? '',
    createdByName: m.createdByName ?? '',
    siteId: m.siteId ?? '',
    status: m.status ?? 'quotation',
    paymentDate: m.paymentDate instanceof Timestamp ? m.paymentDate.toDate() : null,
  };
}
