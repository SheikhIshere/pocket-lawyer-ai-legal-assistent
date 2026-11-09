import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Header and Footer are now globally handled by Layout in App.tsx
import {
  Check, X, Star, Users, Briefcase, Scale, Shield,
  Sparkles, Zap, ShieldCheck, ArrowRight, ZapOff
} from 'lucide-react';

const PRICING_PLANS = [
  {
    id: 1,
    name: 'Starter',
    price: 29,
    period: 'month',
    description: 'Perfect for individuals seeking professional AI legal guidance',
    features: [
      '5 AI consultations per month',
      'Basic document review',
      'Email support',
      'Legal templates library',
      'Basic research tools'
    ],
    notIncluded: [
      'Priority support',
      'Advanced document analysis',
      'Live chat support',
      'Custom legal advice'
    ],
    popular: false,
    icon: Users,
    color: 'teal'
  },
  {
    id: 2,
    name: 'Professional',
    price: 79,
    period: 'month',
    description: 'Ideal for professionals and growing small businesses',
    features: [
      'Unlimited AI consultations',
      'Advanced document analysis',
      'Priority email support',
      'Live chat support',
      'Custom legal templates',
      'Contract review tools',
      'Legal research database'
    ],
    notIncluded: [
      'Phone support',
      'Dedicated legal advisor',
      'Custom workflow automation'
    ],
    popular: true,
    icon: Briefcase,
    color: 'emerald'
  }
];

const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getAnnualPrice = (monthlyPrice: number) => Math.floor(monthlyPrice * 12 * 0.8); // 20% discount

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors duration-500 pb-20 lg:pb-0">
      <main className="flex-grow">
        {/* Hero Section - MD3 Style */}
        <div className="relative pt-24 pb-16 px-4 overflow-hidden">
          {/* Animated Background Accents */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-900/30 rounded-full mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-black text-teal-700 dark:text-teal-400 uppercase tracking-widest">Transparent Intelligence</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Plans That <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600">Empower Justice</span>
            </h1>

            <p className="text-lg md:text-2xl text-slate-500 dark:text-gray-400 font-medium max-w-2xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              No hidden fees. No complicated contracts. Just professional AI
              legal assistance whenever you need it.
            </p>

            {/* Premium Billing Toggle */}
            <div className="inline-flex items-center gap-1 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-[2rem] border border-slate-200/50 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-8 py-3 rounded-full text-sm font-black transition-all ${billingCycle === 'monthly'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-8 py-3 rounded-full text-sm font-black transition-all flex items-center gap-2 ${billingCycle === 'annual'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
              >
                Annual
                <span className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded-full text-[10px] uppercase">Save 20%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards - MD3 Surface Overhaul */}
        <div className="max-w-7xl mx-auto px-4 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto gap-8">
            {PRICING_PLANS.map((plan) => {
              const displayPrice = billingCycle === 'annual' ? getAnnualPrice(plan.price) : plan.price;
              const displayPeriod = billingCycle === 'annual' ? 'year' : 'month';

              return (
                <div
                  key={plan.id}
                  className={`group relative flex flex-col p-10 rounded-[3rem] transition-all duration-500 border-2 ${plan.popular
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-2xl scale-105 z-10'
                      : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-100 dark:border-slate-800 hover:border-teal-500/30'
                    }`}
                >
                  {plan.popular && (
                    <div className="absolute top-8 right-8">
                      <Zap className="w-10 h-10 text-teal-400 dark:text-teal-600 animate-pulse" />
                    </div>
                  )}

                  <div className="mb-10">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${plan.popular
                        ? 'bg-teal-500/20 text-white dark:bg-teal-100 dark:text-teal-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400'
                      }`}>
                      <plan.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-black tracking-tighter mb-2">{plan.name}</h3>
                    <p className={`text-sm font-medium ${plan.popular ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500'}`}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-10">
                    <div className="flex items-baseline gap-1">
                      <span className="text-6xl font-black tracking-tighter">${displayPrice}</span>
                      <span className={`text-lg font-medium ${plan.popular ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500'}`}>/{displayPeriod}</span>
                    </div>
                    {billingCycle === 'annual' && (
                      <p className={`text-sm font-black mt-2 ${plan.popular ? 'text-teal-400' : 'text-teal-600'}`}>
                        Save ${plan.price * 12 - displayPrice} / year
                      </p>
                    )}
                  </div>

                  <div className="space-y-5 mb-12 flex-grow">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`mt-1 flex-shrink-0 ${plan.popular ? 'text-teal-400' : 'text-teal-600'}`}>
                          <Check className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-sm tracking-tight">{feature}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 opacity-30">
                        <div className="mt-1 flex-shrink-0">
                          <ZapOff className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-sm tracking-tight line-through">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate(isAuthenticated ? '/settings?tab=billing' : '/register')}
                    className={`w-full py-5 rounded-[1.75rem] font-black text-lg transition-all active:scale-95 ${plan.popular
                        ? 'bg-teal-500 text-white dark:bg-teal-600 hover:shadow-xl hover:shadow-teal-500/30'
                        : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-teal-600 hover:text-white dark:hover:bg-teal-500'
                      }`}
                  >
                    Get Started Now
                  </button>

                  {plan.popular && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-teal-500 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">
                      Most popular
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Feature Comparison - MD3 Refinement */}
          <div className="mt-32">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Deep Comparison</h2>
              <p className="text-lg text-slate-500 dark:text-gray-500 font-medium">Verify every feature and capability</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <th className="p-8 font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">Core Capabilities</th>
                      <th className="p-8 text-center font-black text-slate-900 dark:text-white tracking-widest uppercase text-xs">Starter</th>
                      <th className="p-8 text-center font-black text-teal-600 dark:text-teal-400 tracking-widest uppercase text-xs">Professional</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { feature: 'AI Consultations', starter: '5 / month', pro: 'Unlimited' },
                      { feature: 'Document Analysis', starter: 'Basic PDF', pro: 'Advanced OCR' },
                      { feature: 'Support Level', starter: 'Email Only', pro: '24/7 Live Chat' },
                      { feature: 'Custom Templates', starter: 'Limited', pro: 'Full Library' },
                      { feature: 'Search History', starter: '30 Days', pro: 'Unlimited' },
                      { feature: 'API Connectivity', starter: '-', pro: '-' }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-8 font-bold text-slate-900 dark:text-white">{row.feature}</td>
                        <td className="p-8 text-center text-slate-500 dark:text-gray-400 font-medium">{row.starter}</td>
                        <td className="p-8 text-center font-black text-slate-900 dark:text-white">{row.pro}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* FAQ - Android Style Bottom Sheet Cards */}
          <div className="mt-32">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">FAQ</h2>
              <p className="text-lg text-slate-500 dark:text-gray-500 font-medium">Clear answers to common questions</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  question: 'Can I switch plans instantly?',
                  answer: 'Absolutely. Upgrades occur immediately, while downgrades take effect at the end of your current cycle.'
                },
                {
                  question: 'Is my data legally secure?',
                  answer: 'Your consultations stay in your account and are only accessible after you sign in.'
                },
                {
                  question: 'How does the free trial work?',
                  answer: 'Sign up for any plan and get 14 days full access. No payment required until the trial ends.'
                },
                {
                  question: 'Do you offer seasonal discounts?',
                  answer: 'Our Annual billing already includes a permanent 20% discount. Special firm deals are available via Sales.'
                }
              ].map((faq, i) => (
                <div key={i} className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group hover:border-teal-500 transition-all">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center text-xs">Q</span>
                    {faq.question}
                  </h3>
                  <p className="text-slate-500 dark:text-gray-400 font-medium leading-relaxed pl-11">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA - MD3 Hero Integration */}
          <div className="mt-32 relative group overflow-hidden bg-slate-900 dark:bg-white p-16 md:p-24 rounded-[4rem] text-center shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-indigo-500/20 opacity-50"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black text-white dark:text-slate-900 mb-8 tracking-tighter leading-tight">
                Ready to Join <br />
                <span className="text-teal-400 dark:text-teal-600">The Legal Revolution?</span>
              </h2>
              <p className="text-xl text-slate-400 dark:text-slate-500 font-medium mb-12">
                Start with a free account and upgrade when you need more.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  to={isAuthenticated ? '/chat' : '/register'}
                  className="px-10 py-5 bg-teal-500 text-white rounded-[2rem] text-lg font-black shadow-xl shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/contact"
                  className="px-10 py-5 bg-transparent text-white dark:text-slate-900 border-2 border-white/20 dark:border-slate-200 rounded-[2rem] text-lg font-black hover:bg-white/10 transition-all"
                >
                  Talk to Sales
                </Link>
              </div>
            </div>

            {/* Animated Ornament */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px]" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PricingPage;
