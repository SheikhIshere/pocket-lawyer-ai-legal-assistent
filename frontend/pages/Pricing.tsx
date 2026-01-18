import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const Pricing = () => {
  return (
    <div className="bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-slate-600">Choose the plan that fits your legal needs.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Basic */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Basic</h3>
            <p className="text-slate-500 mb-6">For general queries.</p>
            <div className="text-4xl font-bold text-slate-900 mb-6">BDT 0<span className="text-lg text-slate-500 font-normal">/mo</span></div>
            <Link to="/register" className="block w-full text-center py-3 bg-slate-100 text-slate-800 font-bold rounded-xl hover:bg-slate-200 transition">Start Free</Link>
            <ul className="mt-8 space-y-4">
              <li className="flex items-center text-slate-700"><Check className="text-green-500 mr-2" size={20} /> Basic AI Chat</li>
              <li className="flex items-center text-slate-700"><Check className="text-green-500 mr-2" size={20} /> Text-only guidance</li>
              <li className="flex items-center text-slate-700"><Check className="text-green-500 mr-2" size={20} /> Limited queries (5/mo)</li>
            </ul>
          </div>

          {/* Pro */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-primary-500 relative transform md:-translate-y-4">
            <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">POPULAR</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Pro</h3>
            <p className="text-slate-500 mb-6">For detailed analysis.</p>
            <div className="text-4xl font-bold text-slate-900 mb-6">BDT 700<span className="text-lg text-slate-500 font-normal">/mo</span></div>
            <Link to="/payment" className="block w-full text-center py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition shadow-lg">Upgrade to Pro</Link>
            <ul className="mt-8 space-y-4">
              <li className="flex items-center text-slate-700"><Check className="text-green-500 mr-2" size={20} /> Unlimited AI Queries</li>
              <li className="flex items-center text-slate-700"><Check className="text-green-500 mr-2" size={20} /> Document Analysis</li>
              <li className="flex items-center text-slate-700"><Check className="text-green-500 mr-2" size={20} /> Advanced AI Models</li>
            </ul>
          </div>

          {/* Premium */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Premium</h3>
            <p className="text-slate-500 mb-6">For complete peace of mind.</p>
            <div className="text-4xl font-bold text-slate-900 mb-6">BDT 1000<span className="text-lg text-slate-500 font-normal">/mo</span></div>
            <Link to="/payment" className="block w-full text-center py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition">Go Premium</Link>
            <ul className="mt-8 space-y-4">
              <li className="flex items-center text-slate-700"><Check className="text-green-500 mr-2" size={20} /> Everything in Pro</li>
              <li className="flex items-center text-slate-700"><Check className="text-green-500 mr-2" size={20} /> Live Lawyer Chat</li>
              <li className="flex items-center text-slate-700"><Check className="text-green-500 mr-2" size={20} /> Priority Support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;