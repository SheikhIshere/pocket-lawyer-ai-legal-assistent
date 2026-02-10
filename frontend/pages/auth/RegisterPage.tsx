import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Eye, EyeOff, ArrowRight, User, Mail, Lock, UserPlus, Check } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [full_name, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/3b5466ef-e4ad-485a-98f1-d363bc9e423a', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'post-fix-2',
      hypothesisId: 'H11',
      location: 'RegisterPage.tsx:render',
      message: 'RegisterPage rendered',
      data: { pathHash: window.location.hash },
      timestamp: Date.now()
    })
  }).catch(() => { });
  // #endregion agent log

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b5466ef-e4ad-485a-98f1-d363bc9e423a', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'post-fix-3',
        hypothesisId: 'H13',
        location: 'RegisterPage.tsx:handleSubmit:start',
        message: 'Register submit handler invoked',
        data: { hasEmail: !!email, hasFullName: !!full_name },
        timestamp: Date.now()
      })
    }).catch(() => { });
    // #endregion agent log

    console.log('Form validation:', {
      password,
      confirmPassword,
      passwordsMatch: password === confirmPassword
    });

    if (password !== confirmPassword) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b5466ef-e4ad-485a-98f1-d363bc9e423a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'post-fix-3',
          hypothesisId: 'H14',
          location: 'RegisterPage.tsx:handleSubmit:validation',
          message: 'Register submit blocked by password mismatch',
          data: {},
          timestamp: Date.now()
        })
      }).catch(() => { });
      // #endregion agent log

      setError("Passwords don't match");
      return;
    }

    console.log('Submitting registration with data:', { email, full_name, password: '***', confirmPassword: '***' });

    setIsLoading(true);
    setError('');

    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b5466ef-e4ad-485a-98f1-d363bc9e423a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'post-fix-2',
          hypothesisId: 'H9',
          location: 'RegisterPage.tsx:handleSubmit:entry',
          message: 'Register submit started',
          data: { hasEmail: !!email, hasFullName: !!full_name },
          timestamp: Date.now()
        })
      }).catch(() => { });
      // #endregion agent log

      const result = await register({ email, password, full_name, password2: confirmPassword });
      console.log('Registration API result:', result);

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b5466ef-e4ad-485a-98f1-d363bc9e423a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'post-fix-2',
          hypothesisId: 'H12',
          location: 'RegisterPage.tsx:handleSubmit:after-register',
          message: 'register() resolved, about to navigate to OTP page',
          data: { pathHash: window.location.hash },
          timestamp: Date.now()
        })
      }).catch(() => { });
      // #endregion agent log

      // We explicitly navigate now because PublicOnlyRoute allows /register even when requiresOtp=true
      navigate('/register-verify-otp');

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b5466ef-e4ad-485a-98f1-d363bc9e423a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'post-fix-2',
          hypothesisId: 'H10',
          location: 'RegisterPage.tsx:handleSubmit:navigate',
          message: 'Navigating to register OTP page after register() resolved',
          data: { pathHash: window.location.hash },
          timestamp: Date.now()
        })
      }).catch(() => { });
      // #endregion agent log

    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Error details:', {
        message: err?.message,
        stack: err?.stack,
        status: err?.status
      });

      // Handle different error types
      let errorMessage = 'Registration failed. Please try again.';

      if (err?.message?.includes('Email already exists')) {
        errorMessage = 'This email is already registered. Please use a different email or try logging in.';
      } else if (err?.message?.includes('Passwords do not match')) {
        errorMessage = 'Passwords do not match. Please check and try again.';
      } else if (err?.message?.includes('Password too weak')) {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12 bg-white dark:bg-slate-900 border-r border-transparent dark:border-slate-800 transition-colors duration-500">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <Shield className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          <span className="text-2xl font-bold text-slate-800 dark:text-white">Pocket Lawyer</span>
        </Link>

        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
          <p className="text-slate-500 dark:text-gray-400 mb-8">Join 50,000+ users getting instant legal help.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500" />
                <input
                  type="text"
                  required
                  value={full_name}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none dark:text-white"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none dark:text-white"
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
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none dark:text-white"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none dark:text-white"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-teal-600 dark:bg-teal-500 text-white py-3.5 rounded-xl font-bold hover:bg-teal-700 dark:hover:bg-teal-600 transition-all shadow-lg shadow-teal-600/20 active:scale-[0.98]"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-8 text-slate-500 dark:text-gray-400 text-sm">
            Already have an account? <Link to="/login" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">Log in</Link>
          </p>

          {/* Test Button */}
          {/* <button
            onClick={() => {
              console.log('TEST BUTTON CLICKED');
              navigate('/register-verify-otp');
            }}
            className="w-full mt-4 bg-red-600 text-white py-2 rounded-lg"
          >
            TEST: Go to OTP Page
          </button> */}
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-teal-600 flex-col justify-center items-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-blue-600 opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

        <div className="relative z-10 max-w-lg text-center px-8">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30 shadow-2xl">
              <UserPlus className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-6">Start Your Legal Journey Today</h2>
          <p className="text-teal-100 text-lg leading-relaxed mb-12">
            Join thousands of professionals who trust our AI-powered legal assistant for accurate, secure, and instant legal guidance.
          </p>

          <div className="space-y-4 text-left inline-block">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1 rounded-full"><Check className="w-4 h-4 text-white" /></div>
              <span className="font-medium">Free Chat</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1 rounded-full"><Check className="w-4 h-4 text-white" /></div>
              <span className="font-medium">No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1 rounded-full"><Check className="w-4 h-4 text-white" /></div>
              <span className="font-medium">Instant Account Setup</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;