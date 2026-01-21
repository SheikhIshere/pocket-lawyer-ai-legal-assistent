import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  Scale, Menu, X, User, ChevronDown,
  Settings, FileText, Briefcase,
  Phone, Mail, MapPin, ExternalLink,
  Shield, Lock, Globe, Sun, Moon, Home, LayoutDashboard,
  MessageSquare, Star
} from 'lucide-react';

export const Header: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 shadow-lg shadow-gray-100/50 dark:shadow-none'
        : 'bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="bg-gradient-to-br from-teal-600 to-emerald-700 p-2 rounded-lg lg:p-2.5 lg:rounded-xl shadow-lg">
                  <Scale className="w-5 h-5 lg:w-7 lg:h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
              </div>
              <div>
                <span className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">PocketLawyer</span>
                <span className="hidden lg:block text-[10px] font-medium text-teal-600 dark:text-teal-400 tracking-wider uppercase mt-0.5">
                  AI Legal Assistant
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {[
                { path: '/', label: 'Home' },
                { path: '/services', label: 'Services', icon: <Briefcase className="w-4 h-4" /> },
                { path: '/pricing', label: 'Pricing' },
                { path: '/about', label: 'About Us' },
                { path: '/contact', label: 'Contact', icon: <Phone className="w-4 h-4" /> },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.path)
                    ? 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/50'
                    : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                >
                  {item.icon && item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Theme Toggle & Auth Section */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <Link
                    to="/chat"
                    className="relative group overflow-hidden bg-gradient-to-r from-teal-600 to-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:shadow-xl hover:shadow-teal-600/20 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span>Start Consultation</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>

                  <div className="relative">
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border border-gray-200 dark:border-slate-700"
                    >
                      <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0E8E82] to-[#0a6d62] flex items-center justify-center text-white text-sm font-bold shadow-md">
                          {(user?.full_name || user?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#0a6d62] rounded-full border-2 border-white dark:border-slate-900"></div>
                      </div>
                      <div className="text-left mr-2">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Premium Account</div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {profileMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setProfileMenuOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                          <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                            <div className="font-semibold text-gray-900 dark:text-white">{user?.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</div>
                          </div>

                          <div className="py-2">
                            <Link
                              to="/dashboard"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                            >
                              <User className="w-4 h-4" />
                              Dashboard
                            </Link>
                            <Link
                              to="/cases"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              My Legal Cases
                            </Link>
                            <Link
                              to="/documents"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                            >
                              <Briefcase className="w-4 h-4" />
                              Documents
                            </Link>
                            <Link
                              to="/settings"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              Account Settings
                            </Link>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTheme();
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-400 transition-colors border-t border-gray-100 dark:border-slate-800"
                            >
                              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                              {isDark ? 'Light Mode' : 'Dark Mode'}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="relative overflow-hidden bg-gradient-to-r from-teal-600 to-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:shadow-xl hover:shadow-teal-600/20 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <span className="relative z-10">Get Started Free</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Profile Toggle */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="relative p-1.5 rounded-xl transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center text-white text-xs font-bold shadow-md">
                  {(user?.full_name || user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
              </button>

              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[70] bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-slate-900 rounded-t-[3rem] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] z-[80] p-6 pt-2 animate-in slide-in-from-bottom-full duration-500 ease-out transition-transform">
                    {/* Handle Bar */}
                    <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6" />

                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center text-white text-2xl font-black shadow-xl">
                        {(user?.full_name || user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xl font-black text-slate-900 dark:text-white capitalize">{user?.name || 'User'}</div>
                        <div className="text-sm font-medium text-slate-500 dark:text-gray-400">{user?.email}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pb-24">
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                          <LayoutDashboard className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Dashboard Overview</p>
                          <p className="text-xs text-slate-500 dark:text-gray-500">Monitor your activity</p>
                        </div>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                          <Settings className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Account Settings</p>
                          <p className="text-xs text-slate-500 dark:text-gray-500">Profile & preferences</p>
                        </div>
                      </Link>

                      <button
                        onClick={() => {
                          toggleTheme();
                          setProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                          {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 dark:text-white">{isDark ? 'Light Mode' : 'Dark Mode'}</p>
                          <p className="text-xs text-slate-500 dark:text-gray-500">Toggle visual theme</p>
                        </div>
                      </button>

                      <div className="my-4 h-px bg-slate-100 dark:bg-slate-800 mx-4" />

                      <Link
                        to="/about"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                          <Scale className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">About Us</p>
                          <p className="text-xs text-slate-500 dark:text-gray-500">Our mission & team</p>
                        </div>
                      </Link>

                      <Link
                        to="/contact"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                          <Phone className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">Contact Support</p>
                          <p className="text-xs text-slate-500 dark:text-gray-500">Get in touch with us</p>
                        </div>
                      </Link>

                      <button
                        className="w-full mt-6 p-5 bg-red-50 dark:bg-red-900/10 text-red-600 font-bold rounded-3xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-3"
                        onClick={() => {
                          setProfileMenuOpen(false);
                        }}
                      >
                        Log Out Account
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Android-Style Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-100 dark:border-slate-800 px-2 pb-safe">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          {[
            { path: '/', label: 'Home', icon: Home },
            { path: '/services', label: 'Explore', icon: Briefcase },
            { path: '/chat', label: 'Ask AI', icon: MessageSquare, primary: true },
            { path: '/dashboard', label: 'Monitor', icon: LayoutDashboard },
            { path: '/pricing', label: 'Plans', icon: Star },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center min-w-[60px] h-full relative transition-all active:scale-90 ${item.primary
                ? 'bg-teal-600 dark:bg-teal-500 text-white rounded-2xl w-14 h-14 -translate-y-4 shadow-lg shadow-teal-500/40'
                : isActive(item.path)
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-gray-400 dark:text-gray-500'
                }`}
            >
              <item.icon className={`${item.primary ? 'w-6 h-6' : 'w-5 h-5'} mb-1`} />
              {!item.primary && <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">{item.label}</span>}
              {isActive(item.path) && !item.primary && (
                <div className="absolute top-0 w-8 h-1 bg-teal-600 dark:bg-teal-400 rounded-full" />
              )}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubscribing) return;

    setIsSubscribing(true);
    setSubscribeMessage('');

    try {
      await api.newsletterService.subscribe(email.trim());
      setSubscribeMessage('Successfully subscribed! Check your email for confirmation.');
      setEmail('');
    } catch (error: any) {
      setSubscribeMessage(error?.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="hidden lg:block bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-16 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-teal-600 to-emerald-700 p-2.5 rounded-xl shadow-lg">
                <Scale className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">PocketLawyer</div>
                <div className="text-sm text-teal-400 font-medium">AI Legal Assistant</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 mb-6">
              Professional AI-powered legal assistance platform.
              Empowering individuals and businesses with accessible,
              reliable legal guidance 24/7.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-teal-700 transition-colors group">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-teal-700 transition-colors group">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-teal-400" />
              Services
            </h4>
            <ul className="space-y-3">
              {['Document Review', 'Contract Analysis', 'Legal Research', 'Case Evaluation', 'Compliance Check'].map((service) => (
                <li key={service}>
                  <a href="#" className="text-sm text-gray-400 hover:text-teal-400 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-400" />
              Legal
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Privacy Policy', icon: <Lock className="w-4 h-4" /> },
                { label: 'Terms of Service', icon: <FileText className="w-4 h-4" /> },
                { label: 'Disclaimer', icon: <Shield className="w-4 h-4" /> },
                { label: 'Cookie Policy', icon: <Globe className="w-4 h-4" /> },
                { label: 'GDPR Compliance', icon: <Shield className="w-4 h-4" /> },
              ].map((item) => (
                <li key={item.label}>
                  <a href="#" className="text-sm text-gray-400 hover:text-teal-400 transition-colors flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5 text-teal-400" />
              Stay Updated
            </h4>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to our newsletter for legal insights and updates.
            </p>
            <form className="space-y-3" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-700 text-white py-3 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-teal-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
              {subscribeMessage && (
                <div className={`text-sm ${subscribeMessage.includes('Successfully') ? 'text-green-400' : 'text-red-400'}`}>
                  {subscribeMessage}
                </div>
              )}
            </form>
            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                <Mail className="w-4 h-4" />
                <span>support@pocketlawyer.ai</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              © 2024 PocketLawyer AI. All rights reserved.
              <span className="block md:inline mt-1 md:mt-0 md:ml-2 text-gray-600">
                This platform provides AI-assisted legal guidance and is not a substitute for professional legal advice.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-gray-500 hover:text-teal-400 transition-colors">
                Sitemap
              </a>
              <a href="#" className="text-gray-500 hover:text-teal-400 transition-colors">
                Accessibility
              </a>
              <a href="#" className="text-gray-500 hover:text-teal-400 transition-colors">
                Careers
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};