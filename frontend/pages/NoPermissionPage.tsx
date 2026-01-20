import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Home, User, AlertTriangle, Mail } from 'lucide-react';

const NoPermissionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto px-6">
        {/* Error Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-orange-50 rounded-full flex items-center justify-center shadow-lg border-2 border-red-200">
            <Lock className="w-12 h-12 text-red-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center border-3 border-white shadow-md animate-pulse">
            <span className="text-white text-sm font-bold">403</span>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          You don't have permission to access this page or resource.
        </p>

        {/* Possible Reasons */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Why this happened?
          </h2>
          <ul className="text-left space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Your account doesn't have the required permissions</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>You need to log in to access this resource</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Your session may have expired</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>This is a premium feature for paid plans</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0E8E82] to-[#0a6d62] text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            <User className="w-4 h-4" />
            Sign In
          </Link>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Need Help?
          </h3>
          <p className="text-gray-600 mb-4">
            If you believe this is an error or need assistance with permissions, 
            please contact our support team.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoPermissionPage;
