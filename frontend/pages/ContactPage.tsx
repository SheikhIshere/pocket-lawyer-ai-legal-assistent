import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Header, Footer } from '../components/Layout';
import { 
  Mail, Phone, MapPin, Send, MessageSquare, Clock, 
  Shield, Users, ArrowRight, HelpCircle, CheckCircle2,
  AlertCircle, ChevronRight, Star, Zap, Headphones
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
    { value: 'general_inquiry', label: 'General Inquiry', icon: <HelpCircle className="w-4 h-4" /> },
    { value: 'legal_advice', label: 'Legal Advice', icon: <Shield className="w-4 h-4" /> },
    { value: 'document_review', label: 'Document Review', icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'emergency_legal_help', label: 'Emergency Legal Help', icon: <AlertCircle className="w-4 h-4" /> },
    { value: 'legal_advice', label: 'Legal Advice', icon: <Shield className="w-4 h-4" /> },
    { value: 'legal_research', label: 'Legal Research', icon: <Users className="w-4 h-4" /> },
    { value: 'bug_report', label: 'Bug Report', icon: <Zap className="w-4 h-4" /> },
    { value: 'other', label: 'Other', icon: <Star className="w-4 h-4" /> }
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
        const data = await response.json();
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
        
        // Reset success message after 5 seconds
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        const errorData = await response.json();
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

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6 text-teal-600" />,
      title: "Email Us",
      details: "support@pocketlawyer.com",
      description: "We respond within 24 hours",
      action: "mailto:support@pocketlawyer.com"
    },
    {
      icon: <Phone className="w-6 h-6 text-teal-600" />,
      title: "Call Us",
      details: "1-800-LAWYER",
      description: "Mon-Fri 9AM-6PM EST",
      action: "tel:+1800529937"
    },
    {
      icon: <MapPin className="w-6 h-6 text-teal-600" />,
      title: "Visit Us",
      details: "123 Legal Street, New York, NY 10001",
      description: "By appointment only",
      action: "https://maps.google.com"
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-teal-600" />,
      title: "Live Chat",
      details: "Available 24/7",
      description: "Get instant help",
      action: isAuthenticated ? "/chat" : "/login"
    }
  ];

  const faqs = [
    {
      question: "How quickly will I receive a response?",
      answer: "We typically respond to all inquiries within 24 hours during business days. For urgent legal matters, our live chat is available 24/7."
    },
    {
      question: "Is my information confidential?",
      answer: "Yes, absolutely. All communications are protected by bank-level encryption and we never share your information with third parties without your consent."
    },
    {
      question: "Do you provide human lawyer services?",
      answer: "Yes, while our AI provides instant guidance, we can connect you with verified local attorneys for complex cases requiring human representation."
    },
    {
      question: "What types of legal issues can you help with?",
      answer: "We assist with contract reviews, landlord-tenant disputes, employment issues, family law matters, traffic violations, and general legal guidance."
    }
  ];

  const responseTimes = [
    { type: "Email", time: "Within 24 hours", icon: <Mail className="w-4 h-4" /> },
    { type: "Phone", time: "Mon-Fri 9AM-6PM EST", icon: <Phone className="w-4 h-4" /> },
    { type: "Live Chat", time: "Available 24/7", icon: <MessageSquare className="w-4 h-4" /> },
    { type: "Emergency", time: "Immediate response", icon: <AlertCircle className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-50 via-white to-teal-50/30 pt-24 pb-20 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-10 w-72 h-72 bg-teal-200/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
                <Headphones className="w-4 h-4" />
                We're here to help
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Touch</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-3xl mx-auto">
                Have questions about our services? Need legal assistance? Our team of experts is here to help you navigate any legal challenge.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Multiple Ways to Reach Us
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Choose the method that works best for you. Our team is ready to assist with any legal questions or concerns.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactInfo.map((info, index) => (
                <a
                  key={index}
                  href={info.action}
                  className="group block"
                >
                  <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 h-full">
                    <div className="mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-blue-100 rounded-xl flex items-center justify-center">
                        {info.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">
                      {info.title}
                    </h3>
                    <p className="text-teal-600 font-semibold text-lg mb-2 group-hover:text-teal-800">
                      {info.details}
                    </p>
                    <p className="text-slate-600 text-sm">{info.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Get in touch</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Information */}
        <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              {/* Left Column - Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl font-bold text-slate-900 mb-6">
                    Send Us a Message
                  </h2>
                  <p className="text-lg text-slate-600 leading-relaxed mb-8">
                    Fill out the form and our team will get back to you within 24 hours. For urgent matters, use our live chat for immediate assistance.
                  </p>
                </div>

                {/* Response Times */}
                <div className="bg-gradient-to-br from-white to-teal-50/30 p-8 rounded-2xl border border-teal-100 shadow-lg shadow-teal-500/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Response Times</h3>
                      <p className="text-sm text-slate-600">We value your time</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {responseTimes.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                            {item.icon}
                          </div>
                          <span className="font-medium text-slate-700">{item.type}</span>
                        </div>
                        <span className="font-semibold text-slate-900">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why Choose Us */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    Why Choose PocketLawyer
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-900">Expert Legal Team</p>
                        <p className="text-sm text-slate-600">Licensed attorneys with years of experience</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-900">24/7 Availability</p>
                        <p className="text-sm text-slate-600">Round-the-clock support for urgent matters</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-900">Confidential & Secure</p>
                        <p className="text-sm text-slate-600">Bank-level encryption for all communications</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Form */}
              <div className="sticky top-8">
                <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-100">
                  {submitStatus === 'success' && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-xl border border-green-200 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Message sent successfully!</p>
                          <p className="text-sm opacity-90">We'll respond within 24 hours.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 rounded-xl border border-red-200 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Something went wrong</p>
                          <p className="text-sm opacity-90">Please try again or contact us directly.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Service Type *
                        </label>
                        <div className="relative">
                          <select
                            name="service"
                            value={formData.service}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all appearance-none"
                          >
                            {services.map(service => (
                              <option key={service.value} value={service.value}>
                                {service.label}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                          </div>
                        </div>
                      </div>

                      {formData.service === 'other' && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Please specify service type *
                          </label>
                          <input
                            type="text"
                            name="other"
                            value={formData.other}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                            placeholder="Please describe what type of service you need..."
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Priority Level
                        </label>
                        <div className="relative">
                          <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all appearance-none"
                          >
                            <option value="normal">Normal (24h response)</option>
                            <option value="urgent">Urgent (6h response)</option>
                            <option value="emergency">Emergency (1h response)</option>
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                          </div>
                        </div>
                      </div>

                      <div>
                        {/* Empty div for grid layout */}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                        placeholder="How can we help you today?"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-slate-700">
                          Message *
                        </label>
                        <span className={`text-xs ${characterCount > 450 ? 'text-red-500' : 'text-slate-500'}`}>
                          {characterCount}/500
                        </span>
                      </div>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        maxLength={500}
                        rows={5}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-slate-400"
                        placeholder="Please provide as much detail as possible about your legal needs..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-teal-500/25 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                          <span>Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>

                    <div className="text-center pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                        <Shield className="w-4 h-4" />
                        Your information is secure and confidential
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Quick answers to common questions about our services and how we can help you.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="group bg-white p-8 rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <HelpCircle className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-teal-700 transition-colors">
                        {faq.question}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              Need Immediate Help?
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Legal Help?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
              Join thousands of satisfied clients who have found legal solutions with PocketLawyer. Fast, reliable, and confidential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link 
                  to="/chat" 
                  className="group inline-flex items-center justify-center gap-3 bg-white text-teal-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-xl"
                >
                  <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Start Chat with AI Lawyer
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link 
                  to="/register" 
                  className="group inline-flex items-center justify-center gap-3 bg-white text-teal-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-xl"
                >
                  <Star className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <Link 
                to="/services" 
                className="group inline-flex items-center justify-center gap-3 bg-transparent text-white border-2 border-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-teal-600 transition-all duration-300"
              >
                <Shield className="w-5 h-5" />
                Explore Services
              </Link>
            </div>
            <p className="text-white/70 text-sm mt-8">
              No credit card required • 7-day free trial • Cancel anytime
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;



