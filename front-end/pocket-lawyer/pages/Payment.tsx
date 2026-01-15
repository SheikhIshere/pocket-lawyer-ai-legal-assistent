import React, { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Payment = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState('card');

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Payment Successful! Redirecting to dashboard...");
    navigate('/dashboard');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
       <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Summary */}
          <div className="md:col-span-1 order-2 md:order-1">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4">Order Summary</h3>
                <div className="flex justify-between mb-2 text-sm">
                   <span className="text-slate-600">Pro Plan (Monthly)</span>
                   <span className="font-medium">BDT 700</span>
                </div>
                <div className="flex justify-between mb-4 text-sm">
                   <span className="text-slate-600">Tax</span>
                   <span className="font-medium">BDT 0</span>
                </div>
                <div className="border-t border-slate-100 pt-4 flex justify-between font-bold text-lg">
                   <span>Total</span>
                   <span>BDT 700</span>
                </div>
                <div className="mt-6 flex items-center justify-center text-xs text-slate-500">
                   <Lock size={12} className="mr-1" /> Secure 256-bit SSL Encrypted
                </div>
             </div>
          </div>

          {/* Payment Form */}
          <div className="md:col-span-2 order-1 md:order-2">
             <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Select Payment Method</h2>
                
                {/* Method Tabs */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                   <button 
                     onClick={() => setMethod('card')}
                     className={`py-3 px-2 rounded-lg border text-sm font-medium transition ${method === 'card' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                   >
                     Credit/Debit Card
                   </button>
                   <button 
                     onClick={() => setMethod('mobile')}
                     className={`py-3 px-2 rounded-lg border text-sm font-medium transition ${method === 'mobile' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                   >
                     Mobile Banking
                   </button>
                   <button 
                     onClick={() => setMethod('paypal')}
                     className={`py-3 px-2 rounded-lg border text-sm font-medium transition ${method === 'paypal' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                   >
                     PayPal
                   </button>
                </div>

                <form onSubmit={handlePay}>
                   {method === 'card' && (
                      <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Card Number</label>
                            <div className="relative">
                               <CreditCard className="absolute left-3 top-3 text-slate-400" size={20} />
                               <input type="text" placeholder="0000 0000 0000 0000" className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                               <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">CVC</label>
                               <input type="text" placeholder="123" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                            </div>
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cardholder Name</label>
                            <input type="text" placeholder="John Doe" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                         </div>
                      </div>
                   )}

                   {method === 'mobile' && (
                      <div className="grid grid-cols-3 gap-4">
                         {['bKash', 'Nagad', 'Rocket'].map(p => (
                            <div key={p} className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition h-24">
                               <span className="font-bold text-slate-800">{p}</span>
                            </div>
                         ))}
                      </div>
                   )}

                   <button type="submit" className="w-full mt-8 bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-lg">
                      Pay BDT 700
                   </button>
                </form>
             </div>
          </div>
       </div>
    </div>
  );
};

export default Payment;