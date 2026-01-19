import { User, ChatSession, Message, RequestStatus } from '../types';

const API_BASE_URL = '/v1/api';

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  // Try temp token first (for OTP verification), then permanent token
  const token = localStorage.getItem('temp_auth_token') || localStorage.getItem('pl_token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  console.log(`API Call: ${API_BASE_URL}${endpoint}`, {
    method: config.method || 'GET',
    headers: config.headers,
    body: config.body ? JSON.parse(config.body as string) : undefined
  });

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  console.log(`API Response: ${endpoint}`, {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error(`API Error: ${endpoint}`, error);
    throw new Error(error.message || error.detail || `HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  console.log(`API Success: ${endpoint}`, result);
  return result;
};

export const authService = {
  login: async (email: string, password: string) => {
    return apiCall('/users/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (data: { email: string; password: string; full_name: string; password2: string }) => {
    return apiCall('/users/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verifyOtp: async (otp: string) => {
    return apiCall('/users/register/activate/via-otp', {
      method: 'POST',
      body: JSON.stringify({ otp }),
    });
  },

  resendOtp: async () => {
    return apiCall('/users/register/activate/otp/resend/', {
      method: 'POST',
    });
  },

  logout: async () => {
    // Note: Your API doesn't have a logout endpoint, handle client-side
    localStorage.removeItem('pl_token');
    localStorage.removeItem('pl_user');
    localStorage.removeItem('temp_auth_token');
    return true;
  },

  refreshToken: async () => {
    return apiCall('/users/token/refresh/', {
      method: 'POST',
    });
  }
};

export const assistantService = {
  startSession: async () => {
    return apiCall('/assistant/session/', {
      method: 'POST',
    });
  },

  sendMessage: async (sessionId: string, message: string) => {
    return apiCall(`/assistant/session/${sessionId}/message/`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  getSessions: async () => {
    return apiCall('/assistant/session/', {
      method: 'GET',
    });
  },

  getSession: async (sessionId: string) => {
    return apiCall(`/assistant/session/${sessionId}/`, {
      method: 'GET',
    });
  },

  deleteSession: async (sessionId: string) => {
    return apiCall(`/assistant/session/${sessionId}/`, {
      method: 'DELETE',
    });
  }
};

export const accountService = {
  getProfile: async () => {
    return apiCall('/accounts/me/', {
      method: 'GET',
    });
  },

  updateProfile: async (data: any) => {
    return apiCall('/accounts/me/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteAccount: async () => {
    return apiCall('/accounts/me/', {
      method: 'DELETE',
    });
  },

  getAddress: async () => {
    return apiCall('/accounts/me/address/');
  },

  updateAddress: async (data: any) => {
    return apiCall('/accounts/me/address/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getApiKeys: async () => {
    return apiCall('/accounts/api-key/');
  },

  createApiKey: async (data: any) => {
    return apiCall('/accounts/api-key/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteApiKey: async (id: string) => {
    return apiCall(`/accounts/api-key/${id}/`, {
      method: 'DELETE',
    });
  }
};