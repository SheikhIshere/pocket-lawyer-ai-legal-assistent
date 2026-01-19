import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Header, Footer } from '../components/Layout';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Shield, Users, ArrowRight } from 'lucide-react';

const ContactPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    service: 'general'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const services = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'legal-advice', label: 'Legal Advice' },
    { value: 'document-review', label: 'Document Review' },
    { value: 'emergency', label: 'Emergency Legal Help' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'technical', label: 'Technical Support' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        service: 'general'
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
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
      description: "We respond within 24 hours"
    },
    {
      icon: <Phone className="w-6 h-6 text-teal-600" />,
      title: "Call Us",
      details: "1-800-LAWYER",
      description: "Mon-Fri 9AM-6PM EST"
    },
    {
      icon: <MapPin className="w-6 h-6 text-teal-600" />,
      title: "Visit Us",
      details: "123 Legal Street, New York, NY 10001",
      description: "By appointment only"
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-teal-600" />,
      title: "Live Chat",
      details: "Available 24/7",
      description: "Get instant help"
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-50 via-white to-teal-50 pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
                Get in 
                <span className="text-teal-600">Touch</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Have questions about our services? Need legal assistance? Our team is here to help you 24/7.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Multiple Ways to Reach Us
              </h2>
              <p className="text-lg text-slate-600">
                Choose the method that works best for you
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all group">
                  <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                    {info.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{info.title}</h3>
                  <p className="text-teal-600 font-semibold text-lg mb-2">{info.details}</p>
                  <p className="text-slate-600 text-sm">{info.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div>
                <div className="mb-8">
                  <h2 className="text-4xl font-bold text-slate-900 mb-4">
                    Send Us a Message
                  </h2>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    Have questions about our services? Need legal assistance? Fill out the form below and our team will get back to you within 24 hours.
                  </p>
                </div>

                {/* Quick Contact Options */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-teal-300 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-teal-600 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">Email</div>
                        <div className="text-slate-600 text-xs">support@pocketlawyer.com</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-teal-300 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-teal-600 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">Phone</div>
                        <div className="text-slate-600 text-xs">1-800-LAWYER</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Response Time Info */}
                <div className="bg-teal-50 p-6 rounded-xl border border-teal-200">
                  <div className="flex items-start gap-3">
                    <Clock className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900 mb-2">Response Times</div>
                      <ul className="space-y-1 text-sm text-slate-700">
                        <li>• Email: Within 24 hours</li>
                        <li>• Phone: Mon-Fri 9AM-6PM EST</li>
                        <li>• Live Chat: Available 24/7</li>
                        <li>• Emergency: Immediate response</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                  {submitStatus === 'success' && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        <span className="font-medium">Message sent successfully! We'll respond within 24 hours.</span>
                      </div>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        <span className="font-medium">Something went wrong. Please try again or contact us directly.</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Service Type *</label>
                        <select
                          name="service"
                          value={formData.service}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        >
                          {services.map(service => (
                            <option key={service.value} value={service.value}>
                              {service.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                        <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all">
                          <option value="normal">Normal</option>
                          <option value="urgent">Urgent</option>
                          <option value="emergency">Emergency</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Subject *</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        placeholder="How can we help you today?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Message *</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none transition-all"
                        placeholder="Please provide as much detail as possible about your legal needs..."
                      />
                      <div className="text-xs text-slate-500 mt-2">
                        {formData.message.length}/500 characters
                      </div>
                    </div>

                    {/* File Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Attach Documents (Optional)</label>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-teal-400 transition-colors cursor-pointer">
                        <input type="file" className="hidden" multiple accept=".pdf,.doc,.docx" />
                        <div className="text-slate-600">
                          <div className="mb-2">
                            <svg className="w-8 h-8 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <div className="text-sm font-medium">Click to upload or drag and drop</div>
                          <div className="text-xs">PDF, DOC, DOCX (max 10MB)</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-teal-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 hover:shadow-xl hover:-translate-y-0.5"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>

                  <div className="text-xs text-slate-500 text-center mt-4">
                    <Shield className="w-3 h-3 inline mr-1" />
                    Your information is secure and confidential
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-slate-600">
                Quick answers to common questions about our services
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{faq.question}</h3>
                  <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-teal-600 to-blue-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Still Have Questions?
            </h2>
            <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
              Our legal team is standing by to help you get the answers and assistance you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link 
                  to="/chat" 
                  className="inline-flex items-center justify-center gap-2 bg-white text-teal-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-slate-50 transition-all shadow-xl"
                >
                  Go to Chat
                  <MessageSquare className="w-5 h-5" />
                </Link>
              ) : (
                <Link 
                  to="/register" 
                  className="inline-flex items-center justify-center gap-2 bg-white text-teal-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-slate-50 transition-all shadow-xl"
                >
                  Sign Up Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              <Link 
                to="/services" 
                className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-teal-600 transition-all"
              >
                View Services
                <Shield className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
