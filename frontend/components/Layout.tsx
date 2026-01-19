import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Scale, Menu, X, User, ChevronDown, 
  LogOut, Settings, FileText, Briefcase, 
  Phone, Mail, MapPin, ExternalLink,
  Shield, Lock, Globe
} from 'lucide-react';

export const Header: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg shadow-gray-100/50' 
        : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-gradient-to-br from-teal-600 to-emerald-700 p-2.5 rounded-xl shadow-lg">
                <Scale className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">PocketLawyer</span>
              <span className="block text-[10px] font-medium text-teal-600 tracking-wider uppercase mt-0.5">
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
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'text-teal-700 bg-teal-50 border border-teal-100'
                    : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'
                }`}
              >
                {item.icon && item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
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
                    className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center text-white text-sm font-bold shadow-md">
                        {(user?.full_name || user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="text-left mr-2">
                      <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
                      <div className="text-xs text-gray-500">Premium Account</div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setProfileMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="font-semibold text-gray-900">{user?.name}</div>
                          <div className="text-sm text-gray-500">{user?.email}</div>
                        </div>
                        
                        <div className="py-2">
                          <Link 
                            to="/dashboard" 
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                          >
                            <User className="w-4 h-4" />
                            Dashboard
                          </Link>
                          <Link 
                            to="/cases" 
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            My Legal Cases
                          </Link>
                          <Link 
                            to="/documents" 
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                          >
                            <Briefcase className="w-4 h-4" />
                            Documents
                          </Link>
                          <Link 
                            to="/settings" 
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            Account Settings
                          </Link>
                        </div>
                        
                        <div className="border-t border-gray-100 pt-2">
                          <button 
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Log Out
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
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
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

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <nav className="space-y-1 py-2">
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-teal-700 bg-teal-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon && item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-gray-100 pt-4 mt-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center text-white font-bold">
                      {(user?.full_name || user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{user?.name}</div>
                      <div className="text-xs text-gray-500">Premium Account</div>
                    </div>
                  </div>
                  
                  <Link
                    to="/chat"
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-700 text-white px-4 py-3 rounded-lg text-sm font-semibold mb-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Start Consultation
                  </Link>
                  
                  <div className="space-y-1">
                    <Link to="/dashboard" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      Dashboard
                    </Link>
                    <Link to="/cases" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      My Legal Cases
                    </Link>
                    <Link to="/documents" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      Documents
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Log Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-center text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-3 text-center text-sm font-semibold bg-gradient-to-r from-teal-600 to-emerald-700 text-white rounded-lg hover:shadow-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300 pt-16 pb-8">
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
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-700 text-white py-3 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-teal-600/20 transition-all"
              >
                Subscribe
              </button>
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