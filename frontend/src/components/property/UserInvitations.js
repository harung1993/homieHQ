import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import propertyUserService from '../services/propertyUserService';

/**
 * Component for displaying and managing property invitations
 */
const UserInvitations = ({ setMessage, setError }) => {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user invitations
  useEffect(() => {
    const fetchUserInvitations = async () => {
      try {
        setLoading(true);
        const invitationsData = await propertyUserService.getUserInvitations();
        setInvitations(invitationsData || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching invitations:', err);
        setInvitations([]);
        setLoading(false);
      }
    };

    fetchUserInvitations();
  }, []);

  // Accept invitation
  const handleAcceptInvitation = async (token) => {
    try {
      setLoading(true);
      await propertyUserService.acceptInvitation(token);
      
      // Remove from invitations list
      setInvitations(invitations.filter(inv => inv.token !== token));
      
      setMessage('Invitation accepted! You now have access to this property.');
      setLoading(false);
      
      // Navigate to the newly accessible property
      // In a real implementation, you might want to navigate to the property page
      navigate('/property-hub');
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError('Failed to accept invitation. Please try again later.');
      setLoading(false);
    }
  };

  // Decline invitation
  const handleDeclineInvitation = async (token) => {
    try {
      setLoading(true);
      await propertyUserService.declineInvitation(token);
      
      // Remove from invitations list
      setInvitations(invitations.filter(inv => inv.token !== token));
      
      setMessage('Invitation declined.');
      setLoading(false);
    } catch (err) {
      console.error('Error declining invitation:', err);
      setError('Failed to decline invitation. Please try again later.');
      setLoading(false);
    }
  };

  // Get role badge styling
  const getRoleBadge = (role) => {
    switch (role) {
      case 'owner':
        return 'bg-blue-900 bg-opacity-30 text-blue-300';
      case 'manager':
        return 'bg-sky-900 bg-opacity-30 text-sky-200';
      case 'tenant':
        return 'bg-purple-900 bg-opacity-30 text-purple-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">My Invitations</h3>
      
      {loading ? (
        <div className="text-center py-4">
          <svg className="animate-spin h-5 w-5 text-secondary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : invitations.length === 0 ? (
        <div className="text-gray-400 text-center py-4">
          You have no pending invitations.
        </div>
      ) : (
        <div className="divide-y divide-gray-700">
          {invitations.map(invitation => (
            <div key={invitation.id} className="py-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{invitation.property_name || 'Property'}</h4>
                  <p className="text-sm text-gray-400">
                    {invitation.property_address || 'No address provided'}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadge(invitation.role)}`}>
                  {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                </span>
              </div>
              
              <div className="text-sm text-gray-400 mb-4">
                <div className="flex items-center mb-1">
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  Invited by: {invitation.invited_by_name || 'Unknown'}
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Sent: {formatDate(invitation.created_at)}
                </div>
              </div>
              
              {invitation.message && (
                <div className="bg-gray-800 p-3 rounded-md mb-4 text-sm italic">
                  "{invitation.message}"
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                  onClick={() => handleAcceptInvitation(invitation.token)}
                >
                  Accept
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                  onClick={() => handleDeclineInvitation(invitation.token)}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserInvitations;