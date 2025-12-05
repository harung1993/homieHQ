import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignupForm from './components/auth/SignupForm';
import LoginForm from './components/auth/LoginForm';
import Dashboard from './components/layout/Dashboard';
import HomieHQDashboard from './components/homeowner/HomieHQDashboard';
import Documents from './components/homeowner/Documents';
import Maintenance from './components/homeowner/Maintenance';
import Appliances from './components/homeowner/Appliances';
import Projects from './components/homeowner/Projects';
import PropertyHub from './components/property/PropertyHub';
// Import 'Properties' removed since we're redirecting to PropertyHub
import AddProperty from './components/property/AddProperty';
import PropertyDetails from './components/property/PropertyDetails';
import Settings from './components/homeowner/Settings';
import Budget from './components/homeowner/Budget';
import Expenses from './components/homeowner/Expenses';
import Reports from './components/homeowner/Reports';
import Tenants from './components/tenant/Tenants'; // New Tenant component
import TenantForm from './components/tenant/TenantForm'; // New Tenant Form component
import TenantDocuments from './components/tenant/TenantDocuments'; 
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import VerifyEmail from './components/auth/VerifyEmail';
import ResendVerificationEmail from './components/auth/ResendVerificationEmail';
import './components/homeowner/PropertyPal.css';

// Import apiHelpers instead of using direct axios
import { apiHelpers } from './services/api';

// New landing component to handle routing based on user properties
const Landing = () => {
  const [loading, setLoading] = useState(true);
  const [hasProperties, setHasProperties] = useState(false);
  const [hasPrimaryResidence, setHasPrimaryResidence] = useState(false);

  useEffect(() => {
    const checkUserProperties = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setLoading(false);
          return;
        }
    
        // Use apiHelpers instead of direct axios call
        const properties = await apiHelpers.get('properties/');
    
        
        
        setHasProperties(properties.length > 0);
    
        // If no properties, we'll route to add-property anyway, so we can skip this logic
        if (properties.length > 0) {
          // Check if user has a primary residence
          const primaryProperty = properties.find(p => p.is_primary_residence);
          setHasPrimaryResidence(!!primaryProperty);
          
          if (primaryProperty) {
            localStorage.setItem('currentPropertyId', primaryProperty.id);
          } else {
            // If no primary residence but has properties, set the first one as current
            localStorage.setItem('currentPropertyId', properties[0].id);
          }
        }
    
        setLoading(false);
      } catch (error) {
        
        // For first-time login, even if the properties endpoint fails,
        // we should still set loading to false and let the app continue
        setLoading(false);
        // Assume no properties on error
        setHasProperties(false);
      }
    };
    
    checkUserProperties();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // Redirect logic
  if (!hasProperties) {
    return <Navigate to="/add-property" />;
  } else if (hasPrimaryResidence) {
    return <Navigate to="/homie-dashboard" />;
  } else {
    return <Navigate to="/property-hub" />;
  }
};

// Auth guard component to redirect if not logged in
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('accessToken') !== null;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm />} />
        
        {/* Password Reset Routes */}
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        
        {/* Email Verification Routes */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/resend-verification" element={<ResendVerificationEmail />} />
        
        {/* Landing route that redirects based on user properties */}
        <Route 
          path="/landing" 
          element={
            <ProtectedRoute>
              <Landing />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/homie-dashboard" 
          element={
            <ProtectedRoute>
              <HomieHQDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/property-hub" 
          element={
            <ProtectedRoute>
              <PropertyHub />
            </ProtectedRoute>
          } 
        />
        
        {/* Using PropertyHub for /properties route as well */}
        <Route 
          path="/properties" 
          element={
            <ProtectedRoute>
              <PropertyHub />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/properties/:propertyId" 
          element={
            <ProtectedRoute>
              <PropertyDetails />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/documents" 
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/maintenance" 
          element={
            <ProtectedRoute>
              <Maintenance />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/appliances" 
          element={
            <ProtectedRoute>
              <Appliances />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/projects" 
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/expenses" 
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/budget" 
          element={
            <ProtectedRoute>
              <Budget />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/add-property" 
          element={
            <ProtectedRoute>
              <AddProperty />
            </ProtectedRoute>
          } 
        />
        
        {/* Tenant Management Routes */}
        <Route 
          path="/tenants" 
          element={
            <ProtectedRoute>
              <Tenants />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tenants/add" 
          element={
            <ProtectedRoute>
              <TenantForm />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tenants/edit/:tenantId" 
          element={
            <ProtectedRoute>
              <TenantForm />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tenants/:tenantId/documents" 
          element={
            <ProtectedRoute>
              <TenantDocuments />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;