import { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('jm_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (accessKey) => {
    const { data } = await api.post('/auth/login', { accessKey });
    setUser(data);
    localStorage.setItem('jm_user', JSON.stringify(data));
    return data;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('jm_user');
  }, []);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get(`/auth/me/${user.id}`);
      setUser(data);
      localStorage.setItem('jm_user', JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
