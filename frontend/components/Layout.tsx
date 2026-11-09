import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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


// Logo Component
const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`bg-gradient-to-br from-teal-600 to-emerald-700 p-2.5 rounded-lg flex items-center justify-center shadow-lg ${className || ''}`}>
    <Scale className="w-6 h-6 text-white" />
  </div>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [bottomMenuOpen, setBottomMenuOpen] = useState(false);
  const bottomMenuRef = useRef<HTMLDivElement>(null);
  const [bottomMenuStartY, setBottomMenuStartY] = useState(0);
  const [bottomMenuCurrentY, setBottomMenuCurrentY] = useState(0);
  const [bottomMenuIsDragging, setBottomMenuIsDragging] = useState(false);
  const [bottomMenuDragDelta, setBottomMenuDragDelta] = useState(0);

  const location = useLocation();
  const path = location.pathname;
  const isActive = (pathname: string) => location.pathname === pathname;
  const isAuthRoute = ['/login', '/register', '/verify-otp', '/register-verify-otp', '/forgot-password-verify-otp'].includes(path);
  const isBareRoute = path === '/no-permission' || path === '/404';
  const hideChrome = isAuthRoute || isBareRoute;
  const isChat = path.includes('/chat');

  // Scroll lock for bottom menu
  useEffect(() => {
    if (bottomMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [bottomMenuOpen]);

  const handleBottomMenuDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setBottomMenuStartY(clientY);
    setBottomMenuIsDragging(true);
    setBottomMenuDragDelta(0);
  };

  const handleBottomMenuDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!bottomMenuIsDragging) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setBottomMenuCurrentY(clientY);
    const delta = clientY - bottomMenuStartY;
    if (delta > 0) { // Only allow dragging downwards
      setBottomMenuDragDelta(delta);
    }
  };

  const handleBottomMenuDragEnd = () => {
    setBottomMenuIsDragging(false);
    if (bottomMenuDragDelta > 80) { // If dragged more than 80px downwards, close the menu
      setBottomMenuOpen(false);
    }
    setBottomMenuDragDelta(0); // Reset drag transformation
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors duration-500">
      {!hideChrome && !isChat && <Header setBottomMenuOpen={setBottomMenuOpen} />}
      <main className={`flex-1 ${isChat ? 'h-full' : 'pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0'}`}>{children}</main>
      {!hideChrome && !isChat && <Footer />}
      <AnimatePresence>
        {bottomMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBottomMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[75]"
            />
            <motion.div
              ref={bottomMenuRef}
              initial={{ y: '100%' }}
              animate={{ y: bottomMenuDragDelta }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] z-[80] p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] flex flex-col max-h-[85vh]"
              onTouchStart={handleBottomMenuDragStart}
              onTouchMove={handleBottomMenuDragMove}
              onTouchEnd={handleBottomMenuDragEnd}
            >
              {/* Handle Bar */}
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8 shrink-0" />
              <button
                onClick={() => setBottomMenuOpen(false)}
                aria-label="Close menu"
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              {user ? (
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center text-white text-2xl font-black shadow-xl">
                    {(user?.full_name || user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xl font-black text-slate-900 dark:text-white capitalize truncate">{user?.name || 'User'}</div>
                    <div className="text-sm font-medium text-slate-500 dark:text-gray-400 truncate">{user?.email}</div>
                  </div>
                </div>
              ) : (
                <div className="mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xl font-black text-slate-900 dark:text-white">PocketLawyer</div>
                  <div className="text-sm font-medium text-slate-500 dark:text-gray-400">Sign in to save your sessions.</div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto -mx-6 px-6 scrollbar-hide">
                <div className="grid grid-cols-1 gap-2">
                  {(user ? [
                    { to: '/dashboard', icon: LayoutDashboard, title: 'Dashboard Overview', desc: 'Monitor your activity' },
                    { to: '/documents', icon: FileText, title: 'Chat Sessions', desc: 'Your consultations' },
                    { to: '/settings', icon: Settings, title: 'Account Settings', desc: 'Profile & preferences' },
                    { to: '/about', icon: Scale, title: 'About Us', desc: 'Our mission & team' },
                    { to: '/contact', icon: Phone, title: 'Contact Support', desc: 'Get in touch' },
                  ] : [
                    { to: '/', icon: Home, title: 'Home', desc: 'Back to the landing page' },
                    { to: '/services', icon: Briefcase, title: 'Services', desc: 'Explore legal help' },
                    { to: '/pricing', icon: Star, title: 'Pricing', desc: 'Compare plans' },
                    { to: '/about', icon: Scale, title: 'About Us', desc: 'Our mission & team' },
                    { to: '/contact', icon: Phone, title: 'Contact Support', desc: 'Get in touch' },
                  ]).map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setBottomMenuOpen(false)}
                      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                        <item.icon className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-500">{item.desc}</p>
                      </div>
                    </Link>
                  ))}

                  <button
                    onClick={() => {
                      toggleTheme();
                      setBottomMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                  >
                    <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                      {isDark ? <Sun className="w-5.5 h-5.5" /> : <Moon className="w-5.5 h-5.5" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-white">{isDark ? 'Light Mode' : 'Dark Mode'}</p>
                      <p className="text-xs text-slate-500 dark:text-gray-500">Toggle visual theme</p>
                    </div>
                  </button>

                  <div className="my-4 h-px bg-slate-100 dark:bg-slate-800 mx-4" />

                  {user ? (
                    <button
                      className="w-full p-4 bg-red-50 dark:bg-red-900/10 text-red-600 font-bold rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-3"
                      onClick={() => {
                        logout();
                        setBottomMenuOpen(false);
                      }}
                    >
                      Log Out Account
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        to="/login"
                        onClick={() => setBottomMenuOpen(false)}
                        className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-center"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setBottomMenuOpen(false)}
                        className="p-4 bg-teal-600 text-white font-bold rounded-2xl text-center"
                      >
                        Get Started
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Premium Mobile Navigation Bar */}
      {!hideChrome && (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[65] px-4 sm:px-6 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2">
        <div className="max-w-md mx-auto relative">
          {/* Enhanced Glass Carrier with better backdrop blur */}
          <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2rem] border border-white/30 dark:border-slate-700/50 shadow-[0_-4px_24px_rgba(0,0,0,0.12),0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.3),0_20px_50px_rgba(0,0,0,0.4)] pointer-events-none" />

          <div className="relative flex justify-around items-center h-16 px-2">
            {(isAuthenticated ? [
              { path: '/', label: 'Home', icon: Home },
              { path: '/services', label: 'Explore', icon: Briefcase },
              { path: '/chat', label: 'Ask AI', icon: MessageSquare, primary: true },
              { path: '/documents', label: 'Sessions', icon: FileText },
              { path: '/settings', label: 'Settings', icon: Settings },
            ] : [
              { path: '/', label: 'Home', icon: Home },
              { path: '/services', label: 'Explore', icon: Briefcase },
              { path: '/chat', label: 'Ask AI', icon: MessageSquare, primary: true },
              { path: '/pricing', label: 'Plans', icon: Star },
              { path: '/login', label: 'Sign In', icon: User },
            ]).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setBottomMenuOpen(false)}
                className={`flex flex-col items-center justify-center min-w-[60px] h-full relative transition-all duration-300 ${item.primary ? 'z-10' : ''}`}
              >
                {item.primary ? (
                  <div className="flex flex-col items-center justify-center gap-1">
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      className="relative"
                    >
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-[1.125rem] blur-md opacity-40" />

                      {/* Main button */}
                      <div className="relative bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-[1.125rem] w-14 h-14 flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(20,184,166,0.5)] dark:shadow-[0_8px_20px_-4px_rgba(20,184,166,0.3)] group transition-all duration-300">
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-200 rounded-[1.125rem]" />
                        <item.icon className="w-6 h-6 relative z-10" strokeWidth={2.5} />
                        <motion.div
                          animate={{ opacity: [0.3, 0.15, 0.3], scale: [1, 1.15, 1] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute inset-0 bg-white/10 rounded-[1.125rem]"
                        />
                      </div>
                    </motion.div>
                    <span className={`text-[10px] font-bold tracking-tight transition-colors ${isActive(item.path) ? 'text-teal-700 dark:text-teal-300' : 'text-teal-600 dark:text-teal-400'}`}>
                      {item.label}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1">
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      className={`p-2 rounded-xl transition-all duration-200 ${isActive(item.path) ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                      <item.icon className="w-5.5 h-5.5" strokeWidth={isActive(item.path) ? 2.5 : 2} />
                    </motion.div>
                    <span className={`text-[10px] font-bold tracking-tight transition-colors ${isActive(item.path) ? 'text-teal-700 dark:text-teal-300' : 'text-slate-400 dark:text-gray-500'}`}>
                      {item.label}
                    </span>
                    {isActive(item.path) && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute -top-1 w-1.5 h-1.5 bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.8)]"
                      />
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      )}
    </div>
  );
};

export const Header: React.FC<{ setBottomMenuOpen?: (isOpen: boolean) => void }> = ({ setBottomMenuOpen = () => { } }) => {
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
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

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services', icon: <Briefcase className="w-4 h-4" /> },
    { path: '/pricing', label: 'Pricing' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact', icon: <Phone className="w-4 h-4" /> },
  ];

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 shadow-lg shadow-gray-100/50 dark:shadow-none'
        : 'bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-18 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0 z-10">
              <div className="relative">
                <div className="bg-gradient-to-br from-teal-600 to-emerald-700 p-1.5 sm:p-2 rounded-lg lg:p-2.5 lg:rounded-xl shadow-lg">
                  <Scale className="w-5 h-5 sm:w-6 lg:w-7 lg:h-7 text-white" />
                </div>
              </div>
              <div>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-none block">PocketLawyer</span>
                <span className="hidden sm:block text-[9px] lg:text-[10px] font-medium text-teal-600 dark:text-teal-400 tracking-wider uppercase mt-0.5">
                  AI Legal Assistant
                </span>
              </div>
            </Link>

            {/* Desktop Navigation (lg and up) */}
            <nav className="hidden xl:flex items-center gap-1">
              {navLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 lg:px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.path)
                    ? 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/50'
                    : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                >
                  {item.icon && item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => setBottomMenuOpen(true)}
                aria-label="Open menu"
                className="xl:hidden p-2 sm:p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all active:scale-95"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="p-2 sm:p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all active:scale-95"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {isAuthenticated ? (
                <>
                  {/* Desktop Auth Actions */}
                  <div className="hidden xl:flex items-center gap-3">
                    <button
                      onClick={() => navigate('/chat', { state: { newSession: true } })}
                      className="relative group overflow-hidden bg-gradient-to-r from-teal-600 to-emerald-700 text-white px-4 lg:px-6 py-2.5 rounded-lg text-sm font-semibold hover:shadow-xl hover:shadow-teal-600/20 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <span className="hidden lg:inline">Start Consultation</span>
                        <span className="lg:hidden">Chat</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        aria-label="Open profile menu"
                        className="flex items-center gap-2 lg:gap-3 p-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border border-gray-200 dark:border-slate-700"
                      >
                        <div className="relative">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0E8E82] to-[#0a6d62] flex items-center justify-center text-white text-sm font-bold shadow-md">
                            {(user?.full_name || user?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="hidden lg:block text-left mr-2">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.plan || 'Free'} Plan</div>
                        </div>
                        <ChevronDown className={`hidden lg:block w-4 h-4 text-gray-400 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
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
                </>
              ) : (
                <div className="hidden xl:flex items-center gap-2 sm:gap-3">
                  <Link
                    to="/login"
                    className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="relative overflow-hidden bg-gradient-to-r from-teal-600 to-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold hover:shadow-xl hover:shadow-teal-600/20 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

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
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300 pt-16 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8">
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
                  <Link to="/services" className="text-sm text-gray-400 hover:text-teal-400 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-400" />
              Support
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'About Us', to: '/about' },
                { label: 'Pricing', to: '/pricing' },
                { label: 'Contact Support', to: '/contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-gray-400 hover:text-teal-400 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                    {item.label}
                  </Link>
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
                <Mail className="w-4 h-4" />
                <a href="mailto:support@pocketlawyer.ai" className="hover:text-teal-400 transition-colors">support@pocketlawyer.ai</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} PocketLawyer AI. All rights reserved.
              <span className="block md:inline mt-1 md:mt-0 md:ml-2 text-gray-600">
                This platform provides AI-assisted legal guidance and is not a substitute for professional legal advice.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/contact" className="text-gray-500 hover:text-teal-400 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};