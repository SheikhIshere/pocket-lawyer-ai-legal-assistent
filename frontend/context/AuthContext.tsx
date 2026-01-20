import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  verifyRegistrationOtp: (email: string, otp: string) => Promise<void>;
  verifyLoginOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  tempEmail: string | null;
  isRegistration: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

import { authService, accountService } from '../services/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState & { isInitializing?: boolean }>({
    user: null,
    isAuthenticated: false,
    requiresOtp: false,
    token: null,
    isInitializing: true // Start with initializing state
  });

  const [tempEmail, setTempEmail] = useState<string | null>(null);
  const [isRegistration, setIsRegistration] = useState<boolean>(false);

  // Initialize tempEmail from localStorage on mount
  useEffect(() => {
    const storedTempEmail = localStorage.getItem('temp_email');
    if (storedTempEmail) {
      setTempEmail(storedTempEmail);
    }
  }, []);

  // Check local storage on load and validate token
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('pl_token');
      const storedUser = localStorage.getItem('pl_user');
      const storedTempEmail = localStorage.getItem('temp_email');
      const storedIsRegistration = localStorage.getItem('is_registration');
      const storedIsForgotPassword = localStorage.getItem('is_forgot_password');

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b5466ef-e4ad-485a-98f1-d363bc9e423a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'pre-fix',
          hypothesisId: 'H1',
          location: 'AuthContext.tsx:initializeAuth:start',
          message: 'initializeAuth starting with stored values',
          data: {
            hasStoredToken: !!storedToken,
            hasStoredUser: !!storedUser,
            hasTempEmail: !!storedTempEmail,
            isRegistrationFlag: storedIsRegistration === 'true',
            isForgotPasswordFlag: storedIsForgotPassword === 'true'
          },
          timestamp: Date.now()
        })
      }).catch(() => {});
      // #endregion agent log
      
      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          
          // Set initial state immediately for better UX
          setState({
            user: userData,
            isAuthenticated: true,
            requiresOtp: false,
            token: storedToken,
            isInitializing: false // Done initializing
          });

          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b5466ef-e4ad-485a-98f1-d363bc9e423a', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: 'debug-session',
              runId: 'pre-fix',
              hypothesisId: 'H2',
              location: 'AuthContext.tsx:initializeAuth:token-branch',
              message: 'Auth initialized from stored token/user',
              data: {
                isAuthenticated: true,
                requiresOtp: false
              },
              timestamp: Date.now()
            })
          }).catch(() => {});
          // #endregion agent log
          
          // Validate token by making a simple API call
          try {
            await accountService.getProfile();
            console.log('Token validation successful');
          } catch (error: any) {
            console.error('Token validation failed:', error);
            
            // Check if it's a 401 Unauthorized error (token expired)
            if (error?.status === 401 || error?.response?.status === 401) {
              console.log('Token expired, clearing authentication');
              // Clear invalid token
              localStorage.removeItem('pl_token');
              localStorage.removeItem('pl_user');
              localStorage.removeItem('temp_email');
              
              setState({
                user: null,
                isAuthenticated: false,
                requiresOtp: false,
                token: null,
                isInitializing: false // Done initializing
              });
            } else {
              // For other errors, keep user logged in but show error
              console.warn('API error during token validation, but keeping user logged in');
            }
          }
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Clear invalid data
          localStorage.removeItem('pl_token');
          localStorage.removeItem('pl_user');
          localStorage.removeItem('temp_email');
          
          setState({
            user: null,
            isAuthenticated: false,
            requiresOtp: false,
            token: null,
            isInitializing: false // Done initializing
          });
        }
      } else {
        // Check for temp email and redirect to OTP if exists
        const tempEmail = localStorage.getItem('temp_email');
        if (tempEmail) {
          setState(prev => ({ 
            ...prev, 
            requiresOtp: true,
            tempEmail,
            isRegistration: false,
            isInitializing: false // Done initializing
          }));

          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b5466ef-e4ad-485a-98f1-d363bc9e423a', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: 'debug-session',
              runId: 'pre-fix',
              hypothesisId: 'H3',
              location: 'AuthContext.tsx:initializeAuth:temp-email-branch',
              message: 'Auth initialized in OTP-required state due to temp_email',
              data: {
                hasTempEmail: true,
                isRegistrationFlag: localStorage.getItem('is_registration') === 'true',
                isForgotPasswordFlag: localStorage.getItem('is_forgot_password') === 'true'
              },
              timestamp: Date.now()
            })
          }).catch(() => {});
          // #endregion agent log
        } else {
          // Clear any stale OTP flags if no temp email
          localStorage.removeItem('is_registration');
          localStorage.removeItem('is_forgot_password');
          setState(prev => ({
            ...prev,
            requiresOtp: false,
            isInitializing: false // Done initializing
          }));

          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b5466ef-e4ad-485a-98f1-d363bc9e423a', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: 'debug-session',
              runId: 'pre-fix',
              hypothesisId: 'H4',
              location: 'AuthContext.tsx:initializeAuth:no-auth-branch',
              message: 'Auth initialized with no token and no OTP requirement',
              data: {
                hasTempEmail: false
              },
              timestamp: Date.now()
            })
          }).catch(() => {});
          // #endregion agent log
        }
      }
    };
    
    initializeAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b5466ef-e4ad-485a-98f1-d363bc9e423a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'pre-fix',
          hypothesisId: 'H5',
          location: 'AuthContext.tsx:login:entry',
          message: 'Login called',
          data: { hasEmail: !!email },
          timestamp: Date.now()
        })
      }).catch(() => {});
      // #endregion agent log

      const res = await authService.login(email, pass);
      
      // Handle login response structure - now returns message and user info, not token
      if (res.message && res.user) {
        // Store email for OTP verification
        localStorage.setItem('temp_email', email);
        localStorage.removeItem('is_registration'); // Clear registration flag
        localStorage.removeItem('is_forgot_password'); // Clear forgot password flag
        setTempEmail(email);
        setIsRegistration(false);
        
        setState(prev => ({ 
          ...prev, 
          requiresOtp: true
        }));

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b5466ef-e4ad-485a-98f1-d363bc9e423a', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'pre-fix',
            hypothesisId: 'H6',
            location: 'AuthContext.tsx:login:otp-set',
            message: 'Login completed, OTP required state set',
            data: {
              requiresOtp: true,
              isRegistration: false
            },
            timestamp: Date.now()
          })
        }).catch(() => {});
        // #endregion agent log
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: { email: string; password: string; full_name: string; password2: string }) => {
    try {
      console.log('Register function called with:', { email: data.email, full_name: data.full_name });
      
      const registerData = {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        password2: data.password2
      };
      
      const res = await authService.register(registerData);
      console.log('Registration API response:', res);
      
      // Check if registration was successful
      console.log('Checking registration success conditions:');
      console.log('- res.message:', res.message);
      console.log('- res.user:', res.user);
      console.log('- res.status:', res.status);
      console.log('- res:', res);
      
      // More flexible success condition
      if (res.message || res.user || res.status === 'success' || res.id) {
        console.log('Registration successful - storing email and setting OTP required');
        // Store email for OTP verification
        localStorage.setItem('temp_email', data.email);
        localStorage.setItem('is_registration', 'true');
        localStorage.removeItem('is_forgot_password'); // Clear forgot password flag
        setTempEmail(data.email);
        setIsRegistration(true);
        
        setState(prev => ({ 
          ...prev, 
          requiresOtp: true
        }));

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b5466ef-e4ad-485a-98f1-d363bc9e423a', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'post-fix',
            hypothesisId: 'H8',
            location: 'AuthContext.tsx:register:otp-set',
            message: 'Register completed, OTP required state set',
            data: {
              requiresOtp: true,
              isRegistration: true
            },
            timestamp: Date.now()
          })
        }).catch(() => {});
        // #endregion agent log
        
        console.log('OTP state set - should redirect to register-verify-otp page');
        console.log('localStorage is_registration:', localStorage.getItem('is_registration'));
        console.log('localStorage temp_email:', localStorage.getItem('temp_email'));
        // Navigation will be handled by the router based on requiresOtp state
      } else {
        console.log('Registration failed - invalid response:', res);
        // Handle registration errors
        const errorMessage = res.error || res.detail || res.message || 'Registration failed';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const verifyRegistrationOtp = async (email: string, otp: string) => {
    try {
      console.log('verifyRegistrationOtp called with:', { email, otp });
      const res = await authService.verifyRegistrationOtp(email, otp);
      console.log('OTP verification API response:', res);
      
      // Check for different possible success response structures
      console.log('Checking OTP verification success conditions:');
      console.log('- res.access:', res.access);
      console.log('- res.refresh:', res.refresh);
      console.log('- res.token:', res.token);
      console.log('- res.success:', res.success);
      console.log('- res.status:', res.status);
      console.log('- res:', res);
      
      if (res.access && res.refresh) {
        console.log('OTP verification successful - tokens received');
        const finalToken = res.access;
        
        // Store token immediately before making any API calls
        localStorage.setItem('pl_token', finalToken);
        
        // Fetch user profile data after successful OTP verification
        const profileData = await accountService.getProfile();
        console.log('User profile data:', profileData);
        
        // Create user object with backend structure
        const user: User = {
          id: profileData.id?.toString() || '',
          user_id: profileData.user?.toString() || '',
          accounts_id: profileData.id?.toString() || '',
          email: profileData.user_email || '',
          full_name: profileData.full_name || '',
          name: profileData.full_name || '', // backward compatibility
          phone: profileData.phone || '',
          plan: profileData.plan || 'free',
          gender: profileData.gender || '',
          birth_day: profileData.birth_day || '',
          language: profileData.language || '',
          credit: profileData.credit || 0,
          is_verified: true
        };
        
        console.log('Created user object:', user);
        
        // Store user data
        localStorage.setItem('pl_user', JSON.stringify(user));
        
        // Remove temp data
        localStorage.removeItem('temp_email');
        localStorage.removeItem('is_registration');
        setTempEmail(null);
        setIsRegistration(false);
        
        console.log('Setting auth state to authenticated');
        setState({
          user,
          isAuthenticated: true,
          requiresOtp: false,
          token: finalToken
        });
        
        console.log('User authentication complete');
        return true;
      } else if (res.token || res.success || res.status === 'success') {
        console.log('OTP verification successful - alternative success format');
        const finalToken = res.token || res.access;
        
        if (finalToken) {
          localStorage.setItem('pl_token', finalToken);
          
          // Create basic user object if we can't fetch profile
          const user: User = {
            id: res.id?.toString() || '',
            user_id: res.id?.toString() || '',
            accounts_id: res.id?.toString() || '',
            email: email,
            full_name: res.full_name || '',
            name: res.full_name || '',
            phone: res.phone || '',
            plan: res.plan || 'free',
            gender: res.gender || '',
            birth_day: res.birth_day || '',
            language: res.language || '',
            credit: res.credit || 0,
            is_verified: true
          };
          
          localStorage.setItem('pl_user', JSON.stringify(user));
          localStorage.removeItem('temp_email');
          localStorage.removeItem('is_registration');
          setTempEmail(null);
          setIsRegistration(false);
          
          setState({
            user,
            isAuthenticated: true,
            requiresOtp: false,
            token: finalToken
          });
          
          console.log('User authentication complete (basic)');
          return true;
        }
      } else {
        console.log('OTP verification failed - no valid success indicators');
        throw new Error('OTP verification failed - invalid response');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  };

  const verifyLoginOtp = async (email: string, otp: string) => {
    try {
      const res = await authService.verifyLoginOtp(email, otp);
      
      if (res.access && res.refresh) {
        const finalToken = res.access;
        
        // Store token immediately before making any API calls
        localStorage.setItem('pl_token', finalToken);
        
        // Fetch user profile data after successful OTP verification
        const profileData = await accountService.getProfile();
        
        // Create user object with backend structure
        const user: User = {
          id: profileData.id?.toString() || '',
          user_id: profileData.user?.toString() || '',
          accounts_id: profileData.id?.toString() || '',
          email: profileData.user_email || '',
          full_name: profileData.full_name || '',
          name: profileData.full_name || '', // backward compatibility
          phone: profileData.phone || '',
          plan: profileData.plan || 'free',
          gender: profileData.gender || '',
          birth_day: profileData.birth_day || '',
          language: profileData.language || '',
          credit: profileData.credit || 0,
          is_verified: true
        };
        
        // Store user data
        localStorage.setItem('pl_user', JSON.stringify(user));
        
        // Remove temp data
        localStorage.removeItem('temp_email');
        setTempEmail(null);
        setIsRegistration(false);
        
        setState({
          user,
          isAuthenticated: true,
          requiresOtp: false,
          token: finalToken
        });
      } else {
        throw new Error('OTP verification failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem('pl_token');
    localStorage.removeItem('pl_user');
    localStorage.removeItem('temp_email');
    localStorage.removeItem('temp_auth_token');
    
    // Reset all state
    setState({
      user: null,
      isAuthenticated: false,
      requiresOtp: false,
      token: null
    });
    
    setTempEmail(null);
    setIsRegistration(false);
    
    console.log('User logged out successfully');
  };

  // Handle token expiration globally
  const handleTokenExpiration = () => {
    console.log('Handling token expiration');
    logout();
    // Optional: Show a toast message or redirect to login with a message
    // window.location.href = '/login?message=session_expired';
  };

  const updateUser = (user: User) => {
    setState(prev => ({...prev, user}));
    localStorage.setItem('pl_user', JSON.stringify(user));
  }

  return (
    <AuthContext.Provider value={{ 
      ...state, 
      login, 
      register, 
      verifyRegistrationOtp, 
      verifyLoginOtp, 
      logout, 
      updateUser,
      tempEmail,
      isRegistration
    }}>
      {children}
    </AuthContext.Provider>
  );
};