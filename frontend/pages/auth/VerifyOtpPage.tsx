import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, ArrowLeft, Mail, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const VerifyOtpPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isResending, setIsResending] = useState(false);

  const { verifyRegistrationOtp, verifyLoginOtp, tempEmail, isRegistration } = useAuth();
  const navigate = useNavigate();

  // Check if user has temp email from registration/login
  React.useEffect(() => {
    const storedEmail = localStorage.getItem('temp_email');
    console.log('VerifyOtpPage - temp_email from localStorage:', storedEmail);
    console.log('VerifyOtpPage - tempEmail from context:', tempEmail);
    console.log('VerifyOtpPage - isRegistration:', isRegistration);

    if (!storedEmail) {
      // No temp email, redirect to login
      console.log('No temp email found, redirecting to login');
      navigate('/login');
      return;
    }
  }, [navigate, tempEmail, isRegistration]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a 6-digit verification code");
      return;
    }

    if (!tempEmail) {
      setError('Email not found. Please try logging in again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('OTP Verification - Email:', tempEmail);
      console.log('OTP Verification - Is Registration:', isRegistration);
      console.log('OTP Verification - Submitting code:', otp);

      // Use the appropriate verification method based on whether it's registration or login
      const result = isRegistration ?
        await verifyRegistrationOtp(tempEmail, otp) :
        await verifyLoginOtp(tempEmail, otp);

      console.log('OTP verification result:', result);

      // Check if verification was successful
      if (result) {
        console.log('OTP verification successful - navigating to chat');
        navigate('/chat');
      } else {
        console.log('OTP verification failed - invalid result');
        setError('Invalid verification code. Please check your email and try again.');
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      console.error('Error details:', {
        message: err?.message,
        detail: err?.detail,
        status: err?.status,
        statusText: err?.statusText
      });

      // Handle different error types
      let errorMessage = 'Verification failed. Please try again.';

      if (err?.status === 400) {
        errorMessage = err?.message || err?.detail || 'Invalid verification code. Please check your email and try again.';
      } else if (err?.status === 401) {
        errorMessage = 'Unauthorized. Please register again.';
      } else if (err?.status === 403) {
        errorMessage = 'Verification code expired. Please request a new one.';
      } else if (err?.status === 429) {
        errorMessage = 'Too many attempts. Please wait before trying again.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');

    try {
      if (!tempEmail) {
        setError('Email not found. Please try logging in again.');
        return;
      }

      // Import authService for resend functionality
      const { authService } = await import('../../services/api');

      // Use the appropriate resend method based on whether it's registration or login
      const result = isRegistration ?
        await authService.resendRegistrationOtp(tempEmail) :
        await authService.resendLoginOtp(tempEmail);

      console.log('Resend OTP result:', result);

      setTimeLeft(300); // Reset timer
      setError('');
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setOtp(numericValue);
    setError(''); // Clear error when user types
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 transition-colors duration-500">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%239CA3AF&quot; fill-opacity=&quot;0.1&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-6 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center">Verify Your Email</h1>
            <p className="text-teal-100 text-center text-sm">
              We've sent a 6-digit verification code to your email address
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-red-800 dark:text-red-200 mb-1">Verification Failed</div>
                  <div className="text-red-700 dark:text-red-300 text-sm">{error}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-3 text-center">
                  Enter 6-digit code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => handleOtpChange(e.target.value)}
                    className="w-full text-center text-3xl tracking-[0.5em] font-bold py-4 px-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none transition-all text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800"
                    placeholder="000000"
                    autoFocus
                    disabled={isLoading}
                  />
                  {otp.length === 6 && !error && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Timer */}
              <div className="text-center">
                {timeLeft > 0 ? (
                  <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Code expires in {formatTime(timeLeft)}</span>
                  </div>
                ) : (
                  <div className="text-sm text-orange-600 font-medium">
                    Code expired. Please request a new one.
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-teal-600 text-white py-4 rounded-xl font-semibold hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || timeLeft > 240} // Prevent spam (wait at least 1 minute)
                  className="w-full text-teal-600 font-medium hover:text-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {isResending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-teal-600 dark:border-teal-400 border-t-transparent animate-spin rounded-full"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Resend Code</span>
                    </>
                  )}
                </button>

                <div className="text-center mt-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="flex items-center justify-center gap-2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 mx-auto text-sm transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Login</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Security Badge */}
          <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <Shield className="w-3 h-3" />
              <span>Your code is encrypted and secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;