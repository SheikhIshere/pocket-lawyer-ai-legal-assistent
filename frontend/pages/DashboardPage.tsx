import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountService } from '../services/api';
import { Header, Footer } from '../components/Layout';
import { 
  User, Mail, Calendar, Globe, CreditCard, Shield, 
  Settings, FileText, Briefcase, ChevronRight, 
  Activity, TrendingUp, Clock, Star
} from 'lucide-react';

interface UserProfile {
  id: number;
  user_email: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  gender: string;
  birth_day: string;
  language: string;
  plan: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Only fetch profile if user is authenticated
    if (user) {
      fetchProfile();
    } else {
      setError('User not authenticated. Redirecting to login...');
      setLoading(false);
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profileData = await accountService.getProfile();
      setProfile(profileData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'premium':
        return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white';
      case 'professional':
        return 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white';
      case 'enterprise':
        return 'bg-gradient-to-r from-amber-600 to-orange-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'premium':
        return <Star className="w-4 h-4" />;
      case 'professional':
        return <Briefcase className="w-4 h-4" />;
      case 'enterprise':
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-200 max-w-md">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Profile</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {profile?.full_name || user?.name}!</p>
        </div>

        {/* Profile Overview Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{profile?.full_name || user?.name}</h2>
                  <p className="text-teal-100">{profile?.user_email || user?.email}</p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold ${getPlanBadgeColor(profile?.plan)}`}>
                {getPlanIcon(profile?.plan)}
                {(profile?.plan || 'free').charAt(0).toUpperCase() + (profile?.plan || 'free').slice(1)} Plan
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Email */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{profile?.user_email}</p>
                </div>
              </div>

              {/* Gender */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Gender</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{profile?.gender || 'Not specified'}</p>
                </div>
              </div>

              {/* Birthday */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Birthday</p>
                  <p className="text-sm font-medium text-gray-900">{profile?.birth_day ? formatDate(profile.birth_day) : 'Not specified'}</p>
                </div>
              </div>

              {/* Language */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Language</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{profile?.language || 'English'}</p>
                </div>
              </div>
            </div>

            {/* Account Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-6 rounded-xl border border-teal-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <Activity className="w-5 h-5 text-teal-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">Member Since</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">Last Updated</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 capitalize">{profile?.plan || 'Free'}</p>
                <p className="text-sm text-gray-600">Current Plan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Legal Documents</h3>
            <p className="text-sm text-gray-600">Manage and review your legal documents</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Case Management</h3>
            <p className="text-sm text-gray-600">Track your legal cases and proceedings</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Settings</h3>
            <p className="text-sm text-gray-600">Update your profile and preferences</p>
          </div>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
