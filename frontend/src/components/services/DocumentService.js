// DocumentService.js - Updated to handle property filtering
import { apiHelpers } from '../../services/api'; // Adjusted import path

/**
 * Document Service class for handling document operations
 */
class DocumentService {
  /**
   * Get all documents for current user
   * @param {string} propertyId - Optional property ID to filter documents
   * @returns {Promise} Promise with documents data
   */
  getAllDocuments(propertyId = null) {
    let url = `/documents`;
    if (propertyId) {
      url += `?property_id=${propertyId}`;
    }
    
    return apiHelpers.get(url)
      .catch(error => {
        console.error('Error fetching documents:', error);
        throw error;
      });
  }

  /**
   * Get a specific document by ID
   * @param {string} documentId - Document ID
   * @returns {Promise} Promise with document data
   */
  getDocument(documentId) {
    return apiHelpers.get(`/documents/${documentId}`)
      .catch(error => {
        console.error(`Error fetching document ${documentId}:`, error);
        throw error;
      });
  }

  /**
   * Upload a new document
   * @param {FormData} formData - Form data with document file and metadata
   * @returns {Promise} Promise with uploaded document data
   */
  uploadDocument(formData) {
    return apiHelpers.upload(`/documents`, formData)
      .catch(error => {
        console.error('Error uploading document:', error);
        throw error;
      });
  }

  /**
   * Update document metadata
   * @param {string} documentId - Document ID
   * @param {object} metadata - Document metadata to update
   * @returns {Promise} Promise with updated document data
   */
  updateDocument(documentId, metadata) {
    return apiHelpers.put(`/documents/${documentId}`, metadata)
      .catch(error => {
        console.error(`Error updating document ${documentId}:`, error);
        throw error;
      });
  }

  /**
   * Delete a document
   * @param {string} documentId - Document ID
   * @returns {Promise} Promise with deletion status
   */
  deleteDocument(documentId) {
    return apiHelpers.delete(`/documents/${documentId}`)
      .catch(error => {
        console.error(`Error deleting document ${documentId}:`, error);
        throw error;
      });
  }

  /**
   * Download a document
   * @param {string} documentId - Document ID
   * @returns {Promise} Promise with document blob URL
   */
  downloadDocument(documentId) {
    return apiHelpers.download(`/documents/${documentId}/download`)
      .then(blob => {
        // Create blob URL for download
        const url = window.URL.createObjectURL(blob);
        return url;
      })
      .catch(error => {
        console.error(`Error downloading document ${documentId}:`, error);
        throw error;
      });
  }

  /**
   * Get documents by category
   * @param {string} category - Document category
   * @param {string} propertyId - Optional property ID to filter documents
   * @returns {Promise} Promise with documents data
   */
  getDocumentsByCategory(category, propertyId = null) {
    let url = `/documents/category/${category}`;
    if (propertyId) {
      url += `?property_id=${propertyId}`;
    }
    
    return apiHelpers.get(url)
      .catch(error => {
        console.error(`Error fetching documents for category ${category}:`, error);
        throw error;
      });
  }

  /**
   * Search documents by keyword
   * @param {string} keyword - Search keyword
   * @param {string} propertyId - Optional property ID to filter documents
   * @returns {Promise} Promise with documents data
   */
  searchDocuments(keyword, propertyId = null) {
    let url = `/documents/search?q=${encodeURIComponent(keyword)}`;
    if (propertyId) {
      url += `&property_id=${propertyId}`;
    }
    
    return apiHelpers.get(url)
      .catch(error => {
        console.error(`Error searching documents with keyword "${keyword}":`, error);
        throw error;
      });
  }
}

// Create and export a singleton instance
const documentService = new DocumentService();
export default documentService;