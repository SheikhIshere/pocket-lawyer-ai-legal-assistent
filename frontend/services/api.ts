// frontend/services/api.ts
import { User, ChatSession, Message, RequestStatus } from '../types';

const API_BASE_URL = '/v1/api'; // keep your base prefix

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  // OTP endpoints detection (same as your logic)
  const isOtpEndpoint = endpoint.includes('/users/register/activate/via-otp/') ||
    endpoint.includes('/users/login/otp/verify/') ||
    endpoint.includes('/users/register/activate/otp/resend/') ||
    endpoint.includes('/users/login/otp/resend/') ||
    endpoint.includes('/users/forget-password/otp/verify/') ||
    endpoint.includes('/users/forget-password/otp/resend/');

  // token
  const token = !isOtpEndpoint ? localStorage.getItem('pl_token') : null;

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
    body: config.body ? (() => {
      try { return JSON.parse(config.body as string); } catch { return config.body; }
    })() : undefined,
    hasToken: !!token
  });

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      console.warn('401 Unauthorized - Token may be expired');
      localStorage.removeItem('pl_token');
      localStorage.removeItem('pl_user');
      localStorage.removeItem('temp_email');
      const error = new Error('Token expired');
      (error as any).status = 401;
      (error as any).isTokenExpired = true;
      throw error;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      (error as any).status = response.status;
      (error as any).response = { status: response.status, data: errorData };
      throw error;
    }

    const result = await response.json().catch(() => ({}));
    console.log(`API Success: ${endpoint}`, result);
    return result;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export const authService = {
  login: async (email: string, password: string) => apiCall('/users/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: async (data: { email: string; password: string; full_name: string; password2: string }) => apiCall('/users/register/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  verifyRegistrationOtp: async (email: string, otp: string) => apiCall('/users/register/activate/via-otp/', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  }),
  verifyLoginOtp: async (email: string, otp: string) => apiCall('/users/login/otp/verify/', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  }),
  resendRegistrationOtp: async (email: string) => apiCall('/users/register/activate/otp/resend/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  resendLoginOtp: async (email: string) => apiCall('/users/login/otp/resend/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  forgotPassword: async (email: string) => apiCall('/users/forget-password/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  verifyForgotPasswordOtp: async (email: string, otp: string) => apiCall('/users/forget-password/otp/verify/', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  }),
  resetPassword: async (email: string, newPassword: string) => apiCall('/users/forget-password/confirm/', {
    method: 'POST',
    body: JSON.stringify({ email, new_password: newPassword }),
  }),
  resendForgotPasswordOtp: async (email: string) => apiCall('/users/forget-password/otp/resend/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  logout: async () => {
    localStorage.removeItem('pl_token');
    localStorage.removeItem('pl_user');
    localStorage.removeItem('temp_auth_token');
    localStorage.removeItem('temp_email');
    return true;
  },
  changePassword: async (oldPassword: string, newPassword: string) => apiCall('/users/change-password/', {
    method: 'POST',
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password: newPassword
    }),
  }),
  refreshToken: async () => apiCall('/users/token/refresh/', { method: 'POST' }),
  verifyToken: async (token: string) => apiCall('/users/token/verify/', {
    method: 'POST',
    body: JSON.stringify({ token }),
  }),
};

// --------- assistantService (matching demo endpoints) ----------
export const assistantService = {
  createSession: async (title: string) => {
    return apiCall('/assistant/sessions/', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  sendMessage: async (message: string, sessionId: string | null = null) => {
    if (!sessionId) {
      // Create new session first
      const session = await apiCall('/assistant/sessions/', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Chat' }),
      });
      sessionId = session.data?.id || session.id;
    }

    return apiCall('/assistant/requests/', {
      method: 'POST',
      body: JSON.stringify({
        message,
        session: sessionId
      }),
    });
  },

  getSessions: async () => {
    return apiCall('/assistant/sessions/');
  },

  getSession: async (sessionId: string) => {
    return apiCall(`/assistant/sessions/${sessionId}/`);
  },

  checkStatus: async (messageId: string) => {
    return apiCall(`/assistant/requests/${messageId}/`);
  },

  deleteSession: async (sessionId: string) => {
    return apiCall(`/assistant/sessions/${sessionId}/`, { method: 'DELETE' });
  }
};

// --------- accountService unchanged (kept for completeness) ----------
export const accountService = {
  getProfile: async () => apiCall('/accounts/me/'),
  updateProfile: async (data: any) => apiCall('/accounts/me/', { method: 'PUT', body: JSON.stringify(data) }),
  patchProfile: async (data: any) => apiCall('/accounts/me/', { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAccount: async () => apiCall('/accounts/me/', { method: 'DELETE' }),
  getAddress: async () => apiCall('/accounts/me/address/'),
  updateAddress: async (data: any) => apiCall('/accounts/me/address/', { method: 'PATCH', body: JSON.stringify(data) }),
  getApiKeys: async () => apiCall('/accounts/api-key/'),
  createApiKey: async (data: any) => apiCall('/accounts/api-key/', { method: 'POST', body: JSON.stringify(data) }),
  deleteApiKey: async (id: string) => apiCall(`/accounts/api-key/${id}/`, { method: 'DELETE' }),
  getDashboardStats: async () => {
    // Mock data for now - replace with actual API endpoint when available
    return {
      documents: 12,
      cases: 3,
      apiCalls: 1547,
      storageUsed: 512,
    };
  },
};

// --------- newsletterService ----------
export const newsletterService = {
  subscribe: async (email: string) => {
    return apiCall('/newsletter/submit/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }
};

export default assistantService;
