import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Eye, EyeOff, ArrowRight, User, Mail, Lock } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form validation:', {
      password,
      confirmPassword,
      passwordsMatch: password === confirmPassword
    });
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    console.log('Submitting registration with data:', { email, full_name, password: '***', confirmPassword: '***' });
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await register({ email, password, full_name, password2: confirmPassword });
      console.log('Registration API result:', result);
      
      // If registration is successful, user will be redirected to OTP page
      // The AuthContext handles the navigation automatically
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
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12 bg-white">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <Shield className="w-8 h-8 text-teal-600" />
          <span className="text-2xl font-bold text-slate-800">Pocket Lawyer</span>
        </Link>
        
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
          <p className="text-slate-500 mb-8">Join 50,000+ users getting instant legal help.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={full_name}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-teal-600 text-white py-3.5 rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-8 text-slate-500 text-sm">
            Already have an account? <Link to="/login" className="text-teal-600 font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>

       {/* Right Side - Visual */}
       <div className="hidden lg:flex w-1/2 bg-slate-900 flex-col justify-center items-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 opacity-90"></div>
        
        {/* Robot/AI Image */}
        <div className="relative z-10 text-center px-12">
          <div className="relative mb-8">
            <img 
              src="https://picsum.photos/seed/ai-robot/400/300" 
              alt="AI Legal Assistant Robot"
              className="w-full max-w-md mx-auto rounded-2xl shadow-2xl border-2 border-teal-400/30"
            />
            {/* Floating elements around robot */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-teal-400 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-400 rounded-full opacity-40 animate-bounce"></div>
            <div className="absolute top-1/2 -left-8 w-4 h-4 bg-green-400 rounded-full opacity-50 animate-ping"></div>
          </div>
          
          <Shield className="w-20 h-20 text-teal-400 mx-auto mb-8" />
          <h2 className="text-3xl font-bold mb-4">Trusted by 250,000+ People</h2>
          <p className="text-slate-400 mb-8">Join the fastest growing legal AI community.</p>
          
          <div className="grid grid-cols-3 gap-6 text-center">
             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
               <div className="text-2xl font-bold text-white">4.8/5</div>
               <div className="text-xs text-slate-400">Rating</div>
             </div>
             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
               <div className="text-2xl font-bold text-white">24/7</div>
               <div className="text-xs text-slate-400">Support</div>
             </div>
             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
               <div className="text-2xl font-bold text-white">100%</div>
               <div className="text-xs text-slate-400">Secure</div>
             </div>
          </div>
          
          {/* Tech badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="px-3 py-1 bg-teal-600/20 text-teal-400 text-xs rounded-full border border-teal-600/30">AI-Powered</span>
            <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full border border-blue-600/30">Bank-Level Security</span>
            <span className="px-3 py-1 bg-green-600/20 text-green-400 text-xs rounded-full border border-green-600/30">GDPR Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;