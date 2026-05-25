// File: src/context/AuthContext.tsx
// Purpose: Manage auth state with proper OTP flow handling

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../api/config';

interface AuthState {
  token: string | null;
  user: any | null;
  isLoading: boolean;
  isOtpVerified: boolean;
  pendingPhone: string | null;
  hasSeenOnboarding: boolean;
}

interface AuthContextType extends AuthState {
  login: (identifier: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TOKEN: '@land_portal:token',
  USER: '@land_portal:user',
  OTP_VERIFIED: '@land_portal:otp_verified',
  PENDING_PHONE: '@land_portal:pending_phone',
  HAS_SEEN_ONBOARDING: '@land_portal:has_seen_onboarding',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);


  useEffect(() => {
    const loadAuthState = async () => {
      try {
        setIsLoading(true);
        
        // Clear auth persistence to force user login on every app startup
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.TOKEN,
          STORAGE_KEYS.USER,
          STORAGE_KEYS.OTP_VERIFIED,
        ]);
        
        const storedPendingPhone = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_PHONE);
        setPendingPhone(storedPendingPhone);
        
        const hasSeen = await AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING);
        setHasSeenOnboarding(hasSeen === 'true');
        
      } catch (error) {
        console.error('Failed to load auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);


  const register = async (userData: any) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_PHONE, userData.phone);
      await AsyncStorage.setItem(STORAGE_KEYS.OTP_VERIFIED, 'false');
      setPendingPhone(userData.phone);
      setIsOtpVerified(false);
      
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'OTP verification failed');
      }

      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, result.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.user));
      await AsyncStorage.setItem(STORAGE_KEYS.OTP_VERIFIED, 'true');
      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_PHONE);

      setToken(result.token);
      setUser(result.user);
      setIsOtpVerified(true);
      setPendingPhone(null);
      
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  };

  const login = async (identifier: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, result.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.user));
      await AsyncStorage.setItem(STORAGE_KEYS.OTP_VERIFIED, 'true');
      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_PHONE);

      setToken(result.token);
      setUser(result.user);
      setIsOtpVerified(true);
      setPendingPhone(null);
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.USER,
      STORAGE_KEYS.OTP_VERIFIED,
      STORAGE_KEYS.PENDING_PHONE,
    ]);
    setToken(null);
    setUser(null);
    setIsOtpVerified(false);
    setPendingPhone(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const result = await response.json();
      
      if (response.ok && result.user) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.user));
        setUser(result.user);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING, 'true');
      setHasSeenOnboarding(true);
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        isOtpVerified,
        pendingPhone,
        hasSeenOnboarding,
        login,
        register,
        verifyOtp,
        logout,
        refreshUser,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};