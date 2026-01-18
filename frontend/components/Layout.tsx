import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User as UserIcon, LogOut, Settings, CreditCard, FileText, ChevronDown } from 'lucide-react';
import { useAuth } from '../App';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage = ['/login', '/register', '/verify-otp', '/change-password'].includes(location.pathname);
  const isChatPage = location.pathname === '/chat';

  // If we are in the chat interface, we might want a different layout (no footer, simpler header)
  // For now, we'll keep the header but maybe hide footer in chat
  
  const handleLogout = () => {
    // Show confirmation modal (simulated by window.confirm for simplicity in this file, 
    // but the requirements asked for a modal. We will route to /logout or use context).
    // For this prototype, let's use the explicit route to show the modal page.
    navigate('/logout');
  };

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                P
              </div>
              <span className="text-xl font-bold text-slate-800">Pocket Lawyer</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-slate-600 hover:text-primary-600 font-medium transition">Home</Link>
              <Link to="/services" className="text-slate-600 hover:text-primary-600 font-medium transition">Services</Link>
              <Link to="/about" className="text-slate-600 hover:text-primary-600 font-medium transition">About</Link>
              {user && <Link to="/chat" className="text-slate-600 hover:text-primary-600 font-medium transition">AI Chat</Link>}
            </nav>

            {/* Auth Buttons / User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {!user ? (
                <>
                  <Link to="/login" className="text-slate-700 font-medium hover:text-primary-600">Log In</Link>
                  <Link to="/register" className="bg-primary-600 text-white px-5 py-2.5 rounded-full font-medium hover:bg-primary-700 transition shadow-lg shadow-primary-500/30">
                    Sign Up
                  </Link>
                </>
              ) : (
                <div className="relative">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="w-9 h-9 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-slate-700 font-medium">{user.name}</span>
                    <ChevronDown size={16} className="text-slate-500" />
                  </button>

                  {/* Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-slate-100 mb-1">
                        <p className="text-sm font-semibold text-slate-800">My Account</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <Link to="/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center">
                        <UserIcon size={16} className="mr-2" /> Profile
                      </Link>
                      <Link to="/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center">
                        <FileText size={16} className="mr-2" /> My Documents
                      </Link>
                      <Link to="/pricing" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center">
                        <CreditCard size={16} className="mr-2" /> Subscription
                      </Link>
                      <div className="border-t border-slate-100 my-1"></div>
                      <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center">
                        <LogOut size={16} className="mr-2" /> Log Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
               <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
                 {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
               </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
            <Link to="/" className="block py-2 text-slate-700 font-medium">Home</Link>
            <Link to="/services" className="block py-2 text-slate-700 font-medium">Services</Link>
            <Link to="/about" className="block py-2 text-slate-700 font-medium">About</Link>
            {!user ? (
               <div className="pt-4 flex flex-col space-y-3">
                 <Link to="/login" className="block w-full text-center py-2 text-slate-700 font-medium border border-slate-300 rounded-lg">Log In</Link>
                 <Link to="/register" className="block w-full text-center py-2 bg-primary-600 text-white font-medium rounded-lg">Sign Up</Link>
               </div>
            ) : (
               <div className="pt-4 border-t border-slate-100">
                 <Link to="/dashboard" className="block py-2 text-slate-700 font-medium">Dashboard</Link>
                 <Link to="/chat" className="block py-2 text-slate-700 font-medium">AI Chat</Link>
                 <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600 font-medium">Log Out</button>
               </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className={`flex-grow ${isChatPage ? 'h-[calc(100vh-64px)] overflow-hidden' : ''}`}>
        {children}
      </main>

      {/* Footer - Hide on Chat Page for full immersion */}
      {!isChatPage && (
        <footer className="bg-secondary-900 text-slate-300 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">P</div>
                <span className="text-xl font-bold text-white">Pocket Lawyer</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Empowering individuals with instant, AI-driven legal guidance. Accessible, affordable, and trustworthy.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-primary-500 transition">About Us</Link></li>
                <li><Link to="/services" className="hover:text-primary-500 transition">Services</Link></li>
                <li><Link to="/pricing" className="hover:text-primary-500 transition">Pricing</Link></li>
                <li><Link to="/privacy" className="hover:text-primary-500 transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary-500 transition">Terms of Service</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Mirpur - 11, Dhaka</li>
                <li>support@pocketlawyer.com</li>
                <li>+880 9999-1119</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Newsletter</h4>
              <div className="flex flex-col space-y-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-secondary-800 border border-secondary-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                />
                <button className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-secondary-800 text-center text-xs text-slate-500">
            &copy; 2024 Pocket Lawyer. All Rights Reserved.
          </div>
        </footer>
      )}
    </div>
  );
};