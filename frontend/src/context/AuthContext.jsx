import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Synchronize authentication updates across windows and on boot
  const loadUser = () => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();

    // Catch auto-logout triggers from API interceptors
    const handleAuthChange = () => {
      loadUser();
    };

    window.addEventListener('auth_change', handleAuthChange);
    return () => {
      window.removeEventListener('auth_change', handleAuthChange);
    };
  }, []);

  // Handle User Login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Handle User Signup
  const signup = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', { username, email, password });
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Handle User Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update Profile & Settings
  const updateProfile = async (username, avatar, settings) => {
    setError(null);
    try {
      const response = await api.put('/auth/profile', { username, avatar, settings });
      const updatedData = response.data;
      
      // Merge updated details back to localStorage
      localStorage.setItem('user', JSON.stringify(updatedData));
      setUser(updatedData);
      return updatedData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
