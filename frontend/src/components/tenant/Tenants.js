import React, { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import axios from 'axios';
import Navigation from '../layout/Navigation';
import PropertySelector from '../layout/PropertySelector';
import tenantService from '../services/tenantService';

const Tenants = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  // Get current user from local storage
  useEffect(() => {
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    
    if (!userString || !token) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userString));
    
    // Get current property from localStorage or fetch first property
    const fetchProperties = async () => {
      try {
        const response = await axios.get('http://localhost:5008/api/properties/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const fetchedProperties = response.data || [];
        
        if (fetchedProperties.length > 0) {
          // Get current property from localStorage or use the first one
          const savedPropertyId = localStorage.getItem('currentPropertyId');
          let propertyToUse;
          
          if (savedPropertyId) {
            propertyToUse = fetchedProperties.find(p => p.id.toString() === savedPropertyId);
          }
          
          // If no saved property or saved property not found, use first property
          if (!propertyToUse) {
            propertyToUse = fetchedProperties[0];
          }
          
          setCurrentProperty(propertyToUse);
          
          // Fetch tenants for the selected property
          if (propertyToUse) {
            fetchTenants(propertyToUse.id);
          }
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load property information. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [navigate]);

  // Handle property selection from dropdown
  const handleSelectProperty = (property) => {
    setCurrentProperty(property);
    
    // Save to localStorage
    localStorage.setItem('currentPropertyId', property.id);
    
    // Fetch tenants for the selected property
    fetchTenants(property.id);
  };

  // Fetch tenants for a property
  const fetchTenants = async (propertyId) => {
    try {
      setLoading(true);
      const data = await tenantService.getTenantsForProperty(propertyId);
      setTenants(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tenants:', err);
      setError('Failed to load tenants. Please try again later.');
      setLoading(false);
    }
  };

  // Handle viewing tenant details
  const viewTenantDetails = (tenant) => {
    setSelectedTenant(tenant);
    setShowDetailModal(true);
  };

  // Handle tenant deletion
  const handleDeleteTenant = async (id) => {
    if (window.confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      try {
        setLoading(true);
        await tenantService.deleteTenant(id);
        setMessage('Tenant deleted successfully!');
        
        // Refresh tenants list
        if (currentProperty) {
          fetchTenants(currentProperty.id);
        }
      } catch (err) {
        console.error('Error deleting tenant:', err);
        setError('Failed to delete tenant. Please try again later.');
        setLoading(false);
      }
    }
  };

  // Filter tenants based on selected filter
  const filteredTenants = tenants.filter(tenant => {
    if (filter === 'all') return true;
    return tenant.status === filter;
  });

  // Search tenants
  const searchedTenants = filteredTenants.filter(tenant => {
    if (!searchTerm) return true;
    
    const fullName = `${tenant.first_name} ${tenant.last_name}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      tenant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get badge style for tenant status
  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'active':
        return 'bg-green-900 bg-opacity-30 text-green-300';
      case 'past':
        return 'bg-gray-700 text-gray-300';
      case 'upcoming':
        return 'bg-blue-900 bg-opacity-30 text-blue-300';
      case 'notice':
        return 'bg-orange-900 bg-opacity-30 text-orange-300';
      case 'eviction':
        return 'bg-red-900 bg-opacity-30 text-red-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <Navigation user={user}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold">Tenants</h1>
            <p className="text-gray-400 mt-1">Manage your property tenants</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-4">
            <PropertySelector 
              currentProperty={currentProperty} 
              onSelectProperty={handleSelectProperty} 
            />
            <button 
              className="btn-secondary text-sm px-4 py-2 rounded-md flex items-center"
              onClick={() => navigate('/tenants/add')}
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Tenant
            </button>
          </div>
        </div>
        
        {/* Error and message display */}
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
        
        {/* Filters and search */}
        <div className="flex flex-col md:flex-row justify-between mb-6">
          <div className="flex overflow-x-auto pb-2 mb-4 md:mb-0">
            <button 
              className={`mr-2 px-4 py-1 rounded-full text-sm whitespace-nowrap ${filter === 'all' ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => setFilter('all')}
            >
              All Tenants
            </button>
            <button 
              className={`mr-2 px-4 py-1 rounded-full text-sm whitespace-nowrap ${filter === 'active' ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button 
              className={`mr-2 px-4 py-1 rounded-full text-sm whitespace-nowrap ${filter === 'upcoming' ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </button>
            <button 
              className={`mr-2 px-4 py-1 rounded-full text-sm whitespace-nowrap ${filter === 'past' ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => setFilter('past')}
            >
              Past
            </button>
            <button 
              className={`mr-2 px-4 py-1 rounded-full text-sm whitespace-nowrap ${filter === 'notice' ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => setFilter('notice')}
            >
              Notice
            </button>
          </div>
          
          <div className="relative">
            <input 
              type="text" 
              className="form-input w-full md:w-64 py-2 pl-10" 
              placeholder="Search tenants..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg 
              className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
        
        {/* Tenants List */}
        {loading ? (
          <div className="text-center py-12">
            <svg className="animate-spin h-8 w-8 text-secondary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-3 text-gray-400">Loading tenants...</p>
          </div>
        ) : !currentProperty ? (
          <div className="text-center py-16 card">
            <svg className="h-16 w-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <h3 className="text-lg font-medium mb-2">No Property Selected</h3>
            <p className="text-gray-400 mb-6">Please select a property to view its tenants.</p>
          </div>
        ) : searchedTenants.length === 0 ? (
          <div className="text-center py-16 card">
            <svg className="h-16 w-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <h3 className="text-lg font-medium mb-2">No tenants found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm ? `No results for "${searchTerm}"` : filter !== 'all' ? `No ${filter} tenants found` : 'This property has no tenants yet'}
            </p>
            <button 
              className="btn-secondary px-4 py-2 rounded-md"
              onClick={() => navigate('/tenants/add')}
            >
              Add Your First Tenant
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full card">
              <thead className="bg-gray-700 bg-opacity-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Tenant</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Contact</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Lease Details</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {searchedTenants.map(tenant => (
                  <tr key={tenant.id} className="hover:bg-gray-700 hover:bg-opacity-30">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
                          {tenant.first_name?.[0]}{tenant.last_name?.[0]}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium">{tenant.first_name} {tenant.last_name}</div>
                          <div className="text-sm text-gray-400">
                            {tenant.unit ? `Unit ${tenant.unit}` : 'No unit assigned'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div>{tenant.email}</div>
                        <div className="text-gray-400">{tenant.phone || 'No phone'}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div>
                          {tenant.lease_start && tenant.lease_end ? (
                            <span>
                              {formatDate(tenant.lease_start)} - {formatDate(tenant.lease_end)}
                            </span>
                          ) : (
                            <span className="text-gray-400">No lease dates</span>
                          )}
                        </div>
                        <div className="text-gray-400">
                          {tenant.rent_amount ? `$${tenant.rent_amount}/month` : 'No rent information'}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(tenant.status)}`}>
                        {tenant.status ? tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1) : 'Unknown'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        className="text-teal-500 hover:text-teal-400 px-2"
                        onClick={() => viewTenantDetails(tenant)}
                      >
                        <svg className="h-5 w-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      </button>
                      <button 
                        className="text-blue-500 hover:text-blue-400 px-2"
                        onClick={() => navigate(`/tenants/edit/${tenant.id}`)}
                      >
                        <svg className="h-5 w-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                        </svg>
                      </button>
                      <button 
                        className="text-red-500 hover:text-red-400 px-2"
                        onClick={() => handleDeleteTenant(tenant.id)}
                      >
                        <svg className="h-5 w-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Tenant Details Modal */}
        {showDetailModal && selectedTenant && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDetailModal(false)}></div>
              <div className="card w-full max-w-3xl p-6 relative">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">Tenant Details</h2>
                  <button 
                    className="text-gray-400 hover:text-gray-300 rounded-full p-1"
                    onClick={() => setShowDetailModal(false)}
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="h-16 w-16 rounded-full bg-gray-500 flex items-center justify-center text-white text-xl font-semibold">
                        {selectedTenant.first_name?.[0]}{selectedTenant.last_name?.[0]}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium">{selectedTenant.first_name} {selectedTenant.last_name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(selectedTenant.status)}`}>
                          {selectedTenant.status ? selectedTenant.status.charAt(0).toUpperCase() + selectedTenant.status.slice(1) : 'Unknown'}
                        </span>
                      </div>
                    </div>
                    
                    <h4 className="text-sm font-medium text-gray-400 mt-4 mb-2">Contact Information</h4>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        <span>{selectedTenant.email || 'No email provided'}</span>
                      </div>
                      <div className="flex items-center mb-3">
                        <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        <span>{selectedTenant.phone || 'No phone provided'}</span>
                      </div>
                      <div className="flex items-start">
                        <svg className="h-5 w-5 text-gray-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <div>
                          {selectedTenant.address || 'No address provided'}
                          {selectedTenant.address2 && <div>{selectedTenant.address2}</div>}
                          {(selectedTenant.city || selectedTenant.state || selectedTenant.zip) && (
                            <div>
                              {[
                                selectedTenant.city,
                                selectedTenant.state,
                                selectedTenant.zip
                              ].filter(Boolean).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Lease Information</h4>
                    <div className="bg-gray-800 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-400">Lease Start</div>
                          <div>{formatDate(selectedTenant.lease_start)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Lease End</div>
                          <div>{formatDate(selectedTenant.lease_end)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Rent Amount</div>
                          <div>{selectedTenant.rent_amount ? `$${selectedTenant.rent_amount}/month` : 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Security Deposit</div>
                          <div>{selectedTenant.security_deposit ? `$${selectedTenant.security_deposit}` : 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Additional Information</h4>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="text-xs text-gray-400 mb-1">Notes</div>
                      <div className="text-sm">
                        {selectedTenant.notes || 'No notes provided'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <button 
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Close
                  </button>
                  <div>
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mr-2"
                      onClick={() => {
                        setShowDetailModal(false);
                        navigate(`/tenants/edit/${selectedTenant.id}`);
                      }}
                    >
                      Edit Tenant
                    </button>
                    <button 
                      className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md"
                      onClick={() => {
                        setShowDetailModal(false);
                        navigate(`/tenants/${selectedTenant.id}/documents`);
                      }}
                    >
                      View Documents
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Navigation>
  );
};

export default Tenants;