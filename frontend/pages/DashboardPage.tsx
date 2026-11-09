import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
// Header and Footer are now globally handled by Layout in App.tsx
import {
  User, Mail, Calendar, Globe, CreditCard, Shield,
  FileText, Briefcase, ChevronRight,
  Activity, TrendingUp, Clock, Star, Key, Plus,
  CheckCircle, Database, AlertTriangle,
  Settings, ArrowRight, Edit2, Bell, Zap,
  Award, Users, BarChart3, ExternalLink,
  Lock, ShieldCheck, RefreshCw, Phone, MessageSquare
} from 'lucide-react';

interface UserProfile {
  id: number;
  user_email: string;
  created_at: string;
  full_name: string;
  gender: string;
  birth_day: string;
  phone_number: string;
  language: string;
  plan: string;
}

interface ApiKey {
  id: string;
  name: string;
  is_working: boolean;
  created_at: string;
  last_used?: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [sessionCount, setSessionCount] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      setError('Please log in to access your dashboard');
      setTimeout(() => navigate('/login'), 1500);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileData, keysData, sessionsData] = await Promise.all([
        api.accountService.getProfile(),
        api.accountService.getApiKeys(),
        api.assistantService.getSessions(),
      ]);

      setProfile(profileData);
      setApiKeys(keysData);
      setSessionCount(sessionsData.length);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-500 pb-24 lg:pb-0 font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">

        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome back, <span className="text-teal-600 dark:text-teal-400">{profile?.full_name?.split(' ')[0] || user?.name}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Here's a summary of your legal activity today.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-all active:scale-95 shadow-sm"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/chat"
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Consultation
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Chat Sessions', value: sessionCount ?? '—', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'API Keys', value: apiKeys.length, icon: Key, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { label: 'Plan', value: profile?.plan || user?.plan || 'Free', icon: CreditCard, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
            { label: 'Member Since', value: profile?.created_at ? formatDate(profile.created_at) : '—', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' }
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
              <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</div>
              <div className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Account Overview */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-8 lg:p-10 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-teal-600" />
                    Account Overview
                  </h3>
                  <span className="px-4 py-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-xs font-black rounded-full uppercase tracking-widest">
                    {profile?.plan || 'Free'} Plan
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{profile?.user_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Link</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{profile?.phone_number || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Since</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{profile?.created_at ? formatDate(profile.created_at) : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Language</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{profile?.language || 'English (US)'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* API Vault */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8 lg:p-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-blue-600" />
                    Secure API Vault
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Manage your API access keys.</p>
                </div>
                <Link to="/settings?tab=api" className="text-sm font-bold text-teal-600 hover:text-teal-700">View All</Link>
              </div>
              <div className="space-y-4">
                {apiKeys.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                    <p className="text-slate-400 font-medium">No API keys found.</p>
                    <Link to="/settings?tab=api" className="text-teal-600 font-bold mt-2 inline-block">Add Your First Key</Link>
                  </div>
                ) : (
                  apiKeys.slice(0, 3).map((key, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${key.is_working ? 'bg-green-500' : 'bg-red-500'} shadow-sm`}></div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{key.name}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">ID: {String(key.id).slice(0, 8)}...</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Quick Consultation Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                  <MessageSquare className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-white text-2xl font-black leading-tight mb-4">Start New AI Legal Session</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">Analyze contracts, draft agreements, or get instant legal clarity with our advanced AI.</p>
                <Link
                  to="/chat"
                  className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-teal-50 transition-all active:scale-95"
                >
                  Start Consultation
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Quick Shortcuts */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest text-[11px]">Control Panel</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: 'Chat Sessions', path: '/documents', icon: FileText, color: 'text-blue-500' },
                  { label: 'Account Settings', path: '/settings', icon: Settings, color: 'text-slate-500' },
                  { label: 'Premium Upgrade', path: '/pricing', icon: Award, color: 'text-amber-500' }
                ].map((item, i) => (
                  <Link
                    key={i}
                    to={item.path}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-white dark:hover:bg-slate-800 border-2 border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      <span className="font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;