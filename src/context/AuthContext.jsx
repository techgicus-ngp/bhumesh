// Replaces main.dart's sessionNotifier (ValueNotifier<UserModel?>) + AuthWrapper restore logic
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as auth from '../services/authService';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    (async () => {
      try { await auth.ensureAdminExists(); } catch (e) { console.warn('ensureAdminExists failed', e); }
      setUser(await auth.restoreSession());
      setRestoring(false);
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await auth.signIn(email, password);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await auth.signOut();
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, restoring, login, logout }}>{children}</AuthContext.Provider>;
}
