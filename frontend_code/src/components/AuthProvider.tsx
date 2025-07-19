import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { auth } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextData } from '../hooks/useAuth';

interface User {
  id: number;
  fullName: string;
  email: string;
  avatar?: string;
  avatarColor?: string;
}

export const AuthContext = createContext<AuthContextData | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  useEffect(() => {
    checkAuth();
    checkBiometricSettings();
    loadStoredUser();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    }
  };

  const loadStoredUser = async () => {
    try {
      const storedUser = await SecureStore.getItemAsync('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBiometricSettings = async () => {
    const enabled = await SecureStore.getItemAsync('biometricEnabled');
    setIsBiometricEnabled(enabled === 'true');
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await auth.login(email, password);
      const userData = response.user;
      setUser(userData);
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
      await SecureStore.setItemAsync('credentials', JSON.stringify({ email, password }));
      await AsyncStorage.setItem('token', response.token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await auth.register(userData);
      const registeredUser = response.user;
      setUser(registeredUser);
      await SecureStore.setItemAsync('user', JSON.stringify(registeredUser));
      await AsyncStorage.setItem('token', response.token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
      setUser(null);
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('credentials');
      await AsyncStorage.removeItem('token');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateProfile = async (data: any) => {
    try {
      const response = await auth.updateProfile(data);
      const updatedUser = response.user;
      setUser(updatedUser);
      await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const enableBiometric = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        throw new Error('Biometric authentication is not available on this device');
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        throw new Error('No biometric enrollments found');
      }

      await SecureStore.setItemAsync('biometricEnabled', 'true');
      setIsBiometricEnabled(true);
    } catch (error) {
      console.error('Enable biometric error:', error);
      throw error;
    }
  };

  const disableBiometric = async () => {
    try {
      await SecureStore.deleteItemAsync('biometricEnabled');
      setIsBiometricEnabled(false);
    } catch (error) {
      console.error('Disable biometric error:', error);
      throw error;
    }
  };

  const loginWithBiometric = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to continue',
      });

      if (result.success) {
        const storedCredentials = await SecureStore.getItemAsync('credentials');
        if (storedCredentials) {
          const { email, password } = JSON.parse(storedCredentials);
          await login(email, password);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Biometric login error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        signIn: login,
        signOut: logout,
        register,
        updateProfile,
        isBiometricEnabled,
        enableBiometric,
        disableBiometric,
        loginWithBiometric,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 