// src/components/services/tenantService.js
import { apiHelpers } from '../../services/api';

/**
 * Service for handling tenant-related API calls
 */
const tenantService = {
  /**
   * Get all tenants for a property
   * @param {number} propertyId - Property ID
   * @param {string} status - Optional status filter
   * @returns {Promise<Array>} Array of tenant objects
   */
  getTenants: async (propertyId, status = null) => {
    try {
      const params = {};
      
      if (propertyId) {
        params.property_id = propertyId;
      }
      
      if (status) {
        params.status = status;
      }
      
      return await apiHelpers.get('tenants/', params);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
  },

  /**
   * Get all tenants for a specific property
   * @param {number} propertyId - Property ID
   * @returns {Promise<Array>} Array of tenant objects
   */
  getTenantsForProperty: async (propertyId) => {
    try {
      return await apiHelpers.get(`tenants/property/${propertyId}`);
    } catch (error) {
      console.error(`Error fetching tenants for property ${propertyId}:`, error);
      throw error;
    }
  },

  /**
   * Get all active tenants
   * @returns {Promise<Array>} Array of active tenant objects
   */
  getActiveTenants: async () => {
    try {
      return await apiHelpers.get('tenants/active');
    } catch (error) {
      console.error('Error fetching active tenants:', error);
      throw error;
    }
  },

  /**
   * Search tenants by name or email
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching tenant objects
   */
  searchTenants: async (searchTerm) => {
    try {
      return await apiHelpers.get('tenants/search', { q: searchTerm });
    } catch (error) {
      console.error(`Error searching tenants for "${searchTerm}":`, error);
      throw error;
    }
  },

  /**
   * Get a single tenant by ID
   * @param {number} id - Tenant ID
   * @returns {Promise<Object>} Tenant object
   */
  getTenant: async (id) => {
    try {
      return await apiHelpers.get(`tenants/${id}`);
    } catch (error) {
      console.error(`Error fetching tenant ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new tenant
   * @param {Object} tenantData - Tenant data
   * @returns {Promise<Object>} Created tenant
   */
  createTenant: async (tenantData) => {
    try {
      return await apiHelpers.post('tenants/', tenantData);
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  },

  /**
   * Update an existing tenant
   * @param {number} id - Tenant ID
   * @param {Object} tenantData - Updated tenant data
   * @returns {Promise<Object>} Updated tenant
   */
  updateTenant: async (id, tenantData) => {
    try {
      return await apiHelpers.put(`tenants/${id}`, tenantData);
    } catch (error) {
      console.error(`Error updating tenant ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a tenant
   * @param {number} id - Tenant ID
   * @returns {Promise<Object>} Response object
   */
  deleteTenant: async (id) => {
    try {
      return await apiHelpers.delete(`tenants/${id}`);
    } catch (error) {
      console.error(`Error deleting tenant ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get all documents for a specific tenant
   * @param {number} tenantId - Tenant ID
   * @returns {Promise<Array>} Array of document objects
   */
  getTenantDocuments: async (tenantId) => {
    try {
      return await apiHelpers.get(`tenants/${tenantId}/documents`);
    } catch (error) {
      console.error(`Error fetching documents for tenant ${tenantId}:`, error);
      throw error;
    }
  },

  /**
   * Upload a document for a tenant
   * @param {number} tenantId - Tenant ID
   * @param {FormData} formData - Form data with document and metadata
   * @returns {Promise<Object>} Uploaded document info
   */
  uploadTenantDocument: async (tenantId, formData) => {
    try {
      return await apiHelpers.upload(`tenants/${tenantId}/documents`, formData);
    } catch (error) {
      console.error(`Error uploading document for tenant ${tenantId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a tenant's document
   * @param {number} tenantId - Tenant ID
   * @param {number} documentId - Document ID
   * @returns {Promise<Object>} Response data
   */
  deleteTenantDocument: async (tenantId, documentId) => {
    try {
      return await apiHelpers.delete(`tenants/${tenantId}/documents/${documentId}`);
    } catch (error) {
      console.error(`Error deleting document ${documentId} for tenant ${tenantId}:`, error);
      throw error;
    }
  },

  /**
   * Get document categories for a tenant
   * @param {number} tenantId - Tenant ID
   * @returns {Promise<Array>} Array of category strings
   */
  getTenantDocumentCategories: async (tenantId) => {
    try {
      return await apiHelpers.get(`tenants/${tenantId}/documents/categories`);
    } catch (error) {
      console.error(`Error fetching document categories for tenant ${tenantId}:`, error);
      throw error;
    }
  },

  /**
   * Get expiring documents for a tenant
   * @param {number} tenantId - Tenant ID
   * @param {number} days - Days until expiration (default 30)
   * @returns {Promise<Array>} Array of document objects
   */
  getTenantExpiringDocuments: async (tenantId, days = 30) => {
    try {
      return await apiHelpers.get(`tenants/${tenantId}/documents/expiring`, { days });
    } catch (error) {
      console.error(`Error fetching expiring documents for tenant ${tenantId}:`, error);
      throw error;
    }
  }
};

export default tenantService;