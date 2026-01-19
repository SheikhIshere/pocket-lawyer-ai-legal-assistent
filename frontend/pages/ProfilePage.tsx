import React, { useState } from 'react';
import { Header, Footer } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { accountService } from '../services/api';
import { User, Lock, FileText, Settings, CreditCard, LogOut, Camera } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
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
      const updated = await accountService.updateProfile(formData);
      // Update user state with new data
      const updatedUser = {
        ...user,
        full_name: updated.full_name,
        name: updated.full_name, // backward compatibility
        email: user?.email || '', // Email comes from user model, not account
        phone: updated.phone || user?.phone || '',
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Account Settings</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
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
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
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
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0D9488] disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                      <select 
                        disabled={!isEditing}
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
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
                        onChange={(e) => setFormData({...formData, birth_day: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0D9488] disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Language Preference</label>
                      <select 
                        disabled={!isEditing}
                        value={formData.language}
                        onChange={(e) => setFormData({...formData, language: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0D9488] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <option value="english">English</option>
                        <option value="spanish">Spanish</option>
                        <option value="french">French</option>
                        <option value="german">German</option>
                        <option value="chinese">Chinese</option>
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
                 <form className="space-y-6 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                      <input type="password" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                      <input type="password" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                      <div className="h-1 w-full bg-slate-100 mt-2 rounded-full overflow-hidden">
                        <div className="h-full w-1/4 bg-red-500"></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Weak password</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                      <input type="password" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                    </div>
                    <button className="bg-teal-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-teal-700">
                      Update Password
                    </button>
                 </form>
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
      <Footer />
    </div>
  );
};

export default ProfilePage;