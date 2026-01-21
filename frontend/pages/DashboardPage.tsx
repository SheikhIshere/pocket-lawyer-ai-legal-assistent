import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Header, Footer } from '../components/Layout';
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
  permissions: string[];
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [stats, setStats] = useState({
    documents: 0,
    cases: 0,
    apiCalls: 0,
    storageUsed: 0,
  });
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

      const [profileData, keysData] = await Promise.all([
        api.accountService.getProfile(),
        api.accountService.getApiKeys(),
      ]);

      setProfile(profileData);
      setApiKeys(keysData);

      // Attempt to get stats, but use mock data if it fails (backend endpoint missing)
      try {
        const statsData = await api.accountService.getDashboardStats();
        setStats(statsData);
      } catch (statsErr) {
        console.warn('Dashboard stats API not found, using fallback data');
        setStats({
          documents: 0,
          cases: 0,
          apiCalls: 0,
          storageUsed: 256,
        });
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPlanBadgeColor = (plan: string) => {
    const planColors = {
      premium: 'from-purple-500 via-purple-600 to-pink-600',
      professional: 'from-blue-500 via-blue-600 to-cyan-600',
      enterprise: 'from-amber-500 via-amber-600 to-orange-600',
      business: 'from-emerald-500 via-emerald-600 to-teal-600',
    };
    return planColors[plan?.toLowerCase() as keyof typeof planColors] || 'from-gray-500 via-gray-600 to-gray-700';
  };

  const getPlanIcon = (plan: string) => {
    const planIcons = {
      premium: < Star className="w-4 h-4" />,
      professional: < Briefcase className="w-4 h-4" />,
      enterprise: < ShieldCheck className="w-4 h-4" />,
      business: < Award className="w-4 h-4" />,
    };
    return planIcons[plan?.toLowerCase() as keyof typeof planIcons] || <User className="w-4 h-4" />;
  };

  const getPlanFeatures = (plan: string) => {
    const features = {
      free: ['5 Documents/Month', 'Basic Support', '3 API Key'],
      premium: ['50 Documents/Month', 'Priority Support', '5 API Keys', 'Advanced Analytics'],
      professional: ['Unlimited Documents', '24/7 Support', '15 API Keys', 'Team Collaboration'],
    };
    return features[plan?.toLowerCase() as keyof typeof features] || features.free;
  };

  const activeKeysCount = useMemo(() =>
    apiKeys.filter(key => key.is_working).length,
    [apiKeys]
  );

  const lastUsedKey = useMemo(() =>
    apiKeys
      .filter(key => key.last_used)
      .sort((a, b) => new Date(b.last_used!).getTime() - new Date(a.last_used!).getTime())[0],
    [apiKeys]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-500">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-[3px] border-teal-600/20 rounded-full"></div>
            <div className="w-16 h-16 border-[3px] border-t-transparent border-teal-600 animate-spin rounded-full absolute top-0 left-0"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Loading Your Dashboard</h3>
            <p className="text-slate-600 dark:text-gray-400 text-sm">Fetching your data and statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-500">
        <div className="bg-white dark:bg-slate-900 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-800 max-w-md w-full p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-4 ring-red-50">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">Something Went Wrong</h3>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={fetchDashboardData}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:border-teal-500 dark:hover:border-teal-400 hover:text-teal-700 dark:hover:text-teal-400 transition-all duration-300"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors duration-500 pb-20 lg:pb-0">
      <Header />
      <main className="flex-grow">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-300/10 rounded-full blur-3xl"></div>
          <div className="absolute top-40 -left-40 w-80 h-80 bg-blue-300/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Header Section */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(20,184,166,0.6)]"></div>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-[0.2em]">Dashboard Status: Live</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">{profile?.full_name?.split(' ')[0] || user?.name}</span>
              </h1>
              <p className="text-slate-500 dark:text-gray-400 text-lg font-medium">Your legal enterprise overview for today</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDashboardData}
                className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl hover:text-teal-600 dark:hover:text-teal-400 transition-all active:scale-95 shadow-sm"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-3 px-6 py-3.5 bg-gradient-to-br from-teal-600 to-emerald-700 text-white font-bold rounded-2xl shadow-xl shadow-teal-500/20 active:scale-95 transition-all"
              >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Documents', value: stats.documents, icon: FileText, color: 'blue' },
              { label: 'Active Cases', value: stats.cases, icon: Briefcase, color: 'purple' },
              { label: 'API Interactions', value: stats.apiCalls.toLocaleString(), icon: Zap, color: 'amber' },
              { label: 'Storage Usage', value: `${(stats.storageUsed / 1024).toFixed(1)}GB`, icon: Database, color: 'emerald', progress: (stats.storageUsed / 1024) * 100 }
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 rounded-[2.25rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-500 group active:scale-[0.98]">
                <div className="flex items-center justify-between mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-${item.color}-600 dark:text-${item.color}-400 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  {item.progress !== undefined ? (
                    <div className="text-xs font-black px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full uppercase tracking-wider">
                      {Math.round(item.progress)}%
                    </div>
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800`}>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{item.value}</div>
                <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">{item.label}</p>

                {item.progress !== undefined && (
                  <div className="mt-6">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile & Plan */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Card */}
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-teal-500/5">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 opacity-90"></div>
                  <div className="relative p-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                        <div className="relative group">
                          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center border-2 border-white/30 shadow-2xl transition-transform group-hover:scale-105">
                            <User className="w-12 h-12 text-white" />
                          </div>
                          <button
                            onClick={() => navigate('/settings')}
                            className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all border border-slate-100 dark:border-slate-700"
                          >
                            <Edit2 className="w-4 h-4 text-teal-600" />
                          </button>
                        </div>
                        <div className="space-y-1">
                          <h2 className="text-3xl font-black text-white tracking-tight">{profile?.full_name || user?.name}</h2>
                          <p className="text-teal-50 font-medium opacity-80">{profile?.user_email || user?.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-bold text-teal-50 uppercase tracking-widest">Active Now</span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 text-xs font-black bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl uppercase tracking-widest`}>
                        {getPlanIcon(profile?.plan)}
                        <span>{(profile?.plan || 'Free').toUpperCase()} Enterprise</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-10">
                  <h3 className="text-xs font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                    <User className="w-4 h-4 text-teal-600" />
                    Identity & Credentials
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { label: 'Email Address', value: profile?.user_email, icon: Mail, color: 'teal' },
                      { label: 'Birth Registry', value: profile?.birth_day ? formatDate(profile.birth_day) : 'Unregistered', icon: Calendar, color: 'blue' },
                      { label: 'Primary Contact', value: profile?.phone_number || 'No link', icon: Phone, color: 'amber' },
                      { label: 'Gender Identity', value: profile?.gender || 'Prefer not to say', icon: Users, color: 'purple' },
                      { label: 'Core Language', value: profile?.language || 'English (US)', icon: Globe, color: 'emerald' },
                      { label: 'Account Created', value: profile?.created_at ? formatDate(profile.created_at) : 'N/A', icon: Activity, color: 'indigo' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-3xl group hover:bg-white dark:hover:bg-slate-900 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all duration-300">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 text-${item.color}-600 dark:text-${item.color}-400 shadow-sm mb-4`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* API Keys Section */}
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5">
                <div className="p-10">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-12 pb-12 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                          <Key className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900">
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Secure Access Keys</h3>
                        <p className="text-slate-500 dark:text-gray-400 font-medium">Manage your cryptographic enterprise entry points</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-8">
                      <div className="flex gap-8">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right">Active</p>
                          <div className="flex items-center gap-2 justify-end">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{activeKeysCount}</span>
                          </div>
                        </div>
                        <div className="w-px h-10 bg-slate-100 dark:bg-slate-800"></div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vault Total</p>
                          <span className="text-2xl font-black text-slate-900 dark:text-white">{apiKeys.length}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate('/settings?tab=api-keys')}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-blue-600 to-cyan-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all group"
                      >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        Manage Vault
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="relative bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-blue-900/30 p-5 group hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-gray-400 mb-1">Active API Keys</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">
                              {activeKeysCount}
                            </span>
                            <span className="text-sm text-slate-500 dark:text-gray-500">keys</span>
                          </div>
                        </div>
                        <div className={`p-3 rounded-lg ${activeKeysCount > 0
                          ? 'bg-green-50 dark:bg-green-900/40 text-green-600'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                          }`}>
                          <CheckCircle className={`w-6 h-6 ${activeKeysCount > 0
                            ? 'text-green-500'
                            : 'text-slate-300 dark:text-slate-500'
                            }`} />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-500 dark:text-gray-500">Health Status</span>
                          <span className={`font-medium ${activeKeysCount > 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-amber-600'
                            }`}>
                            {activeKeysCount > 0 ? 'Operational' : 'No Active Keys'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${(activeKeysCount / Math.max(apiKeys.length, 1)) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="relative bg-white dark:bg-slate-800 rounded-xl border border-cyan-100 dark:border-cyan-900/30 p-5 group hover:border-cyan-200 dark:hover:border-cyan-700 hover:shadow-md transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-gray-400 mb-1">Total API Keys</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">{apiKeys.length}</span>
                            <span className="text-sm text-slate-500 dark:text-gray-500">keys</span>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600">
                          <Database className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-500 dark:text-gray-500">Last Used</span>
                          <span className="font-medium text-slate-700 dark:text-gray-200">
                            {lastUsedKey?.last_used ? formatDateTime(lastUsedKey.last_used) : 'Never'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-500">
                          <Lock className="w-4 h-4" />
                          <span>Encrypted at rest</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {activeKeysCount === 0 && apiKeys.length > 0 && (
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50 p-6 transition-all">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl border border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-1">No Active API Keys</h4>
                            <p className="text-amber-700/80 dark:text-amber-200/60 max-w-md">
                              You have {apiKeys.length} API key{apiKeys.length !== 1 ? 's' : ''}, but none are currently active.
                              Check your key configurations or add a new one.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => navigate('/settings?tab=api-keys')}
                            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm hover:shadow"
                          >
                            <Settings className="w-4 h-4" />
                            Configure Keys
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {apiKeys.length === 0 && (
                    <div className="text-center py-12 px-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Key className="w-10 h-10 text-blue-500" />
                      </div>
                      <h4 className="text-xl font-semibold text-slate-900 mb-2">No API Keys Yet</h4>
                      <p className="text-slate-600 mb-8 max-w-md mx-auto">
                        Add your first API key to unlock all integration features and start using our services.
                      </p>
                      <button
                        onClick={() => navigate('/settings?tab=api-keys')}
                        className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
                      >
                        <Plus className="w-5 h-5 mr-3" />
                        Add Your First API Key
                        <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Quick Actions & Plan Details */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="bg-white dark:bg-slate-900 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-800 p-6 transition-all duration-300">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-600" />
                  Quick Actions
                </h3>
                <div className="space-y-4">
                  <Link
                    to="/documents"
                    className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/50 hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/40 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">Legal Documents</h4>
                        <p className="text-sm text-slate-600 dark:text-gray-400">Manage documents</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-600 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                  </Link>

                  <div
                    onClick={() => navigate('/cases')}
                    className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">Case Management</h4>
                        <p className="text-sm text-slate-600 dark:text-gray-400">Track cases</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>

                  <Link
                    to="/settings"
                    className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/50 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">Account Settings</h4>
                        <p className="text-sm text-slate-600 dark:text-gray-400">Update profile</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-600 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </Link>

                  <Link
                    to="/analytics"
                    className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/50 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">Analytics</h4>
                        <p className="text-sm text-slate-600 dark:text-gray-400">View insights</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-600 group-hover:text-green-600 dark:group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                  </Link>
                </div>
              </div>

              {/* Plan Details */}
              <div className="bg-gradient-to-br from-slate-900 to-gray-900 rounded-2xl shadow-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Your Plan</h3>
                    <p className="text-sm text-gray-400">{(profile?.plan || 'Free').toUpperCase()}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {getPlanFeatures(profile?.plan || 'free').map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate('/pricing')}
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  {profile?.plan === 'free' ? (
                    <>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      Upgrade Plan
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4" />
                      Manage Subscription
                    </>
                  )}
                </button>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-slate-900 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-800 p-6 transition-all duration-300">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Document uploaded</p>
                      <p className="text-xs text-slate-500 dark:text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">API key verified</p>
                      <p className="text-xs text-slate-500 dark:text-gray-500">Yesterday</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
                      <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Plan reminder</p>
                      <p className="text-xs text-slate-500 dark:text-gray-500">3 days ago</p>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-6 py-2.5 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:border-teal-500 dark:hover:border-teal-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors text-sm font-medium">
                  View All Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;