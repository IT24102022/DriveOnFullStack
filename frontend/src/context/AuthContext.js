import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token    = await SecureStore.getItemAsync('token');
        const userType = await SecureStore.getItemAsync('userType');
        const userId   = await SecureStore.getItemAsync('userId');
        if (token && userType && userId) {
          let endpoint = '/auth/profile';
          if (userType === 'student')    endpoint = `/students/${userId}`;
          if (userType === 'instructor') endpoint = `/instructors/${userId}`;
          const { data } = await api.get(endpoint);
          setUser({ ...data, role: userType });
        }
      } catch {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('userType');
        await SecureStore.deleteItemAsync('userId');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    let data = null;
    let role = null;

    try {
      const res = await api.post('/auth/login', { email, password });
      data = res.data;
      role = data.role || 'admin';
    } catch (error) {
      // Silently handle admin login failure
    }

    if (!data) {
      try {
        const res = await api.post('/students/login', { email, password });
        data = res.data;
        role = 'student';
      } catch (error) {
        // Silently handle student login failure
      }
    }

    if (!data) {
      try {
        const res = await api.post('/instructors/login', { email, password });
        data = res.data;
        role = 'instructor';
      } catch (error) {
        // Silently handle instructor login failure
      }
    }

    if (!data) throw new Error('Invalid email or password');

    await SecureStore.setItemAsync('token',    data.token);
    await SecureStore.setItemAsync('userType', role);
    await SecureStore.setItemAsync('userId',   String(data._id));

    const userData = { ...data, role };
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('userType');
    await SecureStore.deleteItemAsync('userId');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
