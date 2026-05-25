// File: src/utils/storage.ts
// Purpose: AsyncStorage helper functions for persistent data

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: '@land_portal:token',
  USER: '@land_portal:user',
  LANGUAGE: '@land_portal:language',
  THEME: '@land_portal:theme',
};

// Save token
export const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
  } catch (error) {
    console.error('Failed to save token:', error);
    throw error;
  }
};

// Get token
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Failed to get token:', error);
    return null;
  }
};

// Remove token (logout)
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Failed to remove token:', error);
    throw error;
  }
};

// Save user data
export const saveUser = async (user: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user:', error);
    throw error;
  }
};

// Get user data
export const getUser = async (): Promise<any | null> => {
  try {
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
};

// Remove user data
export const removeUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Failed to remove user:', error);
    throw error;
  }
};

// Clear all auth data (full logout)
export const clearAuth = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
    ]);
  } catch (error) {
    console.error('Failed to clear auth:', error);
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getToken();
    return !!token;
  } catch (error) {
    console.error('Failed to check auth:', error);
    return false;
  }
};