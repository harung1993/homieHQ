
// src/services/propertyUserService.js
import { api } from '../../services/api';

/**
 * Service for handling property user management API calls
 */
const propertyUserService = {
  /**
   * Get all users for a property
   * @param {number} propertyId - Property ID
   * @returns {Promise<Array>} Array of user objects
   */
  getPropertyUsers: async (propertyId) => {
    try {
      // Using exact backend route: /api/property-users/{property_id}/users
      const response = await api.get(`property-users/${propertyId}/users`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching users for property ${propertyId}:`, error);
      return [];
    }
  },

  /**
   * Invite a user to a property
   * @param {number} propertyId - Property ID
   * @param {Object} userData - User data including email and role
   * @returns {Promise<Object>} Invitation details
   */
  inviteUser: async (propertyId, userData) => {
    try {
      // Using exact backend route: /api/property-users/{property_id}/invite
      // Your backend has both with and without trailing slash
      const response = await api.post(`property-users/${propertyId}/invite`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error inviting user to property ${propertyId}:`, error);
      throw error;
    }
  },

  /**
   * Update a property user's role
   * @param {number} propertyId - Property ID
   * @param {number} userId - User ID
   * @param {Object} updateData - Update data including role
   * @returns {Promise<Object>} Updated user details
   */
  updatePropertyUser: async (propertyId, userId, updateData) => {
    try {
      // Using exact backend route: /api/property-users/{property_id}/user/{user_id}
      const response = await api.put(`property-users/${propertyId}/user/${userId}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userId} for property ${propertyId}:`, error);
      throw error;
    }
  },

  /**
   * Remove a user from a property
   * @param {number} propertyId - Property ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Response data
   */
  removePropertyUser: async (propertyId, userId) => {
    try {
      // Using exact backend route: /api/property-users/{property_id}/user/{user_id}
      const response = await api.delete(`property-users/${propertyId}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing user ${userId} from property ${propertyId}:`, error);
      throw error;
    }
  },

  /**
   * Get pending invitations for a property
   * @param {number} propertyId - Property ID
   * @returns {Promise<Array>} Array of invitation objects
   */
  getPendingInvitations: async (propertyId) => {
    try {
      // Using exact backend route: /api/property-users/invitations
      // Filter by property_id in query params (backend handles this)
      const response = await api.get(`property-users/invitations`, {
        params: { property_id: propertyId }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching invitations for property ${propertyId}:`, error);
      return [];
    }
  },

  /**
   * Cancel a pending invitation
   * @param {number} invitationId - Invitation ID
   * @returns {Promise<Object>} Response data
   */
  cancelInvitation: async (invitationId) => {
    try {
      // Using a route pattern to match your backend
      const response = await api.delete(`property-users/invitations/${invitationId}`);
      return response.data;
    } catch (error) {
      console.error(`Error canceling invitation ${invitationId}:`, error);
      throw error;
    }
  },

  /**
   * Get all invitations for the current user
   * @returns {Promise<Array>} Array of invitation objects
   */
  getUserInvitations: async () => {
    try {
      // Using exact backend route: /api/property-users/invitations
      const response = await api.get('property-users/invitations');
      return response.data;
    } catch (error) {
      console.error('Error fetching user invitations:', error);
      return [];
    }
  },

  /**
   * Accept an invitation
   * @param {string} token - Invitation token
   * @returns {Promise<Object>} Accepted invitation details
   */
  acceptInvitation: async (token) => {
    try {
      // Using exact backend route: /api/property-users/invitations/accept
      const response = await api.post('property-users/invitations/accept', { token });
      return response.data;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  },

  /**
   * Decline an invitation
   * @param {string} token - Invitation token
   * @returns {Promise<Object>} Response data
   */
  declineInvitation: async (token) => {
    try {
      // Using exact backend route: /api/property-users/invitations/decline
      const response = await api.post('property-users/invitations/decline', { token });
      return response.data;
    } catch (error) {
      console.error('Error declining invitation:', error);
      throw error;
    }
  }
};

export default propertyUserService;