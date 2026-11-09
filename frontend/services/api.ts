import { User, ChatSession, Message, RequestStatus } from '../types';

const ENV_API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = ENV_API_URL
  ? `${ENV_API_URL.replace(/\/$/, '')}${ENV_API_URL.replace(/\/$/, '').endsWith('/v1/api') ? '' : '/v1/api'}`
  : '/v1/api';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
};

const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const isAuthEndpoint = endpoint.startsWith('/users/');
  const isOtpEndpoint = endpoint.includes('/otp/') || endpoint.includes('/activate/via-otp') || endpoint.includes('/forget-password/confirm');

  const token = localStorage.getItem('pl_access_token') || localStorage.getItem('pl_token');
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token && !isOtpEndpoint) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };


  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401 && !endpoint.includes('/users/login/') && !endpoint.includes('/users/token/refresh/')) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshResult = await authService.refreshToken();
          const newToken = refreshResult.access;
          
          localStorage.setItem('pl_access_token', newToken);
          isRefreshing = false;
          onTokenRefreshed(newToken);
        } catch (refreshError) {
          isRefreshing = false;
          console.error('Refresh token failed, logging out...');
          localStorage.removeItem('pl_access_token');
          localStorage.removeItem('pl_refresh_token');
          localStorage.removeItem('pl_user');
          // Optional: trigger a custom event for AuthContext to catch
          window.dispatchEvent(new Event('auth_session_expired'));
          throw refreshError;
        }
      }

      // Buffer requests while refreshing
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          const freshHeaders = {
            ...config.headers,
            'Authorization': `Bearer ${token}`
          };
          resolve(apiCall(endpoint, { ...config, headers: freshHeaders } as any));
        });
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response data:', errorData);
      const error = new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      (error as any).status = response.status;
      (error as any).response = { status: response.status, data: errorData };
      throw error;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API call failed:', error);
    console.error('API call error details:', {
      endpoint,
      method: options.method || 'GET',
      errorType: typeof error,
      errorMessage: error?.message,
      errorStack: error?.stack
    });
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

  resetPassword: async (email: string, newPassword: string, token?: string) => {
    return apiCall('/users/forget-password/confirm/', {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: JSON.stringify({
        email,
        new_password: newPassword,
        confirm_password: newPassword
      }),
    });
  },

  resendForgotPasswordOtp: async (email: string) => {
    return apiCall('/users/forget-password/otp/resend/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

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

  refreshToken: async () => {
    const refresh = localStorage.getItem('pl_refresh_token');
    if (!refresh) {
      console.warn('No refresh token found in localStorage');
      throw new Error('No refresh token available');
    }

    return apiCall('/users/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    });
  },

  verifyToken: async (token: string) => {
    return apiCall('/users/token/verify/', {
      method: 'POST',
      body: JSON.stringify({ token }),
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
  },

  getDashboardStats: async () => {
    return apiCall('/accounts/dashboard-stats/');
  },
};

export const assistantService = {
  getSessions: async (): Promise<ChatSession[]> => {
    return apiCall('/assistant/sessions/');
  },

  createSession: async (title?: string): Promise<ChatSession> => {
    const payload = title ? { title } : {};
    return apiCall('/assistant/sessions/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getSession: async (sessionId: string): Promise<ChatSession> => {
    const data = await apiCall(`/assistant/sessions/${sessionId}/`);

    // Parse messages if they are strings
    if (typeof data.messages === 'string') {
      try {
        data.messages = JSON.parse(data.messages);
      } catch (e) {
        console.error("Failed to parse messages JSON", e);
        data.messages = [];
      }
    }

    // Standardize messages to internal format
    if (Array.isArray(data.messages)) {
      const adaptedMessages: Message[] = [];
      data.messages.forEach((msg: any, idx: number) => {
        if (msg.message) {
          adaptedMessages.push({
            id: `${sessionId}-msg-${idx}-user`,
            content: msg.message,
            role: 'user',
            timestamp: new Date(msg.created_at).getTime(),
            status: 'completed',
            created_at: msg.created_at
          });
        }
        if (msg.response) {
          adaptedMessages.push({
            id: `${sessionId}-msg-${idx}-assistant`,
            content: msg.response,
            role: 'assistant',
            timestamp: new Date(msg.created_at).getTime(),
            status: 'completed',
            created_at: msg.created_at,
            sources: msg.sources || []
          });
        }
      });
      data.messages = adaptedMessages;
    }

    return data;
  },

  sendMessage: async (message: string, sessionId: string | null = null, responseEngine: number = 2, responseStyle: string = "supportive"): Promise<any> => {
    const payload = {
      message: message,
      response_engine: responseEngine,
      response_style: responseStyle,
    };

    if (sessionId) {
      return apiCall(`/assistant/sessions/${sessionId}/send/`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } else {
      // If no session, create a new session first
      return apiCall('/assistant/sessions/', {
        method: 'POST',
        body: JSON.stringify({ title: "New Chat" }),
      }).then(session => {
        // Then send message to new session
        return apiCall(`/assistant/sessions/${session.id}/send/`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      });
    }
  },

  checkStatus: async (messageId: string): Promise<any> => {
    return apiCall(`/assistant/requests/${messageId}/`);
  },

  pollForCompletion: async (requestId: string): Promise<void> => {
    const startTime = Date.now();
    const POLLING_INTERVAL_MS = 1000;
    const POLLING_TIMEOUT_MS = 60000;

    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          if (Date.now() - startTime > POLLING_TIMEOUT_MS) {
            console.error('Request timed out');
            reject(new Error('Request timed out'));
            return;
          }

          const data = await apiCall(`/assistant/requests/${requestId}/`);

          if (data.status?.toUpperCase() === 'COMPLETED') {
            resolve();
          } else if (data.status?.toUpperCase() === 'FAILED') {
            console.error('AI Request failed on server');
            reject(new Error('AI Request failed on server'));
          } else {
            // Still pending or running
            setTimeout(checkStatus, POLLING_INTERVAL_MS);
          }
        } catch (error) {
          console.error('Polling error:', error);
          reject(error);
        }
      };

      checkStatus();
    });
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    return apiCall(`/assistant/sessions/${sessionId}/`, {
      method: 'DELETE',
    });
  }
};

export const newsletterService = {
  subscribe: async (email: string) => {
    return apiCall('/newsletter/submit/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }
};

export const contactService = {
  submit: async (data: {
    full_name: string;
    email: string;
    service_type: string;
    other?: string;
    priority_level: string;
    subject: string;
    message: string;
  }) => {
    return apiCall('/contact-us/submit/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

export default {
  authService,
  accountService,
  assistantService,
  newsletterService,
  contactService
};


