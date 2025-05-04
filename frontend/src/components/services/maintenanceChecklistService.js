// src/components/services/maintenanceChecklistService.js
import { apiHelpers } from '../../services/api';

/**
 * Service for handling maintenance checklist API calls
 */
const maintenanceChecklistService = {
  /**
   * Get checklist items for a specific season
   * @param {string} season - Season name (Spring, Summer, Fall, Winter)
   * @param {number} propertyId - Property ID
   * @returns {Promise<Object>} Checklist data with items array
   */
  getSeasonalChecklist: async (season, propertyId) => {
    try {
      return await apiHelpers.get(`maintenance/checklist/${season}`, { property_id: propertyId });
    } catch (error) {
      console.error(`Error fetching ${season} checklist:`, error);
      throw error;
    }
  },

  /**
   * Get all checklist items grouped by season
   * @param {number} propertyId - Property ID
   * @returns {Promise<Object>} Checklist data grouped by season
   */
  getAllChecklists: async (propertyId) => {
    try {
      return await apiHelpers.get('maintenance/checklist', { property_id: propertyId });
    } catch (error) {
      console.error('Error fetching all checklists:', error);
      throw error;
    }
  },

  /**
   * Get completion statistics by season
   * @param {number} propertyId - Property ID
   * @param {string} season - Optional season to filter stats
   * @returns {Promise<Object>} Completion statistics
   */
  getChecklistStats: async (propertyId, season = null) => {
    try {
      const params = { property_id: propertyId };
      
      if (season) {
        params.season = season;
      }
      
      return await apiHelpers.get('maintenance/checklist/stats', params);
    } catch (error) {
      console.error('Error fetching checklist stats:', error);
      throw error;
    }
  },

  /**
   * Create a new checklist item
   * @param {Object} itemData - Checklist item data
   * @returns {Promise<Object>} Created checklist item
   */
  createChecklistItem: async (itemData) => {
    try {
      return await apiHelpers.post('maintenance/checklist/', itemData);
    } catch (error) {
      console.error('Error creating checklist item:', error);
      throw error;
    }
  },

  /**
   * Update an existing checklist item
   * @param {number} itemId - Checklist item ID
   * @param {Object} itemData - Updated checklist item data
   * @returns {Promise<Object>} Updated checklist item
   */
  updateChecklistItem: async (itemId, itemData) => {
    try {
      return await apiHelpers.put(`maintenance/checklist/${itemId}`, itemData);
    } catch (error) {
      console.error(`Error updating checklist item ${itemId}:`, error);
      throw error;
    }
  },

  /**
   * Toggle completion status of a checklist item
   * @param {number} itemId - Checklist item ID
   * @returns {Promise<Object>} Updated checklist item
   */
  toggleChecklistItem: async (itemId) => {
    try {
      return await apiHelpers.put(`maintenance/checklist/${itemId}/toggle`, {});
    } catch (error) {
      console.error(`Error toggling checklist item ${itemId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a checklist item
   * @param {number} itemId - Checklist item ID
   * @returns {Promise<Object>} Response data
   */
  deleteChecklistItem: async (itemId) => {
    try {
      return await apiHelpers.delete(`maintenance/checklist/${itemId}`);
    } catch (error) {
      console.error(`Error deleting checklist item ${itemId}:`, error);
      throw error;
    }
  },

  /**
   * Reset a seasonal checklist to defaults
   * @param {string} season - Season name (Spring, Summer, Fall, Winter)
   * @param {number} propertyId - Property ID
   * @returns {Promise<Object>} Reset response data
   */
  resetSeasonalChecklist: async (season, propertyId) => {
    try {
      return await apiHelpers.post(`maintenance/checklist/reset/${season}`, {}, { 
        params: { property_id: propertyId }
      });
    } catch (error) {
      console.error(`Error resetting ${season} checklist:`, error);
      throw error;
    }
  },

  /**
   * Update multiple checklist items at once
   * @param {Array} items - Array of checklist items with ids and update data
   * @returns {Promise<Object>} Batch update response
   */
  batchUpdateItems: async (items) => {
    try {
      return await apiHelpers.put('maintenance/checklist/batch-update', { items });
    } catch (error) {
      console.error('Error batch updating checklist items:', error);
      throw error;
    }
  }
};

export default maintenanceChecklistService;