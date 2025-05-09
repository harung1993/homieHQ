import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../layout/Navigation';
import PropertySelector from '../layout/PropertySelector';
import tenantService from '../services/tenantService';
import { apiHelpers, API_BASE_URL } from '../../services/api';

const TenantForm = () => {
  const navigate = useNavigate();
  const { tenantId } = useParams();
  const isEditMode = !!tenantId;
  const fileInputRef = useRef(null);
  
  const [user, setUser] = useState(null);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [documents, setDocuments] = useState([]);
  const [showDocumentsSection, setShowDocumentsSection] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  
  // Document upload form data
  const [documentData, setDocumentData] = useState({
    title: '',
    description: '',
    category: 'lease',
    file: null
  });
  
  // Form data
  const [formData, setFormData] = useState({
    property_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    status: 'active',
    address: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    lease_start: '',
    lease_end: '',
    rent_amount: '',
    security_deposit: '',
    unit: '',
    notes: ''
  });

  // Fetch tenant data for edit mode - wrapped in useCallback
  const fetchTenantData = useCallback(async (id) => {
    try {
      const tenant = await tenantService.getTenant(id);
      
      // Format dates to YYYY-MM-DD for input fields
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };
      
      // Update form data with tenant info
      setFormData({
        property_id: tenant.property_id || '',
        first_name: tenant.first_name || '',
        last_name: tenant.last_name || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        status: tenant.status || 'active',
        address: tenant.address || '',
        address2: tenant.address2 || '',
        city: tenant.city || '',
        state: tenant.state || '',
        zip: tenant.zip || '',
        lease_start: formatDateForInput(tenant.lease_start),
        lease_end: formatDateForInput(tenant.lease_end),
        rent_amount: tenant.rent_amount || '',
        security_deposit: tenant.security_deposit || '',
        unit: tenant.unit || '',
        notes: tenant.notes || ''
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tenant details:', err);
      setError('Failed to load tenant details. Please try again later.');
      setLoading(false);
    }
  }, []);

  // Fetch tenant documents - wrapped in useCallback
  const fetchTenantDocuments = useCallback(async (id) => {
    try {
      const docs = await tenantService.getTenantDocuments(id);
      setDocuments(docs);
      // Show documents section if there are any documents
      if (docs.length > 0) {
        setShowDocumentsSection(true);
      }
    } catch (err) {
      console.error('Error fetching tenant documents:', err);
      // Don't set an error, just log it - documents are not critical for the form
    }
  }, []);

  // Get current user from local storage
  useEffect(() => {
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    
    if (!userString || !token) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userString));
    
    // Get current property from localStorage
    const fetchProperties = async () => {
      try {
        // Use apiHelpers instead of direct axios call
        const fetchedProperties = await apiHelpers.get('properties/');
        
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
          
          // Set the property_id in the form data
          setFormData(prev => ({
            ...prev,
            property_id: propertyToUse.id
          }));
          
          // If in edit mode, fetch tenant data and documents
          if (isEditMode) {
            fetchTenantData(tenantId);
            fetchTenantDocuments(tenantId);
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load property information. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [navigate, tenantId, isEditMode, fetchTenantData, fetchTenantDocuments]);

  // Get document URL with proper formatting
  const getDocumentUrl = (document) => {
    if (!document || !document.url) return null;
    
    // If it's already a full URL, return it as is
    if (document.url.startsWith('http')) {
      return document.url;
    }
    
    // Ensure the URL starts with a slash if needed
    const formattedUrl = document.url.startsWith('/') ? document.url : `/${document.url}`;
    return `${API_BASE_URL}${formattedUrl}`;
  };

  // Handle property selection from dropdown
  const handleSelectProperty = (property) => {
    setCurrentProperty(property);
    
    // Update form data with selected property
    setFormData(prev => ({
      ...prev,
      property_id: property.id
    }));
    
    // Save to localStorage
    localStorage.setItem('currentPropertyId', property.id);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Convert numeric values to numbers
    if (['rent_amount', 'security_deposit'].includes(name)) {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : parseFloat(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle document form input changes
  const handleDocumentInputChange = (e) => {
    const { name, value } = e.target;
    setDocumentData({
      ...documentData,
      [name]: value
    });
  };

  // Handle document file selection with size validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file && file.size > 200 * 1024 * 1024) { // 200MB limit
      setError('File size exceeds the maximum limit of 200MB');
      return;
  }
    
    setDocumentData({
      ...documentData,
      file: file
    });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on document type
  const getFileIcon = (fileType) => {
    if (!fileType) return (
      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
      </svg>
    );
    
    if (fileType.includes('pdf')) {
      return (
        <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      );
    } else if (fileType.includes('image')) {
      return (
        <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      );
    } else {
      return (
        <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      );
    }
  };

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

  // Handle upload document
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    
    if (!documentData.file) {
      setError('Please select a file to upload');
      return;
    }
    
    if (documentData.file.size > 200 * 1024 * 1024) { // 5MB limit
      setError('File size exceeds the maximum limit of 20MB');
      return;
    }
    
    try {
      setUploadingDocument(true);
      
      // If we're in edit mode, upload to existing tenant
      if (isEditMode) {
        // Create form data for upload
        const formData = new FormData();
        formData.append('file', documentData.file);
        formData.append('title', documentData.title);
        formData.append('description', documentData.description);
        formData.append('category', documentData.category);
        
        // Upload document
        await tenantService.uploadTenantDocument(tenantId, formData);
        
        // Refresh documents
        fetchTenantDocuments(tenantId);
      } else {
        // If we're creating a new tenant, store the document to be uploaded after tenant creation
        setDocuments([
          ...documents,
          {
            id: `temp-${Date.now()}`,
            title: documentData.title,
            description: documentData.description,
            category: documentData.category,
            file_name: documentData.file.name,
            file_size: documentData.file.size,
            file_type: documentData.file.type,
            file: documentData.file, // Store the actual file for later upload
            created_at: new Date().toISOString()
          }
        ]);
      }
      
      // Reset document form
      setDocumentData({
        title: '',
        description: '',
        category: 'lease',
        file: null
      });
      
      setMessage('Document added successfully!');
      setUploadingDocument(false);
      
      // Show documents section if it was hidden
      setShowDocumentsSection(true);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document. Please try again.');
      setUploadingDocument(false);
    }
  };

  // Remove document (for new tenant or delete for existing tenant)
  const handleRemoveDocument = async (documentId) => {
    if (isEditMode) {
      // Real document deletion for existing tenant
      if (window.confirm('Are you sure you want to delete this document?')) {
        try {
          await tenantService.deleteTenantDocument(tenantId, documentId);
          setMessage('Document deleted successfully!');
          
          // Refresh documents
          fetchTenantDocuments(tenantId);
        } catch (err) {
          console.error('Error deleting document:', err);
          setError('Failed to delete document. Please try again.');
        }
      }
    } else {
      // Just remove from local state for new tenant
      setDocuments(documents.filter(doc => doc.id !== documentId));
      setMessage('Document removed!');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      if (!formData.property_id) {
        setError('Please select a property for this tenant.');
        setSubmitting(false);
        return;
      }
      
      let createdTenantId;
      
      if (isEditMode) {
        // Update existing tenant
        await tenantService.updateTenant(tenantId, formData);
        createdTenantId = tenantId;
        setMessage('Tenant updated successfully!');
      } else {
        // Create new tenant
        const response = await tenantService.createTenant(formData);
        createdTenantId = response.id || response.tenant_id;
        
        // Upload any documents that were added during tenant creation
        if (documents.length > 0 && createdTenantId) {
          for (const doc of documents) {
            if (doc.file) { // Only upload docs with actual files (not ones already on server)
              const formData = new FormData();
              formData.append('file', doc.file);
              formData.append('title', doc.title);
              formData.append('description', doc.description);
              formData.append('category', doc.category);
              
              await tenantService.uploadTenantDocument(createdTenantId, formData);
            }
          }
        }
        
        setMessage('Tenant added successfully!');
      }
      
      // Navigate back to tenants list or to tenant details
      setTimeout(() => {
        navigate('/tenants', { 
          state: { 
            message: isEditMode ? 'Tenant updated successfully!' : 'Tenant added successfully!' 
          } 
        });
      }, 1500);
    } catch (err) {
      console.error('Error saving tenant:', err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Failed to save tenant. Please try again later.'
      );
      setSubmitting(false);
    }
  };

  return (
    <Navigation user={user}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Tenant' : 'Add New Tenant'}</h1>
            <p className="text-gray-400 mt-1">
              {isEditMode ? 'Update tenant information' : 'Add a new tenant to your property'}
            </p>
          </div>
          
          {!isEditMode && (
            <div className="mt-4 md:mt-0">
              <PropertySelector 
                currentProperty={currentProperty} 
                onSelectProperty={handleSelectProperty} 
              />
            </div>
          )}
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
        
        {loading ? (
          <div className="text-center py-12">
            <svg className="animate-spin h-8 w-8 text-secondary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-3 text-gray-400">Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="card p-6 mb-8">
              <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">First Name*</label>
                  <input 
                    type="text" 
                    name="first_name" 
                    className="form-input" 
                    value={formData.first_name} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Last Name*</label>
                  <input 
                    type="text" 
                    name="last_name" 
                    className="form-input" 
                    value={formData.last_name} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Email*</label>
                  <input 
                    type="email" 
                    name="email" 
                    className="form-input" 
                    value={formData.email} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    className="form-input" 
                    value={formData.phone} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="form-label">Status</label>
                  <select 
                    name="status" 
                    className="form-input" 
                    value={formData.status} 
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                    <option value="notice">Notice</option>
                    <option value="eviction">Eviction</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Unit</label>
                  <input 
                    type="text" 
                    name="unit" 
                    className="form-input" 
                    value={formData.unit} 
                    onChange={handleInputChange}
                    placeholder="e.g. Apt 101, #203"
                  />
                </div>
              </div>
            </div>
            
            <div className="card p-6 mb-8">
              <h2 className="text-xl font-semibold mb-6">Contact Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="form-label">Address</label>
                  <input 
                    type="text" 
                    name="address" 
                    className="form-input" 
                    value={formData.address} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="form-label">Address Line 2</label>
                  <input 
                    type="text" 
                    name="address2" 
                    className="form-input" 
                    value={formData.address2} 
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, etc."
                  />
                </div>
                
                <div>
                  <label className="form-label">City</label>
                  <input 
                    type="text" 
                    name="city" 
                    className="form-input" 
                    value={formData.city} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">State/Province</label>
                    <input 
                      type="text" 
                      name="state" 
                      className="form-input" 
                      value={formData.state} 
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">ZIP/Postal Code</label>
                    <input 
                      type="text" 
                      name="zip" 
                      className="form-input" 
                      value={formData.zip} 
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card p-6 mb-8">
              <h2 className="text-xl font-semibold mb-6">Lease Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Lease Start Date</label>
                  <input 
                    type="date" 
                    name="lease_start" 
                    className="form-input" 
                    value={formData.lease_start} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="form-label">Lease End Date</label>
                  <input 
                    type="date" 
                    name="lease_end" 
                    className="form-input" 
                    value={formData.lease_end} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="form-label">Monthly Rent ($)</label>
                  <input 
                    type="number" 
                    name="rent_amount" 
                    className="form-input" 
                    value={formData.rent_amount} 
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="form-label">Security Deposit ($)</label>
                  <input 
                    type="number" 
                    name="security_deposit" 
                    className="form-input" 
                    value={formData.security_deposit} 
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="form-label">Notes</label>
                  <textarea 
                    name="notes" 
                    className="form-input" 
                    value={formData.notes} 
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Additional information about the tenant..."
                  ></textarea>
                </div>
              </div>
            </div>
            
            {/* Documents Section */}
            <div className="card p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Tenant Documents</h2>
                <button 
                  type="button"
                  className={`text-sm text-gray-400 hover:text-gray-300 underline ${showDocumentsSection ? 'hidden' : ''}`}
                  onClick={() => setShowDocumentsSection(true)}
                >
                  Show Document Upload
                </button>
                <button 
                  type="button"
                  className={`text-sm text-gray-400 hover:text-gray-300 underline ${showDocumentsSection ? '' : 'hidden'}`}
                  onClick={() => setShowDocumentsSection(false)}
                >
                  Hide Document Upload
                </button>
              </div>
              
              {showDocumentsSection && (
                <div className="mb-6">
                  <div className="bg-gray-800 p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-medium mb-4">Upload Document</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="form-label">Document Title*</label>
                        <input 
                          type="text" 
                          name="title" 
                          className="form-input" 
                          value={documentData.title} 
                          onChange={handleDocumentInputChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label">Category</label>
                        <select 
                          name="category" 
                          className="form-input" 
                          value={documentData.category}
                          onChange={handleDocumentInputChange}
                        >
                          <option value="lease">Lease</option>
                          <option value="application">Application</option>
                          <option value="id">ID & Verification</option>
                          <option value="notices">Notices</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="form-label">Description</label>
                        <textarea 
                          name="description" 
                          className="form-input" 
                          value={documentData.description} 
                          onChange={handleDocumentInputChange}
                          rows="2"
                          placeholder="Brief description of the document..."
                        ></textarea>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center border-2 border-dashed border-gray-600 rounded-md p-6 mb-4">
                      {documentData.file ? (
                        <div className="text-center">
                          <p className="text-sm text-gray-300">{documentData.file.name}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatFileSize(documentData.file.size)}</p>
                          <button
                            type="button"
                            className="text-xs text-red-500 mt-2"
                            onClick={() => setDocumentData({...documentData, file: null})}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <svg className="h-12 w-12 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                          </svg>
                          <p className="text-sm text-gray-400 mb-2">Drag and drop a file or</p>
                          <label className="btn-secondary text-xs px-3 py-1 rounded-md cursor-pointer">
                            Browse Files
                            <input 
                              type="file" 
                              className="hidden" 
                              onChange={handleFileChange}
                              ref={fileInputRef}
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">Maximum file size: 200MB</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="btn-secondary px-4 py-2 rounded-md"
                        onClick={handleUploadDocument}
                        disabled={uploadingDocument || !documentData.file || !documentData.title}
                      >
                        {uploadingDocument ? 'Uploading...' : 'Add Document'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Documents List */}
                  {documents.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Documents ({documents.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {documents.map(doc => (
                          <div key={doc.id} className="bg-gray-700 p-4 rounded-md flex">
                            <div className="p-2 rounded bg-gray-800 mr-3 h-12 w-12 flex items-center justify-center">
                              {getFileIcon(doc.file_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{doc.title}</h4>
                              <p className="text-xs text-gray-400 truncate">{doc.description}</p>
                              <div className="flex text-xs text-gray-400 mt-1 justify-between">
                                <span>
                                  {doc.category?.charAt(0).toUpperCase() + doc.category?.slice(1) || 'Other'}
                                </span>
                                {/* Download link if document has URL */}
                                {doc.url && (
                                  <a 
                                    href={getDocumentUrl(doc)}
                                    className="text-blue-400 hover:text-blue-300 mr-2"
                                    download={doc.title}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Download
                                  </a>
                                )}
                                <button 
                                  type="button" 
                                  className="text-red-400 hover:text-red-300"
                                  onClick={() => handleRemoveDocument(doc.id)}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* If not showing document section, show a summary of document count */}
              {!showDocumentsSection && documents.length > 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-400">
                    {documents.length} document{documents.length !== 1 ? 's' : ''} attached
                  </p>
                  <button 
                    type="button"
                    className="text-teal-500 hover:text-teal-400 text-sm mt-2"
                    onClick={() => setShowDocumentsSection(true)}
                  >
                    View & Manage Documents
                  </button>
                </div>
              )}
              
              {/* If not showing document section and no documents, show upload prompt */}
              {!showDocumentsSection && documents.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-400 mb-2">No documents attached yet</p>
                  <button 
                    type="button"
                    className="text-teal-500 hover:text-teal-400 text-sm"
                    onClick={() => setShowDocumentsSection(true)}
                  >
                    Add Documents
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <button 
                type="button" 
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-md"
                onClick={() => navigate('/tenants')}
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                className="btn-secondary px-6 py-3 rounded-md"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : isEditMode ? 'Update Tenant' : 'Add Tenant'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Navigation>
  );
};

export default TenantForm;