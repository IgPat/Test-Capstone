import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('sms_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('sms_token') || null;
  });

  const login = (newToken, newUser) => {
    localStorage.setItem('sms_token', newToken);
    localStorage.setItem('sms_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('sms_token');
    localStorage.removeItem('sms_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    localStorage.setItem('sms_user', JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
