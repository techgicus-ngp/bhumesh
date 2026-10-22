// models/user_model.dart
export const isAdmin = (u) => u?.role === 'admin';
export const isGuest = (u) => u?.role === 'guest';
export const isAccountant = (u) => u?.role === 'accountant';

export function userToMap(u) {
  return {
    uid: u.uid,
    email: u.email,
    name: u.name,
    password: u.password,
    role: u.role,
    createdDate: new Date(u.createdDate).toISOString(),
    isAccessGranted: u.isAccessGranted,
    assignedSiteIds: u.assignedSiteIds,
  };
}

export function userFromMap(data, uid) {
  const d = data.createdDate ? new Date(data.createdDate) : new Date();
  return {
    uid,
    email: data.email ?? '',
    name: data.name ?? '',
    password: data.password ?? '',
    role: data.role ?? 'employee',
    createdDate: isNaN(d) ? new Date() : d,
    isAccessGranted: data.isAccessGranted ?? false,
    assignedSiteIds: Array.isArray(data.assignedSiteIds) ? [...data.assignedSiteIds] : [],
  };
}
