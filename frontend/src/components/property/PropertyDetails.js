import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { apiHelpers, API_BASE_URL } from '../../services/api';
import Navigation from '../layout/Navigation';

const PropertyDetails = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const [user, setUser] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Property metrics
  const [metrics, setMetrics] = useState({
    maintenanceItems: 0,
    expenses: 0,
    projects: 0,
    documents: 0
  });

  useEffect(() => {
    // Check if user is logged in
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    
    if (!userString || !token) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userString));
    
    // Fetch property details
    fetchPropertyDetails(propertyId);
    
    // Fetch property metrics
    fetchPropertyMetrics(propertyId);
  }, [navigate, propertyId]);

  // Fetch property details
  const fetchPropertyDetails = async (id) => {
    try {
      setLoading(true);
      const propertyData = await apiHelpers.get(`/properties/${id}`);
      setProperty(propertyData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching property details:', err);
      setError('Failed to load property details. Please try again later.');
      setLoading(false);
    }
  };

  // Fetch property metrics from various endpoints
  const fetchPropertyMetrics = async (id) => {
    try {
      // Parallel requests using Promise.all
      const [maintenanceResponse, expensesResponse, projectsResponse, documentsResponse] = await Promise.all([
        // Fetch maintenance items
        apiHelpers.get('/maintenance/', { property_id: id })
          .catch(() => []),
        
        // Fetch expenses for current month
        apiHelpers.get('/finances/expenses/', { property_id: id })
          .catch(() => []),
        
        // Fetch projects
        apiHelpers.get('/projects/', { property_id: id })
          .catch(() => []),
        
        // Fetch documents
        apiHelpers.get('/documents/', { property_id: id })
          .catch(() => [])
      ]);
      
      // Process the data based on what's returned
      const maintenanceItems = Array.isArray(maintenanceResponse) ? maintenanceResponse.length : 0;
      const expenses = Array.isArray(expensesResponse) 
        ? expensesResponse.reduce((sum, expense) => sum + expense.amount, 0) 
        : 0;
      const projects = Array.isArray(projectsResponse) ? projectsResponse.length : 0;
      const documents = Array.isArray(documentsResponse) ? documentsResponse.length : 0;
      
      setMetrics({
        maintenanceItems,
        expenses,
        projects,
        documents
      });
    } catch (err) {
      console.error('Error fetching property metrics:', err);
      // Don't set error message here as it's not critical
      // We'll just show 0 for metrics that failed to load
    }
  };

  // Set property as current and navigate to dashboard
  const manageProperty = () => {
    localStorage.setItem('currentPropertyId', propertyId);
    navigate('/homie-dashboard');
  };

  // Set as primary residence
  const setAsPrimaryResidence = async () => {
    try {
      setLoading(true);
      
      await apiHelpers.post(`/properties/${propertyId}/set-primary`, {});
      
      // Update local state
      setProperty({
        ...property,
        is_primary_residence: true
      });
      
      setMessage('Primary residence updated successfully!');
      setLoading(false);
    } catch (err) {
      console.error('Error setting primary residence:', err);
      setError('Failed to update primary residence. Please try again later.');
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Get property type badge styling
  const getPropertyTypeBadge = (type) => {
    switch(type?.toLowerCase()) {
      case 'residential':
        return 'bg-teal-900 bg-opacity-30 text-teal-300';
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
        {/* Back button and title */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <Link to="/property-hub" className="text-gray-400 hover:text-gray-300 mb-2 inline-flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Property Hub
            </Link>
            <h1 className="text-2xl font-bold">Property Details</h1>
          </div>
          
          <div className="flex space-x-3">
            {property && !property.is_primary_residence && (
              <button 
                className="px-4 py-2 border border-teal-500 text-teal-500 hover:bg-teal-500 hover:bg-opacity-20 rounded-md text-sm"
                onClick={setAsPrimaryResidence}
                disabled={loading}
              >
                Set as Primary Residence
              </button>
            )}
            
            <button 
              className="btn-secondary text-sm px-4 py-2 rounded-md"
              onClick={manageProperty}
              disabled={loading}
            >
              Manage Property
            </button>
          </div>
        </div>
        
        {/* Error and success messages */}
        {error && (
          <div className="bg-red-900 bg-opacity-30 text-red-400 p-4 rounded-md mb-6">
            {error}
            <button 
              className="float-right text-red-400 hover:text-red-300"
              onClick={() => setError('')}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        )}
        
        {message && (
          <div className="bg-green-900 bg-opacity-30 text-green-400 p-4 rounded-md mb-6">
            {message}
            <button 
              className="float-right text-green-400 hover:text-green-300"
              onClick={() => setMessage('')}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <svg className="animate-spin h-8 w-8 text-secondary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-3 text-gray-400">Loading property details...</p>
          </div>
        ) : property ? (
          <>
            {/* Property Overview */}
            <div className="card p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Property Image */}
                <div className="md:w-1/3">
                  <div className="h-60 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
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
                          fallbackSvg.innerHTML = `<svg class="h-16 w-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                          </svg>`;
                          e.target.parentNode.appendChild(fallbackSvg.firstChild);
                        }}
                      />
                    ) : (
                      <svg className="h-16 w-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                      </svg>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPropertyTypeBadge(property.property_type)}`}>
                      {property.property_type?.charAt(0).toUpperCase() + property.property_type?.slice(1) || 'Residential'}
                    </span>
                    
                    {property.is_primary_residence && (
                      <span className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
                        Primary Residence
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Property Details */}
                <div className="md:w-2/3">
                  <h2 className="text-xl font-bold mb-2">{property.address}</h2>
                  <p className="text-gray-400">{property.city}, {property.state} {property.zip}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                    {property.bedrooms !== undefined && (
                      <div>
                        <p className="text-gray-400 text-sm">Bedrooms</p>
                        <p className="font-medium">{property.bedrooms}</p>
                      </div>
                    )}
                    
                    {property.bathrooms !== undefined && (
                      <div>
                        <p className="text-gray-400 text-sm">Bathrooms</p>
                        <p className="font-medium">{property.bathrooms}</p>
                      </div>
                    )}
                    
                    {property.square_footage && (
                      <div>
                        <p className="text-gray-400 text-sm">Square Footage</p>
                        <p className="font-medium">{property.square_footage.toLocaleString()} sqft</p>
                      </div>
                    )}
                    
                    {property.purchase_price && (
                      <div>
                        <p className="text-gray-400 text-sm">Purchase Price</p>
                        <p className="font-medium">{formatCurrency(property.purchase_price)}</p>
                      </div>
                    )}
                    
                    {property.current_value && (
                      <div>
                        <p className="text-gray-400 text-sm">Current Value</p>
                        <p className="font-medium">{formatCurrency(property.current_value)}</p>
                      </div>
                    )}
                    
                    {property.purchase_date && (
                      <div>
                        <p className="text-gray-400 text-sm">Purchase Date</p>
                        <p className="font-medium">{formatDate(property.purchase_date)}</p>
                      </div>
                    )}
                  </div>
                  
                  {property.description && (
                    <div className="mt-6">
                      <p className="text-gray-400 text-sm">Description</p>
                      <p>{property.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Property Metrics */}
            <h2 className="text-xl font-semibold mb-6">Property Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm">Maintenance</p>
                    <h3 className="text-xl font-bold mt-1">{metrics.maintenanceItems} items</h3>
                  </div>
                  <div className="p-3 rounded-full bg-orange-900 bg-opacity-30">
                    <svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <Link to="/maintenance" onClick={manageProperty} className="text-teal-500 hover:text-teal-400 text-sm block mt-4">
                  View Maintenance
                </Link>
              </div>
              
              <div className="card p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm">Expenses</p>
                    <h3 className="text-xl font-bold mt-1">{formatCurrency(metrics.expenses)}</h3>
                  </div>
                  <div className="p-3 rounded-full bg-green-900 bg-opacity-30">
                    <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <Link to="/expenses" onClick={manageProperty} className="text-teal-500 hover:text-teal-400 text-sm block mt-4">
                  View Expenses
                </Link>
              </div>
              
              <div className="card p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm">Projects</p>
                    <h3 className="text-xl font-bold mt-1">{metrics.projects} active</h3>
                  </div>
                  <div className="p-3 rounded-full bg-blue-900 bg-opacity-30">
                    <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
                    </svg>
                  </div>
                </div>
                <Link to="/projects" onClick={manageProperty} className="text-teal-500 hover:text-teal-400 text-sm block mt-4">
                  View Projects
                </Link>
              </div>
              
              <div className="card p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm">Documents</p>
                    <h3 className="text-xl font-bold mt-1">{metrics.documents} files</h3>
                  </div>
                  <div className="p-3 rounded-full bg-purple-900 bg-opacity-30">
                    <svg className="h-6 w-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                </div>
                <Link to="/documents" onClick={manageProperty} className="text-teal-500 hover:text-teal-400 text-sm block mt-4">
                  View Documents
                </Link>
              </div>
            </div>
            
            {/* Property Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Property Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  className="btn-secondary py-3 rounded-md"
                  onClick={manageProperty}
                >
                  Manage Property
                </button>
                
                <button 
                  className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-md"
                  onClick={() => navigate(`/edit-property/${propertyId}`)}
                >
                  Edit Property
                </button>
                
                <button 
                  className="border border-red-500 text-red-500 hover:bg-red-900 hover:bg-opacity-20 py-3 rounded-md"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
                      // Implement property deletion logic here
                      console.log('Deleting property:', propertyId);
                      // apiHelpers.delete(`/properties/${propertyId}`).then(() => {
                      //   navigate('/property-hub', { state: { message: 'Property deleted successfully' } });
                      // }).catch(err => {
                      //   setError('Failed to delete property. Please try again later.');
                      // });
                    }
                  }}
                >
                  Remove Property
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="card p-6 text-center">
            <svg className="h-16 w-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <h3 className="text-lg font-medium mb-2">Property Not Found</h3>
            <p className="text-gray-400 mb-6">The property you're looking for doesn't exist or you don't have access to it.</p>
            <Link to="/property-hub" className="btn-secondary px-4 py-2 rounded-md">
              Back to Property Hub
            </Link>
          </div>
        )}
      </div>
    </Navigation>
  );
};

export default PropertyDetails;