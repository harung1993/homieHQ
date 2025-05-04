import api from './api';

/**
 * Service for handling property-related API calls
 */
const propertyService = {
  /**
   * Get all properties for the current user
   * @returns {Promise<Array>} Properties array
   */
  getProperties: async () => {
    try {
      const response = await api.get('/properties');
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  /**
   * Get a single property by ID
   * @param {number} id - Property ID
   * @returns {Promise<Object>} Property object
   */
  getProperty: async (id) => {
    try {
      const response = await api.get(`/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching property ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new property
   * @param {Object} propertyData - Property data
   * @returns {Promise<Object>} Created property
   */
  createProperty: async (propertyData) => {
    try {
      const response = await api.post('/properties', propertyData);
      return response.data;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  },

  /**
   * Update an existing property
   * @param {number} id - Property ID
   * @param {Object} propertyData - Updated property data
   * @returns {Promise<Object>} Updated property
   */
  updateProperty: async (id, propertyData) => {
    try {
      const response = await api.put(`/properties/${id}`, propertyData);
      return response.data;
    } catch (error) {
      console.error(`Error updating property ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a property
   * @param {number} id - Property ID
   * @returns {Promise<Object>} Response object
   */
  deleteProperty: async (id) => {
    try {
      const response = await api.delete(`/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting property ${id}:`, error);
      throw error;
    }
  },

  /**
   * Set a property as the primary residence
   * @param {number} id - Property ID to set as primary
   * @returns {Promise<Object>} Updated property object
   */
  setAsPrimaryResidence: async (id) => {
    try {
      const response = await api.post(`/properties/${id}/set-primary`);
      return response.data;
    } catch (error) {
      console.error(`Error setting property ${id} as primary residence:`, error);
      throw error;
    }
  }
};

export default propertyService;