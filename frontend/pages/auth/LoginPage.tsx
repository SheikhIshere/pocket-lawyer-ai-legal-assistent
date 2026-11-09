import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Shield, Eye, EyeOff, Check, X } from 'lucide-react';
import ForgotPasswordModal from '../../components/ForgotPasswordModal';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState(() => localStorage.getItem('pl_remember_email') || '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem('pl_remember_email')));
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      if (remember) {
        localStorage.setItem('pl_remember_email', email);
      } else {
        localStorage.removeItem('pl_remember_email');
      }
      // Only navigate to OTP if login is successful and requires OTP
      navigate('/verify-otp');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12 bg-white dark:bg-slate-900 border-r border-transparent dark:border-slate-800 transition-colors duration-500">
        <Link to="/" className="flex items-center gap-2 mb-12">
          <Shield className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          <span className="text-2xl font-bold text-slate-800 dark:text-white">Pocket Lawyer</span>
        </Link>

        <div className="max-w-md w-full mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome back</h1>
          <p className="text-slate-500 dark:text-gray-400 mb-8">Please enter your details to sign in.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center gap-2 border border-red-100 dark:border-red-900/30">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all dark:text-white"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-teal-600 focus:ring-teal-500 dark:bg-slate-800"
                />
                <span className="text-sm text-slate-600 dark:text-gray-400">Remember my email</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-600 dark:bg-teal-500 text-white py-3.5 rounded-xl font-bold hover:bg-teal-700 dark:hover:bg-teal-600 transition-all shadow-lg shadow-teal-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center mt-8 text-slate-500 dark:text-gray-400 text-sm">
            Don't have an account? <Link to="/register" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-teal-600 flex-col justify-center items-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-blue-600 opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

        <div className="relative z-10 max-w-lg text-center px-8">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30 shadow-2xl">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-6">Your legal sessions, in one place</h2>
          <p className="text-teal-100 text-lg leading-relaxed mb-12">
            Sign in to keep your consultations, documents, and account settings together.
          </p>

          <div className="space-y-4 text-left inline-block">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1 rounded-full"><Check className="w-4 h-4 text-white" /></div>
              <span className="font-medium">Email and password sign-in</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1 rounded-full"><Check className="w-4 h-4 text-white" /></div>
              <span className="font-medium">Session history in your account</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1 rounded-full"><Check className="w-4 h-4 text-white" /></div>
              <span className="font-medium">Access from any device</span>
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  );
};

export default LoginPage;