// src/components/services/projectService.js
import { apiHelpers } from '../../services/api';

/**
 * Service for handling project-related API calls
 */
const projectService = {
  /**
   * Get all projects for a property
   * @param {number} propertyId - Property ID
   * @param {string} status - Optional status filter
   * @returns {Promise<Array>} Array of project objects
   */
  getProjects: async (propertyId, status = null) => {
    try {
      const params = { property_id: propertyId };
      
      if (status) {
        params.status = status;
      }
      
      return await apiHelpers.get('projects/', params);
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  /**
   * Get a single project by ID
   * @param {number} id - Project ID
   * @returns {Promise<Object>} Project object
   */
  getProject: async (id) => {
    try {
      return await apiHelpers.get(`projects/${id}`);
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @returns {Promise<Object>} Created project
   */
  createProject: async (projectData) => {
    try {
      return await apiHelpers.post('projects/', projectData);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  /**
   * Update an existing project
   * @param {number} id - Project ID
   * @param {Object} projectData - Updated project data
   * @returns {Promise<Object>} Updated project
   */
  updateProject: async (id, projectData) => {
    try {
      return await apiHelpers.put(`projects/${id}`, projectData);
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a project
   * @param {number} id - Project ID
   * @returns {Promise<Object>} Response object
   */
  deleteProject: async (id) => {
    try {
      return await apiHelpers.delete(`projects/${id}`);
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get project progress percentage
   * @param {Object} project - Project object
   * @returns {number} Progress percentage (0-100)
   */
  getProjectProgress: (project) => {
    if (!project) return 0;
    
    if (project.status === 'completed') return 100;
    
    // Calculate based on budget spent
    if (project.budget && project.spent) {
      return Math.min(Math.round((project.spent / project.budget) * 100), 100);
    }
    
    // Default progress values based on status
    switch (project.status) {
      case 'planning': return 15;
      case 'in-progress': return 50;
      case 'on-hold': return 30;
      default: return 0;
    }
  },
  
  /**
   * Get status colors for a project
   * @param {string} status - Project status
   * @returns {Object} CSS classes for status display
   */
  getStatusColors: (status) => {
    const statusColors = {
      'planning': {
        bg: 'bg-blue-500', 
        badge: 'bg-blue-900 text-blue-300 bg-opacity-30'
      },
      'in-progress': {
        bg: 'bg-sky-400', 
        badge: 'bg-sky-900 text-sky-200 bg-opacity-30'
      },
      'on-hold': {
        bg: 'bg-yellow-500', 
        badge: 'bg-yellow-900 text-yellow-300 bg-opacity-30'
      },
      'completed': {
        bg: 'bg-gray-500', 
        badge: 'bg-gray-700 text-gray-300'
      }
    };
    
    return statusColors[status] || {
      bg: 'bg-sky-400', 
      badge: 'bg-gray-700 text-gray-300'
    };
  },
  
  /**
   * Format currency value
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  formatCurrency: (amount) => {
    if (amount === null || amount === undefined) return '$0';
    return '$' + amount.toLocaleString('en-US', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });
  }
};

export default projectService;