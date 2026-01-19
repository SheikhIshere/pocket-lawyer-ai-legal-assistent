export interface User {
  id: string;
  user_id: string;
  accounts_id?: string;
  email: string;
  full_name: string;
  name?: string; // for backward compatibility
  phone?: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'premium';
  gender?: string;
  birth_day?: string;
  language?: string;
  credit?: number;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  requiresOtp: boolean;
  token: string | null;
}

export interface ChatSession {
  id: string;
  title: string;
  date: string;
  preview: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
}

export enum RequestStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}