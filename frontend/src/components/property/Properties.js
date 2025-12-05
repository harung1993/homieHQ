import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiHelpers, API_BASE_URL } from '../../services/api';
import Navigation from '../layout/Navigation';

const Properties = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    
    if (!userString || !token) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userString));
    
    // Fetch properties
    fetchProperties();
  }, [navigate]);

  // Fetch all properties
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const fetchedProperties = await apiHelpers.get('/properties/');
      
      if (Array.isArray(fetchedProperties)) {
        setProperties(fetchedProperties);
      } else {
        console.error('Expected properties to be an array but got:', fetchedProperties);
        setProperties([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again later.');
      setLoading(false);
    }
  };

  // Get property type badge styling
  const getPropertyTypeBadge = (type) => {
    switch(type) {
      case 'residential':
        return 'bg-sky-900 bg-opacity-30 text-sky-200';
      case 'commercial':
        return 'bg-blue-900 bg-opacity-30 text-blue-300';
      case 'industrial':
        return 'bg-purple-900 bg-opacity-30 text-purple-300';
      case 'vacation':
        return 'bg-orange-900 bg-opacity-30 text-orange-300';
      case 'land':
        return 'bg-green-900 bg-opacity-30 text-green-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Function to format image URLs correctly
  const getFormattedImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Ensure the URL starts with a slash if needed
    const formattedUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${API_BASE_URL}${formattedUrl}`;
  };

  return (
    <Navigation user={user}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Properties</h1>
            <p className="text-gray-400 mt-1">Manage all your properties in one place</p>
          </div>
          
          <Link 
            to="/add-property" 
            className="btn-secondary text-sm px-4 py-2 rounded-md flex items-center"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Property
          </Link>
        </div>
        
        {/* Error display */}
        {error && (
          <div className="bg-red-900 bg-opacity-30 text-red-400 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {/* Properties Grid */}
        {loading ? (
          <div className="text-center py-12">
            <svg className="animate-spin h-8 w-8 text-secondary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-3 text-gray-400">Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="card p-6 text-center">
            <svg className="h-16 w-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <h3 className="text-lg font-medium mb-2">No Properties Found</h3>
            <p className="text-gray-400 mb-6">You haven't added any properties yet.</p>
            <Link to="/add-property" className="btn-secondary px-4 py-2 rounded-md">
              <svg className="h-4 w-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Your First Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <div key={property.id} className="card overflow-hidden hover:shadow-lg transition-all border border-gray-700">
                {/* Property image or fallback */}
                <div className="relative h-48 bg-gray-700 flex items-center justify-center">
                  {property.image_url ? (
                    <img 
                      src={getFormattedImageUrl(property.image_url)}
                      alt={property.address}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentNode.classList.add('flex', 'items-center', 'justify-center');
                        // Add fallback icon
                        const fallbackSvg = document.createElement("div");
                        fallbackSvg.innerHTML = `<svg class="h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>`;
                        e.target.parentNode.appendChild(fallbackSvg.firstChild);
                      }}
                    />
                  ) : (
                    <svg className="h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPropertyTypeBadge(property.property_type)}`}>
                      {property.property_type?.charAt(0).toUpperCase() + property.property_type?.slice(1)}
                    </span>
                  </div>
                  {property.is_primary_residence && (
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-sky-400 text-white text-xs px-2 py-1 rounded-full">
                        Primary Residence
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Property details */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{property.address}</h3>
                  <p className="text-gray-400 text-sm mb-4">{property.city}, {property.state} {property.zip}</p>
                  
                  {/* Property details grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {property.bedrooms && (
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                        <span className="text-sm">{property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
                      </div>
                    )}
                    
                    {property.bathrooms && (
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                        <span className="text-sm">{property.bathrooms} {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</span>
                      </div>
                    )}
                    
                    {property.square_footage && (
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                        <span className="text-sm">{property.square_footage.toLocaleString()} sq ft</span>
                      </div>
                    )}
                    
                    {property.current_value && (
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span className="text-sm">{formatCurrency(property.current_value)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Manage property button */}
                  <div className="flex justify-between">
                    <Link 
                      to={`/properties/${property.id}`} 
                      className="text-sky-400 hover:text-sky-300 text-sm"
                    >
                      View Details
                    </Link>
                    <button 
                      onClick={() => {
                        localStorage.setItem('currentPropertyId', property.id);
                        navigate('/homie-dashboard');
                      }}
                      className="btn-secondary text-sm px-3 py-1 rounded-md"
                    >
                      Manage Property
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add property card */}
            <Link to="/add-property" className="card border border-dashed border-gray-600 flex flex-col items-center justify-center h-64 hover:border-sky-400 transition-colors">
              <div className="p-6 text-center">
                <div className="h-16 w-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Add New Property</h3>
                <p className="text-gray-400 text-sm">Add another home to your portfolio</p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </Navigation>
  );
};

export default Properties;