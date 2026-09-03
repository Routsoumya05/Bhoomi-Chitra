import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bhoomi_token');
    const storedUser = localStorage.getItem('bhoomi_user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('bhoomi_token');
        localStorage.removeItem('bhoomi_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success && res.token) {
      localStorage.setItem('bhoomi_token', res.token);
      localStorage.setItem('bhoomi_user', JSON.stringify(res.user));
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.error || 'Login failed');
  };

  const loginAsPublic = async () => {
    const res = await api.publicLogin();
    if (res.success && res.token) {
      localStorage.setItem('bhoomi_token', res.token);
      localStorage.setItem('bhoomi_user', JSON.stringify(res.user));
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.error || 'Public login failed');
  };

  const logout = () => {
    localStorage.removeItem('bhoomi_token');
    localStorage.removeItem('bhoomi_user');
    setUser(null);
  };

  const isPublicUser = !user || user.roleCode === 'PUBLIC_USER';
  const isAdminUser = !!user && user.roleCode !== 'PUBLIC_USER';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      loginAsPublic,
      logout,
      isPublicUser,
      isAdminUser,
      role: user?.roleCode || 'PUBLIC_USER'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
