import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user data on startup if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authAPI.getMe();
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Failed to verify token', err.message);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      if (res.success && res.token) {
        localStorage.setItem('token', res.token);
        setUser(res.user);
        return res;
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Signup handler
  const signup = async (name, email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await authAPI.signup(name, email, password);
      if (res.success && res.token) {
        localStorage.setItem('token', res.token);
        setUser(res.user);
        return res;
      } else {
        throw new Error(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin login handler
  const adminLogin = async (name, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await authAPI.adminLogin(name, password);
      if (res.success && res.token) {
        localStorage.setItem('token', res.token);
        setUser(res.user);
        return res;
      } else {
        throw new Error(res.message || 'Admin login failed');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin setup handler (first-time admin account creation)
  const adminSetup = async (name, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await authAPI.adminSetup(name, password);
      if (res.success && res.token) {
        localStorage.setItem('token', res.token);
        setUser(res.user);
        return res;
      } else {
        throw new Error(res.message || 'Admin setup failed');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Reload user profile from backend
  const reloadUser = async () => {
    try {
      const res = await authAPI.getMe();
      if (res.success && res.data) {
        setUser(res.data);
      }
    } catch (err) {
      console.error('Failed to reload user data', err);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    login,
    adminLogin,
    adminSetup,
    signup,
    logout,
    reloadUser,
    clearError,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
