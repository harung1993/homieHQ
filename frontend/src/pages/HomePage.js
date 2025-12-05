import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero section */}
      <div className="bg-gradient-to-b from-gray-900 to-background py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <div className="text-6xl font-bold mb-4">
                <span className="property-text">Property</span>Pal
              </div>
              <h1 className="text-3xl font-bold mb-4">Your Complete Property Management Solution</h1>
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
                  <svg className="absolute inset-0 h-full w-full text-sky-400 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img src="/dashboard.png" alt="PropertyPal Dashboard" className="rounded-lg" />
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-card-bg rounded-lg overflow-hidden shadow-xl flex items-center justify-center">
                  <svg className="h-20 w-20 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="h-12 w-12 rounded-full bg-sky-400 bg-opacity-20 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <p className="text-xl text-gray-400 mb-8">Join thousands of homeowners who are saving time and reducing stress with PropertyPal.</p>
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

export default HomePage;