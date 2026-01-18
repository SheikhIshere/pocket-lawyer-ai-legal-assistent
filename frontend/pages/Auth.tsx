import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, Shield, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../App';

// Layout Wrapper for Auth Pages
const AuthLayout: React.FC<{ children: React.ReactNode, title: string, subtitle: string, imagePrompt?: string }> = ({ children, title, subtitle, imagePrompt }) => (
  <div className="min-h-screen flex bg-white">
    {/* Left Side - Form */}
    <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center lg:text-left">
           <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
           <p className="mt-2 text-slate-600">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
    
    {/* Right Side - Visual */}
    <div className="hidden lg:flex w-1/2 bg-slate-900 text-white relative items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 to-slate-900/90 z-10"></div>
      <img src="https://picsum.photos/800/1200" alt="Auth Visual" className="absolute inset-0 w-full h-full object-cover" />
      <div className="relative z-20 max-w-lg p-12 text-center">
         <div className="mb-6 flex justify-center"><Shield size={64} className="text-primary-400" /></div>
         <h3 className="text-3xl font-bold mb-4">Secure, Private, Professional</h3>
         <p className="text-slate-300 text-lg">"Pocket Lawyer has revolutionized how I handle legal documents. It's fast, secure, and incredibly accurate."</p>
         <div className="mt-8 flex justify-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            <span className="w-2 h-2 rounded-full bg-white/50"></span>
            <span className="w-2 h-2 rounded-full bg-white/50"></span>
         </div>
      </div>
    </div>
  </div>
);

// Components
export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    navigate('/chat');
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Please enter your details to sign in.">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            placeholder="name@company.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <div className="relative">
            <input 
              type={showPass ? "text" : "password"} 
              required 
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="flex justify-end mt-2">
            <Link to="/change-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Forgot Password?</Link>
          </div>
        </div>
        <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg">
          Sign In
        </button>
        
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">Or continue with</span></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {['Google', 'Facebook', 'X'].map(p => (
            <button type="button" key={p} className="flex items-center justify-center py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition text-sm font-medium text-slate-600">
              {p}
            </button>
          ))}
        </div>
        <p className="text-center text-slate-600">
          Don't have an account? <Link to="/register" className="text-primary-600 font-bold hover:underline">Sign up</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export const Register = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/verify-otp');
  };

  return (
    <AuthLayout title="Create Account" subtitle="Get instant legal guidance today.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input type="text" required className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input type="email" required className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="john@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <div className="relative">
            <input 
              type={showPass ? "text" : "password"} 
              required 
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Create a strong password"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-slate-400">
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters.</p>
        </div>
        <div className="flex items-start">
          <input id="terms" type="checkbox" required className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded" />
          <label htmlFor="terms" className="ml-2 block text-sm text-slate-600">
            I agree to the <a href="#" className="text-primary-600 hover:underline">Terms</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.
          </label>
        </div>
        <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 transition shadow-md">
          Create Account
        </button>
        <p className="text-center text-slate-600">
          Already have an account? <Link to="/login" className="text-primary-600 font-bold hover:underline">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export const VerifyOtp = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    login("newuser@example.com");
    navigate('/chat');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600">
          <Shield size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h2>
        <p className="text-slate-600 mb-8">We sent a verification code to your email.</p>
        
        <form onSubmit={handleVerify}>
          <div className="flex justify-center space-x-2 mb-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <input 
                key={i} 
                type="text" 
                maxLength={1} 
                className="w-12 h-14 border border-slate-300 rounded-lg text-center text-xl font-bold focus:ring-2 focus:ring-primary-500 outline-none"
              />
            ))}
          </div>
          <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 transition">
            Verify Email
          </button>
        </form>
        <button className="mt-4 text-sm text-slate-500 hover:text-slate-700">Resend Code</button>
      </div>
    </div>
  );
};

export const LogoutConfirm = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    
    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                    <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Log Out?</h3>
                <p className="text-slate-600 mb-6">Are you sure you want to end your session?</p>
                <div className="flex space-x-4">
                    <button onClick={() => navigate(-1)} className="flex-1 py-2.5 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                    <button onClick={() => { logout(); navigate('/'); }} className="flex-1 py-2.5 bg-red-600 rounded-lg font-medium text-white hover:bg-red-700">Log Out</button>
                </div>
            </div>
        </div>
    )
}

export const EditProfile = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input type="text" className="w-full p-2 border rounded" defaultValue="John Doe" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <input type="tel" className="w-full p-2 border rounded" defaultValue="+880 1700..." />
                </div>
                <div className="flex space-x-4 pt-4">
                    <button className="bg-primary-600 text-white px-6 py-2 rounded-lg" onClick={() => navigate('/dashboard')}>Save Changes</button>
                    <button className="text-slate-600 px-6 py-2" onClick={() => navigate('/dashboard')}>Cancel</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export const ChangePassword = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-md mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Change Password</h2>
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600">
                <Lock size={24} />
            </div>
            <div className="space-y-4">
                <input type="password" placeholder="Old Password" className="w-full p-3 border rounded-lg" />
                <input type="password" placeholder="New Password" className="w-full p-3 border rounded-lg" />
                <input type="password" placeholder="Confirm New Password" className="w-full p-3 border rounded-lg" />
                
                <div className="space-y-2 text-xs text-slate-500">
                    <p className="flex items-center text-red-500"><span className="mr-2">×</span> Must be at least 8 characters</p>
                    <p className="flex items-center text-green-600"><span className="mr-2">✓</span> Include a number</p>
                </div>

                <div className="flex space-x-3 pt-2">
                    <button className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg" onClick={() => navigate('/dashboard')}>Save</button>
                    <button className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-lg" onClick={() => navigate(-1)}>Cancel</button>
                </div>
            </div>
        </div>
    </div>
  )
}