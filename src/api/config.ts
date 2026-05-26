// File: src/api/config.ts
// API configuration for backend connection

import { Platform } from 'react-native';
import Constants from 'expo-constants';

const API_PORT = 3001;

const extractHost = (uri: string): string | null => {
  const withoutScheme = uri.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
  const hostPort = withoutScheme.split('/')[0];
  const host = hostPort?.split(':')[0];
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return null;
  }
  return host;
};

/** Resolve dev machine IP from Expo / Metro (same host as exp://…:8081). */
const resolveMetroHost = (): string | null => {
  const candidates: (string | undefined)[] = [
    Constants.expoConfig?.hostUri,
    Constants.linkingUri,
    (Constants.expoGoConfig as { hostUri?: string } | null)?.hostUri,
    (Constants.expoGoConfig as { debuggerHost?: string } | null)?.debuggerHost,
  ];

  for (const uri of candidates) {
    if (!uri) continue;
    const host = extractHost(uri);
    if (host) return host;
  }
  return null;
};

const getDevApiHost = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    try {
      return new URL(envUrl).hostname;
    } catch {
      // fall through
    }
  }

  const metroHost = resolveMetroHost();
  if (metroHost) {
    return metroHost;
  }

  // Android emulator only — maps host loopback to the PC
  if (Platform.OS === 'android' && !Constants.isDevice) {
    return '10.0.2.2';
  }

  if (Platform.OS === 'ios' && !Constants.isDevice) {
    return 'localhost';
  }

  // Physical device: never use 10.0.2.2 (emulator-only)
  console.warn(
    '[API] Could not detect Metro host. Set EXPO_PUBLIC_API_URL in .env to http://<your-pc-ip>:3001/api'
  );
  return '10.46.46.11';
};

const getApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (envUrl) {
    return envUrl;
  }
  return `http://${getDevApiHost()}:${API_PORT}/api`;
};

export const API_URL = getApiBaseUrl();

if (__DEV__) {
  console.log('[API] Using base URL:', API_URL);
}

// Helper: Get auth token from storage
const getAuthToken = async (): Promise<string | null> => {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    return await AsyncStorage.default.getItem('@land_portal:token');
  } catch (error) {
    console.error('Failed to get token:', error);
    return null;
  }
};

// Helper: Make authenticated request
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = await getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
};

// Auth endpoints
export const authAPI = {
  register: async (userData: {
    fullName: string;
    email: string;
    phone: string;
    faydaId: string;
    password: string;
  }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: {
    identifier: string;
    password: string;
  }) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getProfile: async () => {
    return apiRequest('/user/me', { method: 'GET' });
  },
};

// User endpoints
export const userAPI = {
  getProfile: async () => apiRequest('/user/me', { method: 'GET' }),
  updateProfile: async (profileData: any) =>
    apiRequest('/user/me', { method: 'PUT', body: JSON.stringify(profileData) }),
};

// Land endpoints
export const landAPI = {
  getLands: async () => apiRequest('/lands', { method: 'GET' }),
  getLand: async (landId: string) => apiRequest(`/lands/${landId}`, { method: 'GET' }),
  createLand: async (landData: any) =>
    apiRequest('/lands', { method: 'POST', body: JSON.stringify(landData) }),
};

// Request endpoints
export const requestAPI = {
  getRequests: async () => apiRequest('/requests', { method: 'GET' }),
  createVerification: async (requestData: any) =>
    apiRequest('/requests/verification', {
      method: 'POST',
      body: JSON.stringify(requestData),
    }),
};

// Upload endpoint
export const uploadAPI = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file as any);

    const token = await getAuthToken();

    return fetch(`${API_URL}/uploads`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then((res) => res.json());
  },
};
