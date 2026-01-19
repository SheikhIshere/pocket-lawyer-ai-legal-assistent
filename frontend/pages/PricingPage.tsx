import React, { useState } from 'react';
import { Header, Footer } from '../components/Layout';
import { Check, X, Star, Users, FileText, Briefcase, Scale, Shield } from 'lucide-react';

const PRICING_PLANS = [
  {
    id: 1,
    name: 'Starter',
    price: 29,
    period: 'month',
    description: 'Perfect for individuals seeking basic legal guidance',
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
    icon: Users
  },
  {
    id: 2,
    name: 'Professional',
    price: 79,
    period: 'month',
    description: 'Ideal for professionals and small businesses',
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
    icon: Briefcase
  },
  {
    id: 3,
    name: 'Enterprise',
    price: 199,
    period: 'month',
    description: 'Comprehensive solution for large organizations',
    features: [
      'Everything in Professional',
      'Unlimited everything',
      'Phone support',
      'Dedicated legal advisor',
      'Custom workflow automation',
      'API access',
      'White-label options',
      'Priority processing',
      'Custom integrations'
    ],
    notIncluded: [],
    popular: false,
    icon: Scale
  }
];

const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  const getAnnualPrice = (monthlyPrice: number) => Math.floor(monthlyPrice * 12 * 0.8); // 20% discount

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#0D9488] via-[#1e293b] to-[#0D9488] py-16 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D9488]/10 to-transparent"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white to-[#e2e8f0] bg-clip-text text-transparent">
              Choose Your Legal Plan
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Transparent pricing with no hidden fees. Start with a free trial, upgrade as you grow.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-lg font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="relative inline-flex h-8 w-16 items-center rounded-full bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'annual' ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-lg font-medium ${billingCycle === 'annual' ? 'text-white' : 'text-gray-400'}`}>
                Annual
              </span>
              <span className="inline-flex items-center rounded-full bg-[#0D9488]/20 px-3 py-1 text-sm font-medium text-[#0D9488]">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            {PRICING_PLANS.map((plan) => {
              const displayPrice = billingCycle === 'annual' ? getAnnualPrice(plan.price) : plan.price;
              const displayPeriod = billingCycle === 'annual' ? 'year' : 'month';
              
              return (
                <div
                  key={plan.id}
                  className={`relative ${
                    plan.popular
                      ? 'scale-105 shadow-2xl border-2 border-[#0D9488]'
                      : 'border border-gray-200'
                  } bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-[#0D9488] to-[#0f766e] text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0D9488]/20 to-[#0f766e]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <plan.icon className="w-8 h-8 text-[#0D9488]" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    <div className="mb-4">
                      <span className="text-5xl font-bold text-gray-900">${displayPrice}</span>
                      <span className="text-gray-600">/{displayPeriod}</span>
                    </div>
                    {billingCycle === 'annual' && (
                      <p className="text-sm text-[#0D9488] font-medium">
                        Save ${plan.price * 12 - displayPrice} per year
                      </p>
                    )}
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-[#0D9488] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 opacity-50">
                        <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-500 line-through">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-[#0D9488] to-[#0f766e] text-white hover:shadow-lg hover:shadow-[#0D9488]/20'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {selectedPlan === plan.id ? 'Selected' : 'Get Started'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Features Comparison */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Compare All Features
            </h2>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 font-semibold text-gray-900">
                <div>Feature</div>
                <div className="text-center">Starter</div>
                <div className="text-center">Professional</div>
                <div className="text-center">Enterprise</div>
              </div>
              
              {[
                { feature: 'AI Consultations', starter: '5/month', pro: 'Unlimited', enterprise: 'Unlimited' },
                { feature: 'Document Review', starter: 'Basic', pro: 'Advanced', enterprise: 'Unlimited' },
                { feature: 'Support', starter: 'Email', pro: 'Priority + Live Chat', enterprise: 'Phone + Dedicated' },
                { feature: 'Custom Templates', starter: 'No', pro: 'Yes', enterprise: 'Yes' },
                { feature: 'API Access', starter: 'No', pro: 'No', enterprise: 'Yes' },
                { feature: 'Custom Integrations', starter: 'No', pro: 'No', enterprise: 'Yes' }
              ].map((row, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 p-6 border-t border-gray-200">
                  <div className="font-medium text-gray-900">{row.feature}</div>
                  <div className="text-center text-gray-600">{row.starter}</div>
                  <div className="text-center text-gray-600">{row.pro}</div>
                  <div className="text-center text-gray-600">{row.enterprise}</div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  question: 'Can I change my plan anytime?',
                  answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.'
                },
                {
                  question: 'Is there a free trial?',
                  answer: 'Yes, all plans come with a 14-day free trial. No credit card required to start.'
                },
                {
                  question: 'What payment methods do you accept?',
                  answer: 'We accept all major credit cards, PayPal, and bank transfers for enterprise plans.'
                },
                {
                  question: 'Can I cancel anytime?',
                  answer: 'Absolutely. You can cancel your subscription at any time with no cancellation fees.'
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center bg-gradient-to-r from-[#0D9488]/10 to-[#0f766e]/10 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals using PocketLawyer for their legal needs.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-600/20 transition-all">
                Start Free Trial
              </button>
              <button className="border border-green-600 text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
