import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

import { authService, accountService } from '../services/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    requiresOtp: false,
    token: null
  });

  // Check local storage on load
  useEffect(() => {
    const storedToken = localStorage.getItem('pl_token');
    const storedUser = localStorage.getItem('pl_user');
    if (storedToken && storedUser) {
      setState({
        user: JSON.parse(storedUser),
        isAuthenticated: true,
        requiresOtp: false,
        token: storedToken
      });
    }
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await authService.login(email, pass);
      
      // Handle login response structure
      if (res.access) {
        // Store temp token for OTP verification
        localStorage.setItem('temp_auth_token', res.access);
        
        setState(prev => ({ 
          ...prev, 
          requiresOtp: true, 
          token: res.access 
        }));
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: { email: string; password: string; full_name: string; password2: string }) => {
    try {
      const registerData = {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        password2: data.password2
      };
      
      const res = await authService.register(registerData);
      
      // Check if registration was successful (has access token)
      if (res.access) {
        // Store temp token for OTP verification
        localStorage.setItem('temp_auth_token', res.access);
        
        setState(prev => ({ 
          ...prev, 
          requiresOtp: true, 
          token: res.access 
        }));
        
        // Navigation will be handled by the router based on requiresOtp state
      } else {
        // Handle registration errors
        const errorMessage = res.error || res.detail || 'Registration failed';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const verifyOtp = async (otp: string) => {
    try {
      const res = await authService.verifyOtp(otp);
      
      if (res.access && res.refresh) {
        const finalToken = res.access;
        
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
        
        // Store final token and user
        localStorage.setItem('pl_token', finalToken);
        localStorage.setItem('pl_user', JSON.stringify(user));
        
        // Remove temp token
        localStorage.removeItem('temp_auth_token');
        
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
    localStorage.removeItem('pl_token');
    localStorage.removeItem('pl_user');
    localStorage.removeItem('temp_auth_token');
    setState({
      user: null,
      isAuthenticated: false,
      requiresOtp: false,
      token: null
    });
  };

  const updateUser = (user: User) => {
      setState(prev => ({...prev, user}));
      localStorage.setItem('pl_user', JSON.stringify(user));
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, verifyOtp, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};