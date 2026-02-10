import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Header and Footer are now globally handled by Layout in App.tsx
import {
  Mail, Phone, MapPin, Send, MessageSquare, Clock,
  Shield, Users, ArrowRight, HelpCircle, CheckCircle2,
  AlertCircle, ChevronRight, Star, Zap, Headphones, 
  Sparkles, Globe, ShieldCheck
} from 'lucide-react';

const ContactPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    service: 'general_inquiry',
    priority: 'normal',
    other: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [characterCount, setCharacterCount] = useState(0);

  const services = [
    { value: 'general_inquiry', label: 'General Inquiry', icon: HelpCircle },
    { value: 'legal_advice', label: 'Legal Advice', icon: Shield },
    { value: 'document_review', label: 'Document Review', icon: MessageSquare },
    { value: 'emergency_legal_help', label: 'Emergency Legal Help', icon: AlertCircle },
    { value: 'legal_research', label: 'Legal Research', icon: Users },
    { value: 'bug_report', label: 'Bug Report', icon: Zap },
    { value: 'other', label: 'Other', icon: Star }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'message') {
      setCharacterCount(value.length);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8000/v1/api/contact-us/submit/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          service_type: formData.service,
          other: formData.service === 'other' ? formData.other : '',
          priority_level: formData.priority,
          subject: formData.subject,
          message: formData.message
        })
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          service: 'general_inquiry',
          priority: 'normal',
          other: ''
        });
        setCharacterCount(0);
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 5000);
      }
    } catch (error) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors duration-500 pb-20 lg:pb-0">

      <main className="flex-grow">
        {/* Modern Hero Section */}
        <section className="relative pt-24 pb-16 px-4 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-900/30 rounded-full mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Headphones className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-black text-teal-700 dark:text-teal-400 uppercase tracking-widest">Global Support Ecosystem</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              We're Here <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">To Solve Your Case</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-500 dark:text-gray-400 font-medium max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              Connect with our legal experts and AI specialists for tailored solutions 
              to your legal challenges.
            </p>
          </div>
        </section>

        {/* Contact Method Cards - MD3 Overhaul */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Mail, title: 'Email Us', value: 'support@pocketlawyer.ai', desc: 'Response within 4h', color: 'teal' },
                { icon: Phone, title: 'Call Us', value: '1-800-LAWYER', desc: 'Mon-Fri 9AM-6PM', color: 'blue' },
                { icon: MapPin, title: 'Visit Us', value: '123 Legal Plaza', desc: 'NY, New York 10001', color: 'indigo' },
                { icon: MessageSquare, title: 'Live Chat', value: 'Instant Access', desc: 'Available 24/7', color: 'emerald' }
              ].map((item, i) => (
                <div key={i} className="group p-10 rounded-[3rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:scale-105 active:scale-95 transition-all duration-500 hover:shadow-2xl flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm transition-transform group-hover:rotate-12
                    ${item.color === 'teal' ? 'bg-teal-50 dark:bg-teal-900/40 text-teal-600' : ''}
                    ${item.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600' : ''}
                    ${item.color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600' : ''}
                    ${item.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600' : ''}
                  `}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <div className="text-teal-600 dark:text-teal-400 font-bold mb-1">{item.value}</div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Form Section - MD3 Layout */}
        <section className="py-24 px-4 bg-slate-50 dark:bg-slate-900/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-16 items-start">
              {/* Information Column */}
              <div className="lg:col-span-2 space-y-12">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-6 leading-tight">
                    Submit Your <br />
                    <span className="text-teal-600">Legal Inquiry</span>
                  </h2>
                  <p className="text-lg text-slate-500 dark:text-gray-400 font-medium">
                    We've designed our inquiry process to be as fast as our AI. 
                    Expect a human review within hours for urgent matters.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { title: 'Secure Protocol', desc: 'End-to-end encrypted submission', icon: Shield },
                    { title: 'Priority Routing', desc: 'Smart sorting based on case urgency', icon: Zap },
                    { title: 'Expert Oversight', desc: 'Verified by our legal operations team', icon: ShieldCheck }
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                      <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
                        <feat.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900 dark:text-white text-sm">{feat.title}</div>
                        <div className="text-xs text-slate-500 dark:text-gray-500 uppercase tracking-widest">{feat.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                  <h4 className="text-2xl font-black mb-4 relative z-10">Need Instant Help?</h4>
                  <p className="text-indigo-100 mb-8 font-medium">Our AI is ready to provide immediate guidance 24/7.</p>
                  <Link to="/chat" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-3 rounded-full font-black text-sm hover:translate-x-4 transition-all duration-500">
                    Enter Active Chat
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Form Column */}
              <div className="lg:col-span-3">
                <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                  {submitStatus === 'success' && (
                    <div className="mb-8 p-6 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-3xl border border-teal-100 dark:border-teal-800 flex items-center gap-4 animate-in slide-in-from-top-4">
                      <div className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black">Mission Accomplished!</p>
                        <p className="text-sm font-medium">Your request has been received. Sit tight.</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Full Identity</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-teal-500 rounded-[2rem] text-slate-900 dark:text-white font-bold outline-none transition-all"
                          placeholder="Ex: Imran Rafi"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Email Channel</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-teal-500 rounded-[2rem] text-slate-900 dark:text-white font-bold outline-none transition-all"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Service Category</label>
                        <select
                          name="service"
                          value={formData.service}
                          onChange={handleInputChange}
                          className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-teal-500 rounded-[2rem] text-slate-900 dark:text-white font-bold outline-none transition-all appearance-none"
                        >
                          {services.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Priority Protocol</label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-teal-500 rounded-[2rem] text-slate-900 dark:text-white font-bold outline-none transition-all appearance-none text-teal-600 dark:text-teal-400"
                        >
                          <option value="normal">Standard (24h)</option>
                          <option value="urgent">Urgent (6h)</option>
                          <option value="emergency">Emergency (1h)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Subject Directive</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-teal-500 rounded-[2rem] text-slate-900 dark:text-white font-bold outline-none transition-all"
                        placeholder="Core matter of your request"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between px-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Case Description</label>
                        <span className="text-[10px] font-black text-slate-300">{characterCount}/500</span>
                      </div>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        maxLength={500}
                        rows={5}
                        className="w-full px-6 py-6 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-teal-500 rounded-[3rem] text-slate-900 dark:text-white font-bold outline-none transition-all resize-none"
                        placeholder="Detail your requirements for professional assessment..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-teal-600 text-white rounded-[2.5rem] py-6 text-xl font-black shadow-2xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-[1.02] active:scale-95 transition-all duration-500 flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="w-8 h-8 border-4 border-white border-t-transparent animate-spin rounded-full"></div>
                      ) : (
                        <>
                          <span>Deploy Message</span>
                          <Send className="w-6 h-6" />
                        </>
                      )}
                    </button>
                    
                    <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      End-to-End Encrypted Transmission Active
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ - Android Expansion Panel Style */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-center text-slate-900 dark:text-white mb-16 tracking-tighter">Support Commons</h2>
            <div className="space-y-4">
              {[
                { q: "How fast is the verification process?", a: "AI-driven preliminary verification is instant. Human review for complex cases takes 1-4 business hours." },
                { q: "Are my documents legally protected?", a: "Yes. Every byte is encrypted with AES-256 and subject to strict confidentiality protocols." },
                { q: "Can I cancel a priority request?", a: "Priority requests are routed immediately and cannot be cancelled once processing has begun." },
                { q: "Global availability status?", a: "PocketLawyer operates 24/7/365 with specialized nodes for various legal jurisdictions." }
              ].map((faq, i) => (
                <div key={i} className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-teal-500 transition-all">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-teal-500" />
                    {faq.q}
                  </h3>
                  <p className="text-slate-500 dark:text-gray-400 font-medium leading-relaxed pl-8">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

    </div>
  );
};

export default ContactPage;
