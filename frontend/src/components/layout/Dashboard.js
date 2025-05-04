import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { apiHelpers } from '../../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if there's a message from the add property page
    if (location.state && location.state.message) {
      setMessage(location.state.message);
    }

    // Check if user is logged in
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    
    if (!userString || !token) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userString));
    
    // Fetch properties
    const fetchProperties = async () => {
      try {
        const properties = await apiHelpers.get('properties/');
        setProperties(properties);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [navigate, location.state]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="navbar fixed top-0 w-full z-40 py-3 px-4 md:px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center">
              <svg className="h-8 w-8 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span className="text-xl font-bold">
                <span className="property-text">Property</span>
                <span className="accent-text">Pal</span>
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="relative">
              <button 
                className="flex items-center focus:outline-none"
                onClick={handleLogout}
              >
                <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
                  {user && user.first_name && user.last_name ? 
                    `${user.first_name[0]}${user.last_name[0]}` : 'U'}
                </div>
                <span className="ml-2 text-sm hidden md:block">{user && `${user.first_name} ${user.last_name}`}</span>
                <svg className="h-4 w-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 px-4 md:px-6 flex-grow">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          
          {error && (
            <div className="bg-red-900 bg-opacity-30 text-red-400 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-900 bg-opacity-30 text-green-400 p-3 rounded-md mb-4">
              {message}
            </div>
          )}
          
          {/* Properties Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Properties</h2>
              <Link to="/add-property" className="btn-secondary text-sm px-3 py-1 rounded-md">
                <svg className="h-4 w-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add Property
              </Link>
            </div>
            
            {properties.length === 0 ? (
              <div className="card p-6 text-center">
                <svg className="h-16 w-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                <h3 className="text-lg font-medium mb-2">No Properties Found</h3>
                <p className="text-gray-400 mb-4">You haven't added any properties yet.</p>
                <Link to="/add-property" className="btn-primary px-4 py-2 rounded-md">
                  <svg className="h-4 w-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add Your First Property
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map(property => (
                  <div key={property.id} className="card overflow-hidden">
                    <div className="h-32 bg-gray-700 flex items-center justify-center">
                      {property.image_url ? (
                        <img 
                          src={property.image_url} 
                          alt={property.address}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg truncate">{property.address}</h3>
                      <p className="text-gray-400 text-sm">{property.city}, {property.state} {property.zip}</p>
                      <div className="mt-3 flex items-center text-sm">
                        <span className="text-gray-400 mr-3">
                          <svg className="h-4 w-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                          </svg>
                          {property.property_type}
                        </span>
                        {property.bedrooms && (
                          <span className="text-gray-400 mr-3">
                            <svg className="h-4 w-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                            {property.bedrooms} bd
                          </span>
                        )}
                        {property.bathrooms && (
                          <span className="text-gray-400">
                            <svg className="h-4 w-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                            {property.bathrooms} ba
                          </span>
                        )}
                      </div>
                      <div className="mt-4 flex justify-between">
                        <button className="btn-primary text-xs px-3 py-1 rounded-md">
                          View Details
                        </button>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          property.status === 'active' ? 'bg-green-900 text-green-300 bg-opacity-30' :
                          property.status === 'vacant' ? 'bg-yellow-900 text-yellow-300 bg-opacity-30' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {property.status?.charAt(0).toUpperCase() + property.status?.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;