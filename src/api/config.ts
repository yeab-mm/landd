// File: src/api/config.ts
// API configuration for backend connection

// ✅ Android emulator uses 10.0.2.2 for localhost
// ✅ Physical device uses your computer's IP
// ✅ iOS simulator can use localhost
const getApiBaseUrl = () => {
  // Using localhost with adb reverse for reliable USB-tethered debugging
  return 'http://localhost:3001/api';

  // Alternative (Wi-Fi local IP): 'http://10.46.46.11:3001/api'
};

export const API_URL = getApiBaseUrl();

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
    apiRequest('/requests/verification', { method: 'POST', body: JSON.stringify(requestData) }),
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
    }).then(res => res.json());
  },
};