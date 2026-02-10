import React, { useState, useEffect } from 'react';
// Header and Footer are now globally handled by Layout in App.tsx
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Lock, FileText, Settings, CreditCard, LogOut, Camera, Mail, Phone, Calendar, MapPin, Briefcase, Globe, Shield, Edit2, Save, X, Loader2, Key, Plus, Trash2, Eye, EyeOff, Code, Database, Zap, ShieldCheck, Brain, RefreshCw, Send } from 'lucide-react';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

// Add shake animation
const shakeAnimation = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
    20%, 40%, 60%, 80% { transform: translateX(2px); }
  }
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
`;

const SettingsPage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [securityTab, setSecurityTab] = useState('password');
  const [apiTab, setApiTab] = useState('overview');

  // Password change state
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  // API Keys state
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newApiKey, setNewApiKey] = useState('');
  const [newApiKeyInput, setNewApiKeyInput] = useState('');
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<any>(null);
  const [showFullKey, setShowFullKey] = useState<{ [key: number]: boolean }>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    old_password?: string;
    new_password?: string;
    confirm_password?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: user?.full_name || user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    birth_day: user?.birth_day || '',
    language: user?.language || 'english'
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Map form data to API field names
      const apiData = {
        full_name: formData.full_name,
        gender: formData.gender,
        birth_day: formData.birth_day,
        phone_number: formData.phone, // Map phone to phone_number
        language: formData.language
      };

      const updated = await api.accountService.updateProfile(apiData);
      // Update user state with new data
      const updatedUser = {
        ...user,
        full_name: updated.full_name,
        name: updated.full_name, // backward compatibility
        email: user?.email || '', // Email comes from user model, not account
        phone: updated.phone_number || user?.phone || '',
        gender: updated.gender,
        birth_day: updated.birth_day,
        language: updated.language
      };
      updateUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      // Handle error (show toast or message)
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setFieldErrors({}); // Clear previous errors

    // Validations
    let hasError = false;
    const errors: typeof fieldErrors = {};

    if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
      hasError = true;
    }

    if (passwordData.old_password === passwordData.new_password) {
      errors.new_password = 'Cannot be same as current password';
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(errors);
      // Add shake animation to inputs with errors
      Object.keys(errors).forEach((fieldName) => {
        const input = document.querySelector(`[data-field="${fieldName}"]`) as HTMLElement;
        if (input) {
          input.style.animation = 'shake 0.5s';
          setTimeout(() => {
            input.style.animation = '';
          }, 500);
        }
      });
      return;
    }

    try {
      await api.authService.changePassword(passwordData.old_password, passwordData.new_password);
      setPasswordError(null);
      setFieldErrors({});
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      setSuccessMessage('Password changed successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Password change error:', error);
      setFieldErrors({ old_password: 'Current password is incorrect' });
      // Shake the old password input
      const oldInput = document.querySelector('[data-field="old_password"]') as HTMLElement;
      if (oldInput) {
        oldInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
          oldInput.style.animation = '';
        }, 500);
      }
    }
  };

  const fetchApiKeys = async () => {
    try {
      const keys = await api.accountService.getApiKeys();
      setApiKeys(keys);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  const createApiKey = async () => {
    try {
      const newKey = await api.accountService.createApiKey({ name: `API Key ${new Date().toISOString()}` });
      setApiKeys([...apiKeys, newKey]);
      setNewApiKey(newKey.key);
      setShowNewKeyForm(false);
    } catch (error) {
      console.error('Failed to create API key:', error);
    }
  };

  const deleteApiKey = async (id: string) => {
    // Optimistically remove from UI immediately
    const originalKeys = [...apiKeys];
    setApiKeys(apiKeys.filter(key => key.id !== id));

    try {
      console.log('Deleting API key with ID:', id);
      await api.accountService.deleteApiKey(id);
      console.log('API key deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete API key:', error);

      // Restore the key if deletion failed
      setApiKeys(originalKeys);

      // Handle specific backend errors
      let errorMessage = 'Failed to delete API key. Please try again.';

      if (error?.response?.data) {
        const errorData = error.response.data;

        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.detail) {
          errorMessage = errorData.detail;
        } else if (errorData?.non_field_errors) {
          errorMessage = errorData.non_field_errors[0];
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleAddApiKey = async () => {
    if (!newApiKeyInput.trim()) {
      setError('Please enter an API key');
      setTimeout(() => setError(null), 3000);
      return;
    }
    try {
      const newKey = await api.accountService.createApiKey({ api_key: newApiKeyInput });
      setApiKeys([...apiKeys, newKey]);
      setNewApiKeyInput('');
      setShowNewKeyForm(false);
      setNewApiKey(newKey.api_key);
    } catch (error: any) {
      console.error('Failed to add API key:', error);

      // Handle specific backend errors
      let errorMessage = 'Failed to add API key. Please try again.';

      if (error?.response?.data) {
        const errorData = error.response.data;

        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.api_key) {
          errorMessage = errorData.api_key;
        } else if (errorData?.non_field_errors) {
          errorMessage = errorData.non_field_errors[0];
        } else if (errorData?.detail) {
          errorMessage = errorData.detail;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    }
  };

  useEffect(() => {
    if (activeTab === 'api' || activeTab === 'api-keys') {
      fetchApiKeys();
    }
  }, [activeTab]);

  return (
    <>
      <style>{shakeAnimation}</style>
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col transition-colors duration-500 pb-24 lg:pb-0">

        {/* Error Popup */}
        {error && (
          <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-pulse">
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <X className="w-3 h-3 text-red-500" />
            </div>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Success Popup */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-pulse">
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
          <h1 className="text-2xl font-bold text-slate-900 mb-8">Account Settings</h1>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar (Desktop) */}
            <aside className="hidden lg:block w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <nav className="flex flex-col">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-[#0D9488]/10 text-[#0D9488] border-r-2 border-[#0D9488]' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <User className="w-5 h-5" /> Profile Info
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-[#0D9488]/10 text-[#0D9488] border-r-2 border-[#0D9488]' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Lock className="w-5 h-5" /> Security
                  </button>
                  <button
                    onClick={() => setActiveTab('api')}
                    className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'api' ? 'bg-[#0D9488]/10 text-[#0D9488] border-r-2 border-[#0D9488]' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Key className="w-5 h-5" /> API Keys
                  </button>
                  <button
                    onClick={() => setActiveTab('billing')}
                    className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'billing' ? 'bg-[#0D9488]/10 text-[#0D9488] border-r-2 border-[#0D9488]' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <CreditCard className="w-5 h-5" /> Subscription
                  </button>
                  <div className="h-px bg-slate-100 my-2"></div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" /> Sign Out
                  </button>
                </nav>
              </div>
            </aside>

            {/* Mobile Tab Navigation (Horizontal Scroll) */}
            <div className="lg:hidden -mx-4 px-4 mb-6 sticky top-0 z-10 bg-slate-50 dark:bg-[#020617] py-2 overflow-x-auto scrollbar-hide flex gap-2">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'security', label: 'Security', icon: Lock },
                { id: 'api', label: 'API Keys', icon: Key },
                { id: 'billing', label: 'Plans', icon: CreditCard },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black whitespace-nowrap transition-all ${activeTab === tab.id
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800'
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
              <button
                onClick={logout}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black whitespace-nowrap bg-red-50 dark:bg-red-900/10 text-red-600 border border-red-100 dark:border-red-900/20"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            {/* Content */}
            <div className="flex-1">
              {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0f766e] flex items-center justify-center text-white text-2xl font-bold border-4 border-slate-50">
                          {(user?.full_name || user?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow border border-slate-200 hover:bg-slate-50">
                          <Camera className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{user?.full_name || user?.name}</h2>
                        <p className="text-slate-500 text-sm">{user?.email}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                          {user?.gender && <span>Gender: {user?.gender}</span>}
                          {user?.language && <span>Language: {user?.language}</span>}
                          {user?.plan && <span>Plan: {user?.plan}</span>}
                        </div>
                      </div>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-[#0D9488] text-sm font-medium hover:underline"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          disabled={!isEditing}
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0D9488] disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          disabled={true} // Email cannot be changed
                          value={formData.email}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0D9488] disabled:opacity-60 disabled:cursor-not-allowed"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          disabled={!isEditing}
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0D9488] disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                        <select
                          disabled={!isEditing}
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0D9488] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          disabled={!isEditing}
                          value={formData.birth_day ? new Date(formData.birth_day).toISOString().split('T')[0] : ''}
                          onChange={(e) => setFormData({ ...formData, birth_day: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0D9488] disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Language Preference</label>
                        <select
                          disabled={!isEditing}
                          value={formData.language}
                          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0D9488] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <option value="english">English</option>
                          <option value="bangla">Bangla</option>
                        </select>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex gap-4 pt-4">
                        <button type="submit" className="bg-[#0D9488] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#0f766e]">
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Security Settings</h2>

                  {/* Security Sub-tabs */}
                  <div className="flex border-b border-slate-200 mb-6">
                    <button
                      onClick={() => setSecurityTab('password')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${securityTab === 'password'
                        ? 'border-[#0D9488] text-[#0D9488]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      <Lock className="w-4 h-4 inline mr-2" />
                      Change Password
                    </button>
                  </div>

                  {/* Password Change Tab */}
                  {securityTab === 'password' && (
                    <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                        <div className="relative">
                          <input
                            data-field="old_password"
                            type={showPasswords.old ? 'text' : 'password'}
                            value={passwordData.old_password}
                            onChange={(e) => {
                              setPasswordData({ ...passwordData, old_password: e.target.value });
                              // Clear error when user starts typing
                              if (fieldErrors.old_password) {
                                setFieldErrors({ ...fieldErrors, old_password: undefined });
                              }
                            }}
                            className={`password-input w-full px-4 py-2 pr-10 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-[#0D9488] ${fieldErrors.old_password ? 'border-red-500' : 'border-slate-200'
                              }`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPasswords.old ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {fieldErrors.old_password && (
                          <div className="text-red-500 text-xs mt-1 animate-fade-in">
                            {fieldErrors.old_password}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                        <div className="relative">
                          <input
                            data-field="new_password"
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.new_password}
                            onChange={(e) => {
                              setPasswordData({ ...passwordData, new_password: e.target.value });
                              // Clear error when user starts typing
                              if (fieldErrors.new_password) {
                                setFieldErrors({ ...fieldErrors, new_password: undefined });
                              }
                            }}
                            className={`password-input w-full px-4 py-2 pr-10 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-[#0D9488] ${fieldErrors.new_password ? 'border-red-500' : 'border-slate-200'
                              }`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {fieldErrors.new_password && (
                          <div className="text-red-500 text-xs mt-1 animate-fade-in">
                            {fieldErrors.new_password}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                        <div className="relative">
                          <input
                            data-field="confirm_password"
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordData.confirm_password}
                            onChange={(e) => {
                              setPasswordData({ ...passwordData, confirm_password: e.target.value });
                              // Clear error when user starts typing
                              if (fieldErrors.confirm_password) {
                                setFieldErrors({ ...fieldErrors, confirm_password: undefined });
                              }
                            }}
                            className={`password-input w-full px-4 py-2 pr-10 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-[#0D9488] ${fieldErrors.confirm_password ? 'border-red-500' : 'border-slate-200'
                              }`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {fieldErrors.confirm_password && (
                          <div className="text-red-500 text-xs mt-1 animate-fade-in">
                            {fieldErrors.confirm_password}
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="bg-[#0D9488] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#0f766e]"
                      >
                        Update Password
                      </button>

                      <div className="pt-6 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">Forgot your password?</h4>
                            <p className="text-xs text-slate-500">You can reset your password via your registered email address.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowForgotPasswordModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                            Reset via Email
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {activeTab === 'api' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">API Keys Management</h2>

                  {/* API Keys Section - No sub-tabs needed */}
                  <div className="space-y-6">

                    {/* API Keys Management */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">Your API Keys</h3>
                          <p className="text-sm text-slate-600">Manage your API keys for external integrations</p>
                        </div>
                        <button
                          onClick={() => setShowNewKeyForm(!showNewKeyForm)}
                          className="bg-[#0D9488] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0f766e] flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add New Key
                        </button>
                      </div>

                      {/* Add API Key Modal */}
                      {showNewKeyForm && (
                        <div
                          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                          onClick={() => setShowNewKeyForm(false)}
                        >
                          <div
                            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-slate-900">Add New API Key</h3>
                              <button
                                onClick={() => {
                                  setShowNewKeyForm(false);
                                  setNewApiKeyInput('');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                  API Key
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter your Gemini API key"
                                  value={newApiKeyInput}
                                  onChange={(e) => setNewApiKeyInput(e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488]"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                  Get your API key from Google AI Studio
                                </p>
                              </div>

                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Key className="w-3 h-3 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-sm font-medium text-blue-900 mb-1">How to get your API Key</h4>
                                    <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                                      <li>Go to <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Google AI Studio</a></li>
                                      <li>Create a new project or select existing one</li>
                                      <li>Click on "Get API Key" in the sidebar</li>
                                      <li>Copy your API key and paste it here</li>
                                    </ol>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                              <button
                                onClick={handleAddApiKey}
                                disabled={!newApiKeyInput.trim()}
                                className="flex-1 bg-[#0D9488] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0f766e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                Add API Key
                              </button>
                              <button
                                onClick={() => {
                                  setShowNewKeyForm(false);
                                  setNewApiKeyInput('');
                                }}
                                className="flex-1 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* API Keys List */}
                      <div className="space-y-4">
                        {apiKeys.map((key) => (
                          <div key={key.id} className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${key.worker_status === 'RUNNING' ? 'ring-2 ring-purple-200' : ''
                            }`}>
                            {/* Loading Overlay for RUNNING status */}
                            {key.worker_status === 'RUNNING' && (
                              <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-10 backdrop-blur-sm">
                                <div className="text-center">
                                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                  <p className="text-purple-700 font-semibold text-lg">Testing API Key...</p>
                                  <p className="text-purple-600 text-sm">Validating Gemini models</p>
                                </div>
                              </div>
                            )}

                            <div className={`p-6 transition-opacity ${key.worker_status === 'RUNNING' ? 'opacity-30' : 'opacity-100'}`}>
                              {/* Header */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-4 h-4 rounded-full ${key.is_working ? 'bg-green-500' : 'bg-red-500'
                                    }`}></div>
                                  <h3 className="font-semibold text-gray-900 text-lg">API Key</h3>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${key.is_working
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                    }`}>
                                    {key.is_working ? 'Active' : 'Inactive'}
                                  </span>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${key.worker_status === 'COMPLETED'
                                    ? 'bg-blue-100 text-blue-700'
                                    : key.worker_status === 'PENDING'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : key.worker_status === 'RUNNING'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                    {key.worker_status === 'COMPLETED' ? 'Ready' :
                                      key.worker_status === 'PENDING' ? 'Pending' :
                                        key.worker_status === 'RUNNING' ? 'Testing' :
                                          key.worker_status === 'FAILED' ? 'Failed' : 'Unknown'}
                                  </span>
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedApiKey(key);
                                      setShowDetailsModal(true);
                                    }}
                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="View Details"
                                    disabled={key.worker_status === 'RUNNING'}
                                  >
                                    <Database className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setKeyToDelete(key);
                                      setShowDeleteModal(true);
                                    }}
                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete API Key"
                                    disabled={key.worker_status === 'RUNNING'}
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>

                              {/* Content Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* API Key Section */}
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">API Key</label>
                                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-center gap-2">
                                      <code className="font-mono text-sm text-gray-700 flex-1 break-all">
                                        {showFullKey[key.id] ? key.api_key : '•'.repeat(Math.min(key.api_key?.length || 24, 24))}
                                      </code>
                                      <button
                                        onClick={() => setShowFullKey(prev => ({ ...prev, [key.id]: !prev[key.id] }))}
                                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                        title={showFullKey[key.id] ? "Hide Key" : "Show Key"}
                                      >
                                        <Eye className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Usage Section */}
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</label>
                                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="text-2xl font-bold text-gray-900">
                                          {key.total_used || 0}
                                        </div>
                                        <div className="text-xs text-gray-500">API calls</div>
                                      </div>
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${key.is_working ? 'bg-green-100' : 'bg-red-100'
                                        }`}>
                                        <div className={`w-3 h-3 rounded-full ${key.is_working ? 'bg-green-500' : 'bg-red-500'
                                          }`}></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Status Section */}
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-center gap-2">
                                      {key.worker_status === 'PENDING' && (
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                      )}
                                      {key.worker_status === 'RUNNING' && (
                                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                                      )}
                                      {key.worker_status === 'COMPLETED' && (
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                      )}
                                      {key.worker_status === 'FAILED' && (
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                      )}
                                      <span className={`text-sm font-medium ${key.worker_status === 'COMPLETED' ? 'text-blue-700' :
                                        key.worker_status === 'PENDING' ? 'text-yellow-700' :
                                          key.worker_status === 'RUNNING' ? 'text-purple-700' :
                                            'text-red-700'
                                        }`}>
                                        {key.worker_status === 'COMPLETED' ? 'Ready to use' :
                                          key.worker_status === 'PENDING' ? 'Waiting to test' :
                                            key.worker_status === 'RUNNING' ? 'Testing in progress' :
                                              key.worker_status === 'FAILED' ? 'Testing failed' : 'Unknown'}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Created {new Date(key.created_at).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {apiKeys.length === 0 && (
                          <div className="text-center py-8 text-slate-500">
                            <Key className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p>No API keys yet. Add your first API key to get started.</p>
                          </div>
                        )}
                      </div>

                      {/* Auto-reload indicator */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${apiKeys.some((key) => key.worker_status === 'RUNNING' || key.worker_status === 'PENDING')
                            ? 'bg-yellow-500 animate-pulse'
                            : 'bg-green-500'
                            }`}></div>
                          <span className="text-sm text-gray-600">
                            {apiKeys.some((key) => key.worker_status === 'RUNNING' || key.worker_status === 'PENDING')
                              ? 'Testing in progress...'
                              : 'All keys ready'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Last updated: {new Date().toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    {/* API Details Modal */}
                    {showDetailsModal && selectedApiKey && (
                      <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => {
                          setShowDetailsModal(false);
                          setSelectedApiKey(null);
                        }}
                      >
                        <div
                          className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
                          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
                        >
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-slate-900">API Key Details</h3>
                            <button
                              onClick={() => {
                                setShowDetailsModal(false);
                                setSelectedApiKey(null);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="space-y-8">
                            {/* Status Overview */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full ${selectedApiKey.is_working ? 'bg-green-500' : 'bg-red-500'
                                  }`}></div>
                                API Key Status
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                  <div className="text-3xl font-bold text-gray-900">
                                    {selectedApiKey.total_used || 0}
                                  </div>
                                  <div className="text-sm text-gray-600">Total API Calls</div>
                                </div>
                                <div className="text-center">
                                  <div className={`text-lg font-semibold ${selectedApiKey.is_working ? 'text-green-700' : 'text-red-700'
                                    }`}>
                                    {selectedApiKey.is_working ? 'Working' : 'Not Working'}
                                  </div>
                                  <div className="text-sm text-gray-600">Key Status</div>
                                </div>
                                <div className="text-center">
                                  <div className={`text-lg font-semibold ${selectedApiKey.worker_status === 'COMPLETED' ? 'text-blue-700' :
                                    selectedApiKey.worker_status === 'PENDING' ? 'text-yellow-700' :
                                      selectedApiKey.worker_status === 'RUNNING' ? 'text-purple-700' :
                                        'text-red-700'
                                    }`}>
                                    {selectedApiKey.worker_status === 'COMPLETED' ? 'Ready' :
                                      selectedApiKey.worker_status === 'PENDING' ? 'Pending' :
                                        selectedApiKey.worker_status === 'RUNNING' ? 'Testing' :
                                          selectedApiKey.worker_status === 'FAILED' ? 'Failed' : 'Unknown'}
                                  </div>
                                  <div className="text-sm text-gray-600">Worker Status</div>
                                </div>
                              </div>
                            </div>

                            {/* API Key Display */}
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 mb-3">API Key</h4>
                              <div className="bg-gray-900 text-gray-100 rounded-xl p-4 border border-gray-800">
                                <div className="font-mono text-sm break-all">
                                  {selectedApiKey.api_key}
                                </div>
                              </div>
                            </div>

                            {/* Available AI Models - Enhanced Cool Design */}
                            {selectedApiKey.meta_data && (
                              <div>
                                <div className="flex items-center gap-3 mb-6">
                                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                                    <Brain className="w-4 h-4 text-white" />
                                  </div>
                                  <h4 className="text-xl font-bold text-gray-900">Available AI Models</h4>
                                  <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-blue-200"></div>
                                </div>

                                {(() => {
                                  let metaData = selectedApiKey.meta_data;
                                  if (typeof metaData === 'string') {
                                    try {
                                      metaData = JSON.parse(metaData);
                                    } catch (e) {
                                      return null;
                                    }
                                  }
                                  const models = metaData.models || {};

                                  return (
                                    <div className="space-y-4">
                                      {Object.entries(models).map(([engine, isActive]: [string, any]) => (
                                        <div key={engine} className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${isActive
                                          ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 border-transparent shadow-xl hover:shadow-2xl transform hover:-translate-y-1'
                                          : 'bg-gray-100 border-gray-300 opacity-70'
                                          }`}>
                                          {/* Active Model Glow Effect */}
                                          {isActive && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 animate-pulse"></div>
                                          )}

                                          <div className="relative p-6">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-4">
                                                {/* Model Icon */}
                                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isActive
                                                  ? 'bg-white/20 backdrop-blur-sm shadow-lg'
                                                  : 'bg-gray-200'
                                                  }`}>
                                                  {isActive ? (
                                                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center">
                                                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                      </svg>
                                                    </div>
                                                  ) : (
                                                    <div className="w-8 h-8 bg-gray-300 rounded-xl flex items-center justify-center">
                                                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                      </svg>
                                                    </div>
                                                  )}
                                                </div>

                                                {/* Model Info */}
                                                <div>
                                                  <h5 className={`text-xl font-bold mb-2 ${isActive ? 'text-white' : 'text-gray-700'
                                                    }`}>
                                                    {engine.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                  </h5>
                                                  <div className="flex items-center gap-3">
                                                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${isActive
                                                      ? 'bg-white/20 text-white backdrop-blur-sm border border-white/30'
                                                      : 'bg-gray-200 text-gray-600'
                                                      }`}>
                                                      {isActive ? 'Available' : 'Unavailable'}
                                                    </span>
                                                    {isActive && (
                                                      <div className="flex items-center gap-2 text-white/90">
                                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                        <span className="text-sm font-medium">Ready to use</span>
                                                      </div>
                                                    )}
                                                    {!isActive && (
                                                      <div className="flex items-center gap-2 text-gray-500">
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                        <span className="text-sm font-medium">Not supported</span>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Status Icon */}
                                              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isActive
                                                ? 'bg-white/20 backdrop-blur-sm'
                                                : 'bg-gray-200'
                                                }`}>
                                                {isActive ? (
                                                  <Zap className="w-6 h-6 text-white" />
                                                ) : (
                                                  <X className="w-6 h-6 text-gray-400" />
                                                )}
                                              </div>
                                            </div>

                                            {/* Active Model Shine Effect */}
                                            {isActive && (
                                              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>
                            )}

                            {/* Created Date */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700">Created Date</h4>
                                  <div className="text-lg text-gray-900 mt-1">
                                    {new Date(selectedApiKey.created_at).toLocaleString()}
                                  </div>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* API Management Actions */}
                          <div className="flex gap-3 mt-6">
                            <button
                              onClick={() => {
                                setShowDetailsModal(false);
                                setSelectedApiKey(null);
                              }}
                              className="flex-1 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && keyToDelete && (
                      <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => {
                          setShowDeleteModal(false);
                          setKeyToDelete(null);
                        }}
                      >
                        <div
                          className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
                          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
                        >
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-slate-900">Delete API Key</h3>
                            <button
                              onClick={() => {
                                setShowDeleteModal(false);
                                setKeyToDelete(null);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                  <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-red-900">Are you sure?</h4>
                                  <p className="text-sm text-red-700 mt-1">
                                    This action cannot be undone. This will permanently delete the API key and remove all associated data.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">API Key:</span>
                                <code className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">
                                  {keyToDelete.api_key ? keyToDelete.api_key.substring(0, 8) + '...' : 'Loading...'}
                                </code>
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Created:</span> {new Date(keyToDelete.created_at).toLocaleDateString()}
                              </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                              <button
                                onClick={() => {
                                  setShowDeleteModal(false);
                                  setKeyToDelete(null);
                                }}
                                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  deleteApiKey(keyToDelete.id);
                                  setShowDeleteModal(false);
                                  setKeyToDelete(null);
                                }}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                              >
                                Delete API Key
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Current Subscription</h2>
                  <div className="bg-teal-50 border border-teal-100 rounded-xl p-6 mb-8 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-teal-800 uppercase tracking-wide">Current Plan</div>
                      <div className="text-2xl font-bold text-slate-900 mt-1">Free Basic</div>
                      <p className="text-sm text-slate-600 mt-1">Limited to 5 AI consultations per month.</p>
                    </div>
                    <button className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-teal-600/20 hover:bg-teal-700">
                      Upgrade to Pro
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
        <ForgotPasswordModal
          isOpen={showForgotPasswordModal}
          onClose={() => setShowForgotPasswordModal(false)}
        />
      </div>
    </>
  );
};

export default SettingsPage;