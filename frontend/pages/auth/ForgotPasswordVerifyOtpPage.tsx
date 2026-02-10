import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Mail, Clock, CheckCircle, AlertCircle, RefreshCw, Lock } from 'lucide-react';

const ForgotPasswordVerifyOtpPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isResending, setIsResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  // Check if user has temp email from forgot password
  React.useEffect(() => {
    const storedEmail = localStorage.getItem('temp_email');
    console.log('ForgotPasswordVerifyOtpPage - temp_email from localStorage:', storedEmail);

    if (!storedEmail) {
      // No temp email, redirect to forgot password
      console.log('No temp email found, redirecting to forgot password');
      navigate('/forgot-password');
      return;
    }
  }, [navigate]);

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

    // Validation
    if (otp.length !== 6) {
      setError("Please enter a 6-digit verification code");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    const storedEmail = localStorage.getItem('temp_email');
    if (!storedEmail) {
      setError('Email not found. Please try the forgot password process again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Forgot Password OTP Verification - Email:', storedEmail);
      console.log('Forgot Password OTP Verification - Submitting code:', otp);

      // Import authService for forgot password OTP verification
      const { authService } = await import('../../services/api');

      // First verify OTP
      const verifyResult = await authService.verifyForgotPasswordOtp(storedEmail, otp);
      console.log('Forgot password OTP verification result:', verifyResult);

      if (verifyResult) {
        // Then reset password
        const resetResult = await authService.resetPassword(storedEmail, newPassword);
        console.log('Password reset result:', resetResult);

        if (resetResult) {
          // Clear temp email and redirect to login
          localStorage.removeItem('temp_email');
          console.log('Password reset successful - navigating to login');
          navigate('/login');
        } else {
          setError('Failed to reset password. Please try again.');
        }
      } else {
        setError('Invalid verification code. Please check your email and try again.');
      }
    } catch (err: any) {
      console.error('Forgot password OTP verification error:', err);
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
        errorMessage = 'Unauthorized. Please try the forgot password process again.';
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

  const handleResendOtp = async () => {
    if (timeLeft > 0) return;

    setIsResending(true);
    setError('');

    try {
      // Import authService for resend functionality
      const { authService } = await import('../../services/api');

      const storedEmail = localStorage.getItem('temp_email');
      const result = await authService.resendForgotPasswordOtp(storedEmail);

      console.log('Resend forgot password OTP result:', result);

      // Reset timer
      setTimeLeft(300);

      // Show success message
      setError('Verification code sent successfully!');
      setTimeout(() => setError(''), 3000);

    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError('Failed to resend verification code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '');
    setOtp(numericValue);

    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-500">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/forgot-password')}
          className="mb-8 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Forgot Password</span>
        </button>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Reset Your Password</h1>
            <p className="text-orange-100/80">
              Verify your identity and create a new password
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Display */}
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Mail className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium">Verification code sent to:</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{localStorage.getItem('temp_email')}</p>
                  </div>
                </div>
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Enter 6-digit verification code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => handleOtpChange(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 text-2xl font-bold text-center tracking-widest border-2 border-gray-300 dark:border-slate-700 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all dark:bg-slate-800 dark:text-white"
                  disabled={isLoading}
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-700 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all pr-12 dark:bg-slate-800 dark:text-white"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-700 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all pr-12 dark:bg-slate-800 dark:text-white"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showConfirmPassword ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Timer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Code expires in: {formatTime(timeLeft)}</span>
                </div>

                {timeLeft === 0 && (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                    {isResending ? 'Sending...' : 'Resend Code'}
                  </button>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className={`flex items-center gap-3 p-4 rounded-lg border ${error.includes('sent successfully')
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30'
                  }`}>
                  {error.includes('sent successfully') ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6 || newPassword.length < 8 || newPassword !== confirmPassword}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3.5 rounded-xl font-bold hover:from-orange-500 hover:to-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-600/20"
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/30">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-semibold mb-1">Security Notice</p>
                  <p>This verification code expires in 5 minutes for your security. Make sure your new password is at least 8 characters long.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordVerifyOtpPage;
