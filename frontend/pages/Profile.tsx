import React, { useState } from 'react';
import { useAuth } from '../App';
import { Link } from 'react-router-dom';
import { User, Settings, FileText, Clock, CreditCard, Shield, ChevronRight, Download } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) return null;

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">My Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-6 text-center border-b border-slate-100">
                 <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                   {user.name.charAt(0)}
                 </div>
                 <h2 className="font-bold text-slate-900">{user.name}</h2>
                 <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full uppercase">
                   {user.plan} Plan
                 </span>
               </div>
               <nav className="p-2 space-y-1">
                 {[
                   { id: 'overview', label: 'Overview', icon: User },
                   { id: 'documents', label: 'Documents', icon: FileText },
                   { id: 'history', label: 'Consultation History', icon: Clock },
                   { id: 'billing', label: 'Subscription', icon: CreditCard },
                   { id: 'settings', label: 'Security & Settings', icon: Settings },
                 ].map((item) => (
                   <button
                     key={item.id}
                     onClick={() => setActiveTab(item.id)}
                     className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition ${
                       activeTab === item.id ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
                     }`}
                   >
                     <item.icon size={18} className="mr-3" />
                     {item.label}
                   </button>
                 ))}
               </nav>
             </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-sm mb-1">Total Consultations</p>
                    <p className="text-3xl font-bold text-slate-900">12</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-sm mb-1">Documents Analyzed</p>
                    <p className="text-3xl font-bold text-slate-900">5</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-sm mb-1">Plan Status</p>
                    <p className="text-3xl font-bold text-green-600">Active</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                       <div>
                         <p className="font-medium text-slate-800">Chat: Rental Agreement Query</p>
                         <p className="text-xs text-slate-500">Today, 10:23 AM</p>
                       </div>
                       <Link to="/chat" className="text-primary-600 text-sm hover:underline">View</Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-bold text-slate-900 mb-6">My Documents</h3>
                  <div className="space-y-3">
                     {[1, 2].map(i => (
                       <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="flex items-center space-x-4">
                            <div className="bg-white p-2 rounded shadow-sm text-red-500"><FileText size={20} /></div>
                            <div>
                               <p className="font-medium text-slate-900">Contract_Draft_v{i}.pdf</p>
                               <p className="text-xs text-slate-500">Analyzed on Oct 24, 2023</p>
                            </div>
                          </div>
                          <button className="text-slate-400 hover:text-primary-600"><Download size={20} /></button>
                       </div>
                     ))}
                  </div>
               </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                 <div>
                    <h3 className="font-bold text-slate-900 mb-4">Account Security</h3>
                    <div className="flex items-center justify-between py-4 border-b border-slate-100">
                       <div>
                          <p className="font-medium text-slate-800">Password</p>
                          <p className="text-sm text-slate-500">Last changed 3 months ago</p>
                       </div>
                       <Link to="/change-password" className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">Change</Link>
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-slate-100">
                       <div>
                          <p className="font-medium text-slate-800">Two-Factor Authentication</p>
                          <p className="text-sm text-slate-500">Add an extra layer of security</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                    </div>
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-900 mb-4">Personal Details</h3>
                   <div className="grid md:grid-cols-2 gap-4">
                      <Link to="/edit-profile" className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-primary-500 group">
                         <span className="text-slate-700">Edit Profile Info</span>
                         <ChevronRight size={18} className="text-slate-400 group-hover:text-primary-600" />
                      </Link>
                   </div>
                 </div>
              </div>
            )}

            {activeTab === 'billing' && (
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center">
                  <div className="mb-6">
                    <p className="text-slate-500">Current Plan</p>
                    <h3 className="text-2xl font-bold text-slate-900">{user.plan.toUpperCase()}</h3>
                  </div>
                  <Link to="/pricing" className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-700">
                    Upgrade Plan
                  </Link>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;