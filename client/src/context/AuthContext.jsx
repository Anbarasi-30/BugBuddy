/**
 * Auth Context
 * 
 * Provides authentication state (user, token) to the entire app.
 * Handles login, OTP verification, registration, logout, and Google OAuth callback.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true while restoring session

  // ---------------------------------------------------------------------------
  // Fetch user profile using a token (used after Google OAuth)
  // ---------------------------------------------------------------------------
  const handleTokenLogin = useCallback(async (newToken) => {
    try {
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      const userData = res.data;
      localStorage.setItem('bb_token', newToken);
      localStorage.setItem('bb_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
    } catch {
      // Token invalid — clear corrupted session
      localStorage.removeItem('bb_token');
      localStorage.removeItem('bb_user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Restore session from localStorage on first load
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const storedToken = localStorage.getItem('bb_token');
    const storedUser = localStorage.getItem('bb_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        // Corrupted storage — clear it
        localStorage.removeItem('bb_token');
        localStorage.removeItem('bb_user');
      }
    }

    // Handle Google OAuth callback — token comes in the URL hash
    const hash = window.location.hash;
    if (hash && hash.includes('token=')) {
      const urlToken = hash.split('token=')[1];
      if (urlToken) {
        handleTokenLogin(urlToken);
        // Clean the token from the URL
        window.history.replaceState(null, '', window.location.pathname);
        return;
      }
    }

    setLoading(false);
  }, [handleTokenLogin]);

  // ---------------------------------------------------------------------------
  // Login with email/password
  // ---------------------------------------------------------------------------
  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('bb_token', newToken);
    localStorage.setItem('bb_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  // ---------------------------------------------------------------------------
  // Register a new account (Triggers OTP email)
  // ---------------------------------------------------------------------------
  const register = useCallback(async (name, email, password, confirmPassword) => {
    const res = await api.post('/auth/register', { name, email, password, confirmPassword });
    return res.data; // returns { requireOtp: true, email, message }
  }, []);

  // ---------------------------------------------------------------------------
  // Verify 6-digit OTP
  // ---------------------------------------------------------------------------
  const verifyOtp = useCallback(async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    const { token: newToken, user: userData } = res.data;
    if (newToken && userData) {
      localStorage.setItem('bb_token', newToken);
      localStorage.setItem('bb_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
    }
    return res.data;
  }, []);

  // ---------------------------------------------------------------------------
  // Resend 6-digit OTP
  // ---------------------------------------------------------------------------
  const resendOtp = useCallback(async (email) => {
    const res = await api.post('/auth/resend-otp', { email });
    return res.data;
  }, []);

  // ---------------------------------------------------------------------------
  // Logout — clear everything
  // ---------------------------------------------------------------------------
  const logout = useCallback(() => {
    localStorage.removeItem('bb_token');
    localStorage.removeItem('bb_user');
    setToken(null);
    setUser(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Update local user state
  // ---------------------------------------------------------------------------
  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('bb_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — components call useAuth() to access auth state
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
