import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoadingScreen from './components/LoadingScreen';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/About';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import RegisterVerifyOtpPage from './pages/auth/RegisterVerifyOtpPage';
import ForgotPasswordVerifyOtpPage from './pages/auth/ForgotPasswordVerifyOtpPage';
import ChatPage from './pages/ChatPage';
import ServicesPage from './pages/ServicesPage';
import PricingPage from './pages/PricingPage';
import SettingsPage from './pages/SettingsPage';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import NotFoundPage from './pages/NotFoundPage';
import NoPermissionPage from './pages/NoPermissionPage';
import PremiumPage from './pages/PremiumPage';

console.log('App.tsx: Starting App component...');

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, requiresOtp } = useAuth();

  if (!isAuthenticated && !requiresOtp) {
    return <Navigate to="/login" replace />;
  }

  if (requiresOtp) {
    const isRegistrationFlow = localStorage.getItem('is_registration') === 'true';
    const isForgotPasswordFlow = localStorage.getItem('is_forgot_password') === 'true';

    if (isRegistrationFlow) {
      return <Navigate to="/register-verify-otp" replace />;
    }

    if (isForgotPasswordFlow) {
      return <Navigate to="/forgot-password-verify-otp" replace />;
    }

    return <Navigate to="/verify-otp" replace />;
  }

  return <>{children}</>;
};

// Route that requires OTP state but not auth
const OtpRoute = ({ children }: { children: React.ReactNode }) => {
  const { requiresOtp, isAuthenticated } = useAuth();
  const isRegistrationFlow = localStorage.getItem('is_registration') === 'true';
  const isForgotPasswordFlow = localStorage.getItem('is_forgot_password') === 'true';

  if (isAuthenticated && !requiresOtp) {
    return <Navigate to="/chat" replace />;
  }

  // Redirect to appropriate OTP page based on flow
  if (isRegistrationFlow) {
    return <Navigate to="/register-verify-otp" replace />;
  }

  if (isForgotPasswordFlow) {
    return <Navigate to="/forgot-password-verify-otp" replace />;
  }

  return <>{children}</>;
}

// Route that requires registration OTP state
const RegisterOtpRoute = ({ children }: { children: React.ReactNode }) => {
  const { requiresOtp, isAuthenticated } = useAuth();
  const isRegistrationFlow = localStorage.getItem('is_registration') === 'true';

  if (isAuthenticated && !requiresOtp) {
    return <Navigate to="/chat" replace />;
  }

  if (!isRegistrationFlow) {
    return <Navigate to="/verify-otp" replace />;
  }

  return <>{children}</>;
}

// Route that requires forgot password OTP state  
const ForgotPasswordOtpRoute = ({ children }: { children: React.ReactNode }) => {
  const { requiresOtp, isAuthenticated } = useAuth();
  const isForgotPasswordFlow = localStorage.getItem('is_forgot_password') === 'true';

  if (isAuthenticated && !requiresOtp) {
    return <Navigate to="/chat" replace />;
  }

  if (!isForgotPasswordFlow) {
    return <Navigate to="/verify-otp" replace />;
  }

  return <>{children}</>;
}

// Route that prevents authenticated users from accessing auth pages
const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, requiresOtp, tempEmail } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/3b5466ef-e4ad-485a-98f1-d363bc9e423a', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'post-fix',
      hypothesisId: 'H7',
      location: 'App.tsx:PublicOnlyRoute',
      message: 'Evaluating PublicOnlyRoute redirect',
      data: {
        path: currentPath,
        isAuthenticated,
        requiresOtp,
        hasTempEmail: !!tempEmail,
        isRegistrationFlag: localStorage.getItem('is_registration') === 'true',
        isForgotPasswordFlag: localStorage.getItem('is_forgot_password') === 'true'
      },
      timestamp: Date.now()
    })
  }).catch(() => { });
  // #endregion agent log

  // Redirect authenticated users to dashboard
  if (isAuthenticated && !requiresOtp) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user explicitly navigates to /login or /register, allow them to see auth forms
  const isAuthEntryPath = currentPath === '/login' || currentPath === '/register';

  // Handle OTP redirection - only if there's a valid temp email and we're not on auth entry routes
  if (!isAuthEntryPath && requiresOtp && tempEmail) {
    const isRegistrationFlow = localStorage.getItem('is_registration') === 'true';
    const isForgotPasswordFlow = localStorage.getItem('is_forgot_password') === 'true';

    if (isRegistrationFlow) {
      return <Navigate to="/register-verify-otp" replace />;
    }

    if (isForgotPasswordFlow) {
      return <Navigate to="/forgot-password-verify-otp" replace />;
    }

    return <Navigate to="/verify-otp" replace />;
  }

  return <>{children}</>;
};

// 403 No Permission Route
const PermissionRoute = ({ children, requiredPermission }: {
  children: React.ReactNode;
  requiredPermission?: string;
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Permission logic based on user plan
  const hasPermission = () => {
    if (!requiredPermission) return true;

    const userPlan = user?.plan?.toLowerCase() || 'free';

    switch (requiredPermission) {
      case 'free':
        return true; // Everyone has access to free features

      case 'basic':
        return ['free', 'basic', 'premium', 'professional', 'enterprise'].includes(userPlan);

      case 'premium':
        return ['premium', 'professional', 'enterprise'].includes(userPlan);

      case 'professional':
        return ['professional', 'enterprise'].includes(userPlan);

      case 'enterprise':
        return userPlan === 'enterprise';

      default:
        return true; // Default to allowing access
    }
  };

  if (!hasPermission()) {
    return <Navigate to="/no-permission" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  console.log('App.tsx: Rendering App component...');

  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
};

// Separate component to use auth context
const AppContent: React.FC = () => {
  const { isAuthenticated, requiresOtp, isInitializing } = useAuth();

  // Show loading screen during initialization
  if (isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
        <Route path="/verify-otp" element={<OtpRoute><VerifyOtpPage /></OtpRoute>} />
        <Route path="/register-verify-otp" element={<RegisterOtpRoute><RegisterVerifyOtpPage /></RegisterOtpRoute>} />
        <Route path="/forgot-password-verify-otp" element={<ForgotPasswordOtpRoute><ForgotPasswordVerifyOtpPage /></ForgotPasswordOtpRoute>} />

        {/* Error Pages */}
        <Route path="/no-permission" element={<NoPermissionPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Protected Routes */}
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />

        {/* Example of permission-based route */}
        <Route
          path="/premium"
          element={
            <PermissionRoute requiredPermission="premium">
              <PremiumPage />
            </PermissionRoute>
          }
        />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;