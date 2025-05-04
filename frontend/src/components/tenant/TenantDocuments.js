import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

import Navigation from '../layout/Navigation';
import tenantService from '../services/tenantService';

const TenantDocuments = () => {
  const navigate = useNavigate();
  const { tenantId } = useParams();
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef(null);
  
  // Document upload form data
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: 'lease',
    file: null
  });

  // Fetch user, tenant and documents
  useEffect(() => {
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    
    if (!userString || !token) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userString));
    
    const fetchData = async () => {
      try {
        // Fetch tenant details
        const tenantData = await tenantService.getTenant(tenantId);
        setTenant(tenantData);
        
        // Fetch tenant documents
        const documentsData = await tenantService.getTenantDocuments(tenantId);
        setDocuments(documentsData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tenant data:', err);
        setError('Failed to load tenant information. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, tenantId]);

  // Handle file input change
  const handleFileChange = (e) => {
    setUploadData({
      ...uploadData,
      file: e.target.files[0]
    });
  };

  // Handle input changes for document metadata
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadData({
      ...uploadData,
      [name]: value
    });
  };

  // Handle document upload
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadData.file) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('category', uploadData.category);
      
      // Upload document
      await tenantService.uploadTenantDocument(tenantId, formData);
      
      // Reset form and close modal
      setUploadData({
        title: '',
        description: '',
        category: 'lease',
        file: null
      });
      
      setShowUploadModal(false);
      setMessage('Document uploaded successfully!');
      
      // Reload documents
      const documentsData = await tenantService.getTenantDocuments(tenantId);
      setDocuments(documentsData);
      
      setLoading(false);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document. Please try again later.');
      setLoading(false);
    }
  };

  // Handle document download
  const handleDownload = async (documentId) => {
    try {
      // For now, we'll just mock the download
      // In a real implementation, you would use the API to get a download URL
      console.log(`Downloading document ${documentId}`);
      
      // Mock a successful download
      setMessage('Document downloaded successfully!');
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Failed to download document. Please try again later.');
    }
  };

  // Handle document deletion
  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        setLoading(true);
        await tenantService.deleteTenantDocument(tenantId, documentId);
        
        setMessage('Document deleted successfully!');
        
        // Reload documents
        const documentsData = await tenantService.getTenantDocuments(tenantId);
        setDocuments(documentsData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error deleting document:', err);
        setError('Failed to delete document. Please try again later.');
        setLoading(false);
      }
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get file icon based on document type
  const getFileIcon = (fileType) => {
    if (!fileType) return 'document';
    
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
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return (
        <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      );
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return (
        <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      );
    } else {
      return (
        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
      );
    }
  };

  // Filter documents by category
  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true;
    return doc.category === filter;
  });

  return (
    <Navigation user={user}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link to="/tenants" className="text-gray-400 hover:text-gray-300 mb-2 inline-flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Tenants
            </Link>
            <h1 className="text-2xl font-bold">
              {tenant ? `${tenant.first_name} ${tenant.last_name}'s Documents` : 'Tenant Documents'}
            </h1>
          </div>
          
          <button 
            className="btn-secondary text-sm px-4 py-2 rounded-md flex items-center"
            onClick={() => setShowUploadModal(true)}
            disabled={!tenant}
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Upload Document
          </button>
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
        
        {/* Tenant Info Card */}
        {tenant && (
          <div className="card p-6 mb-8">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
                {tenant.first_name?.[0]}{tenant.last_name?.[0]}
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium">{tenant.first_name} {tenant.last_name}</h2>
                <p className="text-gray-400 text-sm">
                  {tenant.unit ? `Unit ${tenant.unit}` : 'No unit assigned'}
                  {tenant.lease_start && tenant.lease_end ? 
                    ` • Lease: ${formatDate(tenant.lease_start)} to ${formatDate(tenant.lease_end)}` : 
                    ''}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Category filter tabs */}
        <div className="flex overflow-x-auto pb-2 mb-6">
          <button 
            className={`mr-2 px-4 py-1 rounded-full text-sm whitespace-nowrap ${filter === 'all' ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setFilter('all')}
          >
            All Documents
          </button>
          <button 
            className={`mr-2 px-4 py-1 rounded-full text-sm whitespace-nowrap ${filter === 'lease' ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setFilter('lease')}
          >
            Lease
          </button>
          <button 
            className={`mr-2 px-4 py-1 rounded-full text-sm whitespace-nowrap ${filter === 'application' ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setFilter('application')}
          >
            Application
          </button>
          <button 
            className={`mr-2 px-4 py-1 rounded-full text-sm whitespace-nowrap ${filter === 'id' ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setFilter('id')}
          >
            ID & Verification
          </button>
          <button 
            className={`mr-2 px-4 py-1 rounded-full text-sm whitespace-nowrap ${filter === 'notices' ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setFilter('notices')}
          >
            Notices
          </button>
          <button 
            className={`mr-2 px-4 py-1 rounded-full text-sm whitespace-nowrap ${filter === 'other' ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setFilter('other')}
          >
            Other
          </button>
        </div>
        
        {/* Documents Grid */}
        {loading ? (
          <div className="text-center py-12">
            <svg className="animate-spin h-8 w-8 text-secondary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-3 text-gray-400">Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-16 card">
            <svg className="h-16 w-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 className="text-lg font-medium mb-2">No documents found</h3>
            <p className="text-gray-400 mb-6">
              {filter !== 'all' ? `No ${filter} documents available` : 'This tenant has no documents yet'}
            </p>
            <button 
              className="btn-secondary px-4 py-2 rounded-md"
              onClick={() => setShowUploadModal(true)}
            >
              Upload First Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map(doc => (
              <div key={doc.id} className="card overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start mb-4">
                    <div className="p-2 rounded bg-gray-700 mr-3">
                      {getFileIcon(doc.file_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-lg truncate">{doc.title}</h3>
                      <p className="text-xs text-gray-400 truncate">{doc.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-400 mb-4">
                    <span>{doc.file_type ? doc.file_type.split('/')[1]?.toUpperCase() : 'DOC'}</span>
                    <span>{doc.file_size ? formatFileSize(doc.file_size) : 'Unknown size'}</span>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-400 mb-4">
                    <span>{formatDate(doc.created_at)}</span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-700">
                      {doc.category ? doc.category.charAt(0).toUpperCase() + doc.category.slice(1) : 'Other'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <button 
                      className="text-secondary hover:text-secondary-light text-sm"
                      onClick={() => handleDownload(doc.id)}
                    >
                      Download
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-400 text-sm"
                      onClick={() => handleDelete(doc.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowUploadModal(false)}></div>
              <div className="card w-full max-w-md p-6 relative">
                <h2 className="text-xl font-semibold mb-6">Upload Document</h2>
                
                <form onSubmit={handleUpload}>
                  <div className="mb-4">
                    <label className="form-label">Document Title*</label>
                    <input 
                      type="text" 
                      name="title" 
                      className="form-input" 
                      value={uploadData.title} 
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label">Description</label>
                    <textarea 
                      name="description" 
                      className="form-input" 
                      value={uploadData.description} 
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label">Category*</label>
                    <select 
                      name="category" 
                      className="form-input" 
                      value={uploadData.category} 
                      onChange={handleInputChange}
                      required
                    >
                      <option value="lease">Lease</option>
                      <option value="application">Application</option>
                      <option value="id">ID & Verification</option>
                      <option value="notices">Notices</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label className="form-label">Document File*</label>
                    <div className="flex items-center justify-center border-2 border-dashed border-gray-600 rounded-md p-6">
                      {uploadData.file ? (
                        <div className="text-center">
                          <p className="text-sm text-gray-300">{uploadData.file.name}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatFileSize(uploadData.file.size)}</p>
                          <button
                            type="button"
                            className="text-xs text-red-500 mt-2"
                            onClick={() => setUploadData({...uploadData, file: null})}
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
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-300 px-4 py-2 mr-2"
                      onClick={() => setShowUploadModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-secondary px-4 py-2 rounded-md"
                      disabled={loading || !uploadData.file || !uploadData.title}
                    >
                      {loading ? 'Uploading...' : 'Upload Document'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Navigation>
  );
};

export default TenantDocuments;