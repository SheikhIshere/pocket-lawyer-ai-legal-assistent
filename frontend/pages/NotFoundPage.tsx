import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, FileQuestion } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto px-6">
        {/* Error Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
            <FileQuestion className="w-12 h-12 text-gray-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-3 border-white shadow-md">
            <span className="text-white text-sm font-bold">404</span>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Oops! The page you're looking for seems to have vanished into the digital void.
        </p>

        {/* Possible Solutions */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-600" />
            What can you do?
          </h2>
          <ul className="text-left space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-teal-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Check the URL for typos or errors</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-teal-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Use the navigation menu to find what you need</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-teal-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Return to the dashboard and start fresh</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0E8E82] to-[#0a6d62] text-white rounded-lg hover:opacity-90 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500 mt-8">
          If you believe this is an error, please contact our 
          <a href="/contact" className="text-teal-600 hover:text-teal-700 font-medium"> support team</a>
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
