// models/plot_data.dart  (LatLng → {lat, lng})
export const SQM_TO_SQFT = 10.7639;

/** Allowed values for the RL Status dropdown (same as PlotData.rlStatusOptions in Flutter). */
export const RL_STATUS_OPTIONS = ['Pending', 'Approved'];

/** Any stored value (null, 'pending', 'APPROVED' …) → 'Pending' | 'Approved'. */
export const normalizeRlStatus = (v) =>
  String(v ?? '').trim().toLowerCase() === 'approved' ? 'Approved' : 'Pending';


export function plotFromDoc(data, id) {
  const areaSqM = Number(data.area) || 0;
  return {
    srNo: data.srNo ?? '',
    plotId: Number(data.plotId) || 0,
    plotNo: data.plotNo ?? '',
    title: data.title ?? '',
    corners: (data.corners ?? []).map((c) => ({ lat: Number(c.lat), lng: Number(c.lng) })),
    status: data.status ?? 'Available',
    area: areaSqM,
    areaSqFt: data.areaSqFt != null ? Number(data.areaSqFt) : areaSqM * SQM_TO_SQFT,
    dimensions: data.dimensions ?? '',
    center: { lat: Number(data.center?.lat) || 0, lng: Number(data.center?.lng) || 0 },
    ownerName: data.ownerName ?? '',
    contactPhone: data.contactPhone ?? '',
    contactEmail: data.contactEmail ?? '',
    createdDate: data.createdDate ? new Date(data.createdDate) : new Date(),
    notes: data.notes ?? '',
    type: data.type ?? 'plot',
    firestoreId: id ?? null,
    facing: data.facing ?? 'North',
    rlStatus: normalizeRlStatus(data.rlStatus),
  };
}

export function plotToMap(p) {
  return {
    srNo: p.srNo,
    plotId: p.plotId,
    plotNo: p.plotNo,
    title: p.title,
    corners: p.corners.map((c) => ({ lat: c.lat, lng: c.lng })),
    status: p.status,
    area: p.area,
    areaSqFt: p.areaSqFt,
    dimensions: p.dimensions,
    center: { lat: p.center.lat, lng: p.center.lng },
    ownerName: p.ownerName,
    contactPhone: p.contactPhone,
    contactEmail: p.contactEmail,
    createdDate: new Date(p.createdDate).toISOString(),
    notes: p.notes,
    type: p.type,
    facing: p.facing,
   rlStatus: normalizeRlStatus(p.rlStatus),
  };
}

export function plotColor(status) {
  switch ((status || '').toLowerCase()) {
    case 'booked': return '#FF6B6B';
    case 'sold': return '#FF8C42';
    case 'reserved': return '#FFC837';
    default: return '#90EE90';
  }
}

// Status colours used in the grid / detail sheet UI
export function statusColor(status) {
  switch ((status || '').toLowerCase()) {
    case 'available': return '#00B96B';
    case 'booked': return '#F59E0B';
    case 'sold': return '#EF4444';
    case 'reserved': return '#8B5CF6';
    default: return '#2563EB';
  }
}
