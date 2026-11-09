import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Crown, Star, Lock, Check } from 'lucide-react';

const PremiumPage: React.FC = () => {
  const { user } = useAuth();
  
  const features = [
    { name: 'Unlimited Legal Documents', available: true },
    { name: 'Priority Support', available: true },
    { name: 'Advanced AI Analysis', available: true },
    { name: 'Custom Templates', available: true },
    { name: 'API Access', available: false },
    { name: 'White-label Solutions', available: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg mb-6">
            <Crown className="w-5 h-5" />
            Premium Features
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Premium, {user?.full_name || user?.name}!
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            You now have access to exclusive legal tools and priority support designed for professionals.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-100 dark:border-slate-800 p-6 transition-all duration-200 ${
                feature.available 
                  ? 'border-gray-200 dark:border-slate-800 hover:shadow-lg hover:border-teal-300' 
                  : 'border-gray-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                {feature.available ? (
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {feature.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                {feature.available 
                  ? 'This feature is available with your current plan.'
                  : 'Upgrade to Professional to unlock this feature.'
                }
              </p>
            </div>
          ))}
        </div>

        {/* Upgrade CTA */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-700 rounded-2xl p-8 text-white text-center shadow-xl">
          <Star className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Need More Power?</h2>
          <p className="text-teal-100 mb-6 max-w-lg mx-auto">
            Upgrade to Professional to unlock advanced features,
            priority support, and unlimited access to all legal tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pricing" className="px-8 py-3 bg-white text-teal-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center">
              View All Plans
            </Link>
            <Link to="/contact" className="px-8 py-3 bg-teal-800 text-white rounded-lg font-semibold hover:bg-teal-900 transition-colors border border-teal-600 text-center">
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;
