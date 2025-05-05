import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import SignupForm from './components/auth/SignupForm';
import LoginForm from './components/auth/LoginForm';
import Dashboard from './components/layout/Dashboard';
import HomieHQDashboard from './components/homeowner/HomieHQDashboard';
import Documents from './components/homeowner/Documents';
import Maintenance from './components/homeowner/Maintenance';
import Appliances from './components/homeowner/Appliances';
import Projects from './components/homeowner/Projects';
import PropertyHub from './components/property/PropertyHub';
import Properties from './components/property/Properties';
import AddProperty from './components/property/AddProperty';
import PropertyDetails from './components/property/PropertyDetails';
import Settings from './components/homeowner/Settings';
import Budget from './components/homeowner/Budget';
import Expenses from './components/homeowner/Expenses';
import Reports from './components/homeowner/Reports';
import Tenants from './components/tenant/Tenants'; // New Tenant component
import TenantForm from './components/tenant/TenantForm'; // New Tenant Form component
import TenantDocuments from './components/tenant/TenantDocuments'; // New Tenant Documents component
import './components/homeowner/HomieHQ.css';
import axios from 'axios';

// Home/Landing page component
const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero section */}
      <div className="bg-gradient-to-b from-gray-900 to-background py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <div className="text-6xl font-bold mb-4">
                <span className="homie-text">Homie</span>
                <span className="accent-text">HQ</span>
              </div>
              <h1 className="text-3xl font-bold mb-4">Your Complete Home Management Solution</h1>
              <p className="text-xl text-gray-400 mb-8">
                Simplify your homeownership journey with our all-in-one property management platform.
              </p>
              <div className="flex space-x-4">
                <Link to="/login" className="btn-primary px-6 py-3 rounded-md text-center">
                  Get Started
                </Link>
                <Link to="/signup" className="btn-secondary px-6 py-3 rounded-md text-center">
                  Sign Up Free
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-gray-800 rounded-lg overflow-hidden shadow-xl">
                  <svg className="absolute inset-0 h-full w-full text-teal-500 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img src="/api/placeholder/400/400" alt="HomieHQ Dashboard" className="rounded-lg" />
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-card-bg rounded-lg overflow-hidden shadow-xl flex items-center justify-center">
                  <svg className="h-20 w-20 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features section */}
      <div className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-12 text-center">All Your Home Management Needs in One Place</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-6">
              <div className="h-12 w-12 rounded-full bg-teal-500 bg-opacity-20 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Maintenance Tracking</h3>
              <p className="text-gray-400">Keep track of all your home maintenance tasks with seasonal checklists and reminders.</p>
            </div>
            
            <div className="card p-6">
              <div className="h-12 w-12 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Budget & Expenses</h3>
              <p className="text-gray-400">Manage home expenses, set budgets, and generate detailed financial reports.</p>
            </div>
            
            <div className="card p-6">
              <div className="h-12 w-12 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Document Storage</h3>
              <p className="text-gray-400">Securely store and organize all your important home documents in one place.</p>
            </div>
            
            <div className="card p-6">
              <div className="h-12 w-12 rounded-full bg-purple-500 bg-opacity-20 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Project Management</h3>
              <p className="text-gray-400">Plan, track, and manage all your home improvement projects from start to finish.</p>
            </div>
            
            <div className="card p-6">
              <div className="h-12 w-12 rounded-full bg-orange-500 bg-opacity-20 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Appliance Tracking</h3>
              <p className="text-gray-400">Track warranties, maintenance schedules, and service history for all your home appliances.</p>
            </div>
            
            <div className="card p-6">
              <div className="h-12 w-12 rounded-full bg-red-500 bg-opacity-20 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Tenant Management</h3>
              <p className="text-gray-400">Manage tenants, lease information, and tenant documents for your rental properties.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA section */}
      <div className="py-16 px-4 bg-gradient-to-t from-gray-900 to-background">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to simplify your home management?</h2>
          <p className="text-xl text-gray-400 mb-8">Join thousands of homeowners who are saving time and reducing stress with HomieHQ.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/signup" className="btn-primary px-8 py-4 rounded-md text-center text-lg">
              Get Started for Free
            </Link>
            <Link to="/login" className="btn-secondary px-8 py-4 rounded-md text-center text-lg">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    
        const response = await axios.get('/api/properties/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
    
        // Handle different response formats and empty responses
        // For first-time users, ensure we have an empty array if no properties
        let properties = [];
        
        if (response.data) {
          if (Array.isArray(response.data)) {
            properties = response.data;
          } else if (response.data.properties && Array.isArray(response.data.properties)) {
            properties = response.data.properties;
          }
        }
        
        console.log('Properties data:', properties); // Debug output
        
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
        console.error('Error checking user properties:', error);
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
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm />} />
        
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
        
        <Route 
          path="/properties" 
          element={
            <ProtectedRoute>
              <Properties />
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
        
        {/* New Tenant Management Routes */}
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