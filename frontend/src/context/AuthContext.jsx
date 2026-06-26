import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem('cp_token') || null);
  const [loading, setLoading] = useState(true);
  const didInit = useRef(false);

  // On mount — verify stored token (runs once even in StrictMode)
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const verifyToken = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.data);
          connectSocket(res.data.data._id);
        } else logout();
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    verifyToken();

    return () => {
      // Cleanup on true unmount (not StrictMode re-mount)
    };
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: tk, data } = res.data;
      localStorage.setItem('cp_token', tk);
      setToken(tk);
      setUser(data);
      connectSocket(data._id);
      return data;
    }
    throw new Error(res.data.message);
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    if (res.data.success) {
      const { token: tk, data } = res.data;
      localStorage.setItem('cp_token', tk);
      setToken(tk);
      setUser(data);
      connectSocket(data._id);
      return data;
    }
    throw new Error(res.data.message);
  };

  const logout = () => {
    disconnectSocket();
    localStorage.removeItem('cp_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => setUser((prev) => ({ ...prev, ...updates }));

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
