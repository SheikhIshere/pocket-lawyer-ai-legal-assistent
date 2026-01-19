import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/About';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import ChatPage from './pages/ChatPage';
import ServicesPage from './pages/ServicesPage';
import PricingPage from './pages/PricingPage';
import ProfilePage from './pages/ProfilePage';

console.log('App.tsx: Starting App component...');

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, requiresOtp } = useAuth();
  
  if (!isAuthenticated && !requiresOtp) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiresOtp) {
    return <Navigate to="/verify-otp" replace />;
  }

  return <>{children}</>;
};

// Route that requires OTP state but not auth
const OtpRoute = ({ children }: { children: React.ReactNode }) => {
    const { requiresOtp, isAuthenticated } = useAuth();
    if (isAuthenticated && !requiresOtp) {
      return <Navigate to="/chat" replace />;
    }
    return <>{children}</>;
}

const App: React.FC = () => {
  console.log('App.tsx: Rendering App component...');
  
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OtpRoute><VerifyOtpPage /></OtpRoute>} />
          
          {/* Protected Routes */}
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;