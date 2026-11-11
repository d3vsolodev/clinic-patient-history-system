import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { setAccessToken, setOnUnauthorized } from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => clearSession());
  }, [clearSession]);

  // Attempt silent refresh on first load (httpOnly cookie may still be valid)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await authApi.refresh();
        setAccessToken(data.data.accessToken);
        const me = await authApi.me();
        setUser(me.data.data);
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    })();
  }, [clearSession]);

  const login = async (email, password) => {
    const { data } = await authApi.login(email, password);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    return user.permissions?.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
