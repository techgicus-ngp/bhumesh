// models/site_visit_model.dart
import { toDate } from '../utils/format';

export function siteVisitToMap(v) {
  return {
    id: v.id,
    employeeId: v.employeeId,
    employeeName: v.employeeName,
    customerName: v.customerName,
    customerPhone: v.customerPhone,
    projectInterest: v.projectInterest,
    plotNumber: v.plotNumber,
    remarks: v.remarks,
    selfieBase64: v.selfieBase64,
    latitude: v.latitude,
    longitude: v.longitude,
    locationAddress: v.locationAddress,
    visitDate: v.visitDate.toISOString(),
  };
}

export function siteVisitFromMap(m, id) {
  return {
    id,
    employeeId: m.employeeId ?? '',
    employeeName: m.employeeName ?? '',
    customerName: m.customerName ?? '',
    customerPhone: m.customerPhone ?? '',
    projectInterest: m.projectInterest ?? '',
    plotNumber: m.plotNumber ?? '',
    remarks: m.remarks ?? '',
    selfieBase64: m.selfieBase64 ?? '',
    latitude: Number(m.latitude) || 0,
    longitude: Number(m.longitude) || 0,
    locationAddress: m.locationAddress ?? '',
    visitDate: toDate(m.visitDate) ?? new Date(),
  };
}
