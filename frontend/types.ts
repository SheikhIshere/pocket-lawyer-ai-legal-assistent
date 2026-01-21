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
  messages: Message[] | string; // API might return stringified JSON
  created_at: string;
  updated_at: string;
}

export interface Message {
  id?: string; // Optional for backward compatibility
  message?: string; // User input (for API compatibility)
  content?: string; // User input (for UI compatibility)
  response?: string; // AI output (optional for user messages)
  role?: 'user' | 'assistant';
  timestamp?: number;
  status?: 'pending' | 'completed' | 'failed';
  error?: string;
  created_at?: string;
}

export interface AiRequest {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  response?: string;
  message?: string;
}

export interface CreateSessionPayload {
  title?: string;
}

export interface SendMessagePayload {
  message: string;
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