import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountService } from '../services/api';
import { Header, Footer } from '../components/Layout';
import { 
  User, Mail, Calendar, Globe, CreditCard, Shield, 
  FileText, Briefcase, ChevronRight, 
  Activity, TrendingUp, Clock, Star, Key, Plus,
  CheckCircle, Database, AlertTriangle, 
  Settings, ArrowRight, Edit2, Bell, Zap,
  Award, Users, BarChart3, ExternalLink,
  Lock, ShieldCheck, RefreshCw
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
      const [profileData, keysData, statsData] = await Promise.all([
        accountService.getProfile(),
        accountService.getApiKeys(),
        accountService.getDashboardStats(),
      ]);
      setProfile(profileData);
      setApiKeys(keysData);
      setStats(statsData);
      setError(null);
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
      premium: <Star className="w-4 h-4" />,
      professional: <Briefcase className="w-4 h-4" />,
      enterprise: <ShieldCheck className="w-4 h-4" />,
      business: <Award className="w-4 h-4" />,
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-gray-100 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-[3px] border-teal-600/20 rounded-full"></div>
            <div className="w-16 h-16 border-[3px] border-t-transparent border-teal-600 animate-spin rounded-full absolute top-0 left-0"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-800">Loading Your Dashboard</h3>
            <p className="text-slate-600 text-sm">Fetching your data and statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 max-w-md w-full p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-4 ring-red-50">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">Something Went Wrong</h3>
          <p className="text-gray-600 text-center mb-6">{error}</p>
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
              className="flex-1 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-teal-500 hover:text-teal-700 transition-all duration-300"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-300/10 rounded-full blur-3xl"></div>
          <div className="absolute top-40 -left-40 w-80 h-80 bg-blue-300/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Header Section */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-teal-700">Dashboard</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">{profile?.full_name?.split(' ')[0] || user?.name}</span>
              </h1>
              <p className="text-slate-600 mt-2 text-lg">Here's what's happening with your account today</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/settings')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:border-teal-500 hover:text-teal-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={fetchDashboardData}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg shadow-blue-500/5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.documents}</div>
              <p className="text-sm text-slate-600">Documents</p>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-slate-500">Last updated: {formatDate(profile?.created_at || '')}</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg shadow-purple-500/5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                </div>
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.cases}</div>
              <p className="text-sm text-slate-600">Active Cases</p>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-slate-500">Manage your legal cases</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg shadow-amber-500/5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-amber-600" />
                </div>
                <BarChart3 className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.apiCalls.toLocaleString()}</div>
              <p className="text-sm text-slate-600">API Calls</p>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-slate-500">This month</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg shadow-green-500/5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                  {Math.round((stats.storageUsed / 1024) * 100)}%
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{(stats.storageUsed / 1024).toFixed(1)}GB</div>
              <p className="text-sm text-slate-600">Storage Used</p>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full"
                    style={{ width: `${(stats.storageUsed / 1024) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile & Plan */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700"></div>
                  <div className="relative p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                            <User className="w-10 h-10 text-white" />
                          </div>
                          <button 
                            onClick={() => navigate('/settings')}
                            className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                          >
                            <Edit2 className="w-3 h-3 text-gray-700" />
                          </button>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-1">{profile?.full_name || user?.name}</h2>
                          <p className="text-teal-100">{profile?.user_email || user?.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-sm text-teal-100">Online</span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-5 py-2.5 rounded-xl flex items-center gap-3 text-sm font-semibold bg-gradient-to-r ${getPlanBadgeColor(profile?.plan)} shadow-lg`}>
                        {getPlanIcon(profile?.plan)}
                        <span className="text-white">{(profile?.plan || 'Free').toUpperCase()} PLAN</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-teal-600" />
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 mb-1">Email Address</p>
                          <p className="text-sm font-medium text-slate-900 truncate">{profile?.user_email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 mb-1">Birthday</p>
                          <p className="text-sm font-medium text-slate-900">{profile?.birth_day ? formatDate(profile.birth_day) : 'Not set'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 mb-1">Phone Number</p>
                          <p className="text-sm font-medium text-slate-900">{profile?.phone_number || 'Not set'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 mb-1">Gender</p>
                          <p className="text-sm font-medium text-slate-900 capitalize">{profile?.gender || 'Not specified'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Globe className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 mb-1">Language</p>
                          <p className="text-sm font-medium text-slate-900">{profile?.language || 'English'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-6 rounded-xl border border-teal-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-900">
                              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                            <p className="text-sm text-slate-600">Member Since</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-900 capitalize">{profile?.plan || 'Free'}</p>
                            <p className="text-sm text-slate-600">Current Plan</p>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate('/settings?tab=billing')}
                          className="w-full mt-4 px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
                        >
                          Upgrade Plan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* API Keys Section */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-8 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 ring-4 ring-blue-50">
                          <Key className="w-7 h-7 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">API Keys</h3>
                        <p className="text-slate-600 mt-1">Manage your API integrations and access</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-sm font-medium text-slate-700">Active</span>
                          </div>
                          <span className="text-2xl font-bold text-slate-900">
                            {activeKeysCount}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            <span className="text-sm font-medium text-slate-700">Total</span>
                          </div>
                          <span className="text-xl font-semibold text-slate-700">
                            {apiKeys.length}
                          </span>
                        </div>
                      </div>
                      
                      <div className="hidden lg:block h-12 w-px bg-gradient-to-b from-transparent via-blue-200 to-transparent"></div>
                      
                      <button
                        onClick={() => navigate('/settings?tab=api-keys')}
                        className="group relative inline-flex items-center justify-center px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                      >
                        <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                        Add Key
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-100 p-5 group hover:border-blue-200 hover:shadow-md transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-1">Active API Keys</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-slate-900">
                              {activeKeysCount}
                            </span>
                            <span className="text-sm text-slate-500">keys</span>
                          </div>
                        </div>
                        <div className={`p-3 rounded-lg ${
                          activeKeysCount > 0 
                            ? 'bg-green-50 text-green-600' 
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          <CheckCircle className={`w-6 h-6 ${
                            activeKeysCount > 0 
                              ? 'text-green-500' 
                              : 'text-slate-300'
                          }`} />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-500">Health Status</span>
                          <span className={`font-medium ${
                            activeKeysCount > 0 
                              ? 'text-green-600' 
                              : 'text-amber-600'
                          }`}>
                            {activeKeysCount > 0 ? 'Operational' : 'No Active Keys'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(activeKeysCount / Math.max(apiKeys.length, 1)) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="relative bg-gradient-to-br from-white to-cyan-50 rounded-xl border border-cyan-100 p-5 group hover:border-cyan-200 hover:shadow-md transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-1">Total API Keys</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-slate-900">{apiKeys.length}</span>
                            <span className="text-sm text-slate-500">keys</span>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                          <Database className="w-6 h-6 text-blue-500" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-500">Last Used</span>
                          <span className="font-medium text-slate-700">
                            {lastUsedKey?.last_used ? formatDateTime(lastUsedKey.last_used) : 'Never'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Lock className="w-4 h-4" />
                          <span>Encrypted at rest</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {activeKeysCount === 0 && apiKeys.length > 0 && (
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-amber-100 rounded-xl border border-amber-200">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-amber-900 mb-1">No Active API Keys</h4>
                            <p className="text-amber-700/80 max-w-md">
                              You have {apiKeys.length} API key{apiKeys.length !== 1 ? 's' : ''}, but none are currently active. 
                              Check your key configurations or add a new one.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => navigate('/settings?tab=api-keys')}
                            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm hover:shadow"
                          >
                            <Settings className="w-4 h-4" />
                            Configure Keys
                          </button>
                          <button
                            onClick={() => navigate('/settings?tab=api-keys&add=true')}
                            className="px-5 py-2.5 bg-white border border-amber-300 text-amber-700 hover:bg-amber-50 font-medium rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add New Key
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
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-600" />
                  Quick Actions
                </h3>
                <div className="space-y-4">
                  <Link 
                    to="/documents"
                    className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-gray-200 hover:border-teal-300 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">Legal Documents</h4>
                        <p className="text-sm text-slate-600">Manage documents</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                  </Link>

                  <div 
                    onClick={() => navigate('/cases')}
                    className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">Case Management</h4>
                        <p className="text-sm text-slate-600">Track cases</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>

                  <Link 
                    to="/settings"
                    className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-gray-200 hover:border-purple-300 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Settings className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">Account Settings</h4>
                        <p className="text-sm text-slate-600">Update profile</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                  </Link>

                  <Link 
                    to="/analytics"
                    className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-gray-200 hover:border-green-300 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BarChart3 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">Analytics</h4>
                        <p className="text-sm text-slate-600">View insights</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
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
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Document uploaded</p>
                      <p className="text-xs text-slate-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">API key verified</p>
                      <p className="text-xs text-slate-500">Yesterday</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Bell className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Plan reminder</p>
                      <p className="text-xs text-slate-500">3 days ago</p>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:border-teal-500 hover:text-teal-700 transition-colors text-sm font-medium">
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