// src/components/services/applianceService.js
import { apiHelpers } from '../../services/api';

/**
 * Service for handling appliance-related API calls
 */
const applianceService = {
  /**
   * Get all appliances for a property
   * @param {number} propertyId - Property ID
   * @returns {Promise<Array>} Array of appliance objects
   */
  getAppliances: async (propertyId) => {
    try {
      return await apiHelpers.get(`appliances/`, { property_id: propertyId });
    } catch (error) {
      console.error('Error fetching appliances:', error);
      throw error;
    }
  },

  /**
   * Get appliances with expiring warranties
   * @param {number} propertyId - Property ID
   * @param {number} months - Number of months to consider as expiring soon
   * @returns {Promise<Array>} Array of appliance objects with expiring warranties
   */
  getAppliancesWithExpiringWarranties: async (propertyId, months = 3) => {
    try {
      return await apiHelpers.get(`appliances/expiring`, { 
        property_id: propertyId, 
        months: months 
      });
    } catch (error) {
      console.error('Error fetching appliances with expiring warranties:', error);
      throw error;
    }
  },

  /**
   * Get a single appliance by ID
   * @param {number} id - Appliance ID
   * @returns {Promise<Object>} Appliance object
   */
  getAppliance: async (id) => {
    try {
      return await apiHelpers.get(`appliances/${id}`);
    } catch (error) {
      console.error(`Error fetching appliance ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new appliance
   * @param {Object} applianceData - Appliance data
   * @returns {Promise<Object>} Created appliance
   */
  createAppliance: async (applianceData) => {
    try {
      return await apiHelpers.post(`appliances/`, applianceData);
    } catch (error) {
      console.error('Error creating appliance:', error);
      throw error;
    }
  },

  /**
   * Update an existing appliance
   * @param {number} id - Appliance ID
   * @param {Object} applianceData - Updated appliance data
   * @returns {Promise<Object>} Updated appliance
   */
  updateAppliance: async (id, applianceData) => {
    try {
      return await apiHelpers.put(`appliances/${id}`, applianceData);
    } catch (error) {
      console.error(`Error updating appliance ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an appliance
   * @param {number} id - Appliance ID
   * @returns {Promise<Object>} Response object
   */
  deleteAppliance: async (id) => {
    try {
      return await apiHelpers.delete(`appliances/${id}`);
    } catch (error) {
      console.error(`Error deleting appliance ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Calculate warranty status
   * @param {string} expirationDate - Warranty expiration date
   * @returns {Object} Warranty status information
   */
  getWarrantyStatus: (expirationDate) => {
    if (!expirationDate) return { text: 'No warranty', className: 'text-gray-400' };
    
    const today = new Date();
    const expiration = new Date(expirationDate);
    const monthsDiff = (expiration - today) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsDiff < 0) {
      return { 
        text: `Expired ${Math.abs(Math.round(monthsDiff))} months ago`,
        className: 'text-red-500'
      };
    } else if (monthsDiff < 3) {
      return { 
        text: `Expires in ${Math.round(monthsDiff)} months`,
        className: 'text-orange-500'
      };
    } else {
      return { 
        text: `${Math.round(monthsDiff)} months remaining`,
        className: 'text-green-500'
      };
    }
  }
};

export default applianceService;