import { User, ChatSession, Message, RequestStatus } from '../types';

const API_BASE_URL = '/v1/api'; // Restore base URL since endpoints should not include its

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  // For OTP verification endpoints, don't use any token
  const isOtpEndpoint = endpoint.includes('/users/register/activate/via-otp/') || 
                        endpoint.includes('/users/login/otp/verify/') ||
                        endpoint.includes('/users/register/activate/otp/resend/') ||
                        endpoint.includes('/users/login/otp/resend/') ||
                        endpoint.includes('/users/forget-password/otp/verify/') ||
                        endpoint.includes('/users/forget-password/otp/resend/');
  
// /v1/api/users

  // Get token from localStorage (not sessionStorage)
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
    body: config.body ? JSON.parse(config.body as string) : undefined,
    hasToken: !!token
  });

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle 401 Unauthorized (token expired)
    if (response.status === 401) {
      console.warn('401 Unauthorized - Token may be expired');
      // Clear authentication data
      localStorage.removeItem('pl_token');
      localStorage.removeItem('pl_user');
      localStorage.removeItem('temp_email');
      
      // Create custom error for token expiration
      const error = new Error('Token expired');
      (error as any).status = 401;
      (error as any).isTokenExpired = true;
      throw error;
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      (error as any).status = response.status;
      (error as any).response = { status: response.status, data: errorData };
      throw error;
    }

    const result = await response.json();
    console.log(`API Success: ${endpoint}`, result);
    return result;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
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

  verifyRegistrationOtp: async (email: string, otp: string) => {
    return apiCall('/users/register/activate/via-otp/', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  verifyLoginOtp: async (email: string, otp: string) => {
    return apiCall('/users/login/otp/verify/', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  resendRegistrationOtp: async (email: string) => {
    return apiCall('/users/register/activate/otp/resend/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resendLoginOtp: async (email: string) => {
    return apiCall('/users/login/otp/resend/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Forgot password methods
  forgotPassword: async (email: string) => {
    return apiCall('/users/forget-password/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  verifyForgotPasswordOtp: async (email: string, otp: string) => {
    return apiCall('/users/forget-password/otp/verify/', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  resetPassword: async (email: string, newPassword: string) => {
    return apiCall('/users/forget-password/confirm/', {
      method: 'POST',
      body: JSON.stringify({ email, new_password: newPassword }),
    });
  },

  resendForgotPasswordOtp: async (email: string) => {
    return apiCall('/users/forget-password/otp/resend/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  logout: async () => {
    // Note: Your API doesn't have a logout endpoint, handle client-side
    localStorage.removeItem('pl_token');
    localStorage.removeItem('pl_user');
    localStorage.removeItem('temp_auth_token');
    localStorage.removeItem('temp_email');
    return true;
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string) => {
    return apiCall('/users/change-password/', {
      method: 'POST',
      body: JSON.stringify({ 
        old_password: oldPassword, 
        new_password: newPassword,
        confirm_password: newPassword 
      }),
    });
  },

  // Token management
  refreshToken: async () => {
    return apiCall('/users/token/refresh/', {
      method: 'POST',
    });
  },

  verifyToken: async (token: string) => {
    return apiCall('/users/token/verify/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }
};

export const assistantService = {
  startSession: async () => {
    return apiCall('/assistant/sessions/', {
      method: 'POST',
      body: JSON.stringify({ title: 'New Consultation' }),
    });
  },

  createSession: async (title: string) => {
    return apiCall('/assistant/sessions/', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  sendMessage: async (sessionId: string, message: string) => {
    return apiCall('/assistant/chat/', {
      method: 'POST',
      body: JSON.stringify({
        session: sessionId,
        message: message,
      }),
    });
  },

  sendMessageWithEngine: async (message: string, sessionId: string, responseEngine: number, responseStyle: string) => {
    return apiCall('/assistant/chat/', {
      method: 'POST',
      body: JSON.stringify({
        session: sessionId,
        message: message,
        response_engine: responseEngine,
        response_style: responseStyle,
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
    return apiCall(`/assistant/chat/${messageId}/`);
  },

  deleteSession: async (sessionId: string) => {
    return apiCall(`/assistant/sessions/${sessionId}/`, {
      method: 'DELETE',
    });
  }
};

export const accountService = {
  getProfile: async () => {
    return apiCall('/accounts/me/');
  },

  updateProfile: async (data: any) => {
    return apiCall('/accounts/me/', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patchProfile: async (data: any) => {
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