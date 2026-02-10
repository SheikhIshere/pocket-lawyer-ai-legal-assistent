import React from 'react';
import { Scale } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#0E8E82] to-[#0a6d62] p-4 rounded-2xl shadow-xl animate-pulse">
            <Scale className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#0a6d62] rounded-full border-2 border-white animate-ping"></div>
        </div>

        {/* Loading Spinner */}
        <div className="w-16 h-16 border-4 border-[#0E8E82]/20 border-t-[#0E8E82] animate-spin rounded-full mx-auto mb-6"></div>

        {/* Loading Text */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-800">Loading PocketLawyer</h2>
          <p className="text-gray-600 max-w-sm mx-auto">
            Please wait while we verify your session and prepare your workspace...
          </p>
        </div>

        {/* Progress Indicators */}
        <div className="mt-8 space-y-2 max-w-xs mx-auto">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="w-2 h-2 bg-[#0E8E82] rounded-full animate-pulse"></div>
            <span>Verifying authentication</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
            <span>Loading user data</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
            <span>Preparing interface</span>
          </div>
        </div>

        {/* Branding */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-400 font-medium">
            PocketLawyer AI Legal Assistant
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Secure • Fast • Reliable
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
