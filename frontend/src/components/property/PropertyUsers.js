import React, { useState, useEffect } from 'react';
import propertyUserService from '../services/propertyUserService';
import PropertySelector from '../layout/PropertySelector';
import UserInvitations from './UserInvitations';

const PropertyUsers = ({ currentProperty, setCurrentProperty }) => {
  // Removed the unused navigate variable
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // User management states
  const [propertyUsers, setPropertyUsers] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'tenant',
    message: ''
  });

  // Fetch property users
  useEffect(() => {
    if (currentProperty && currentProperty.id) {
      fetchPropertyUsers(currentProperty.id);
      fetchPendingInvitations(currentProperty.id);
    }
  }, [currentProperty]);

  // Handle property selection from dropdown
  const handleSelectProperty = (property) => {
    setCurrentProperty(property);
    
    // Save to localStorage
    localStorage.setItem('currentPropertyId', property.id);
    
    // Fetch users for the selected property
    fetchPropertyUsers(property.id);
    fetchPendingInvitations(property.id);
  };

  // Fetch property users from API
  const fetchPropertyUsers = async (propertyId) => {
    try {
      setLoading(true);
      
      // API call to get property users using the service
      const users = await propertyUserService.getPropertyUsers(propertyId);
      
      setPropertyUsers(users || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching property users:', err);
      setError('Failed to load property users. Please try again later.');
      setPropertyUsers([]);
      setLoading(false);
    }
  };

  // Fetch pending invitations
  const fetchPendingInvitations = async (propertyId) => {
    try {
      // API call to get pending invitations for this property
      const invitations = await propertyUserService.getPendingInvitations(propertyId);
      
      setPendingInvitations(invitations || []);
    } catch (err) {
      console.error('Error fetching pending invitations:', err);
      setPendingInvitations([]);
    }
  };

  // Handle invite form input changes
  const handleInviteInputChange = (e) => {
    const { name, value } = e.target;
    setInviteData({
      ...inviteData,
      [name]: value
    });
  };

  // Send invitation
  const handleSendInvite = async (e) => {
    e.preventDefault();
    
    if (!inviteData.email) {
      setError('Email address is required.');
      return;
    }
    
    try {
      setLoading(true);
      
      // API call to send invitation using the service
      await propertyUserService.inviteUser(currentProperty.id, {
        email: inviteData.email,
        role: inviteData.role,
        message: inviteData.message
      });
      
      setMessage(`Invitation sent to ${inviteData.email} successfully!`);
      
      // Reset form
      setInviteData({
        email: '',
        role: 'tenant',
        message: ''
      });
      
      setShowInviteForm(false);
      
      // Refresh invitations
      fetchPendingInvitations(currentProperty.id);
      setLoading(false);
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError('Failed to send invitation. Please try again later.');
      setLoading(false);
    }
  };

  // Handle updating user role
  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      setLoading(true);
      
      // API call to update user role using the service
      await propertyUserService.updatePropertyUser(currentProperty.id, userId, {
        role: newRole
      });
      
      setMessage('User role updated successfully!');
      
      // Refresh users
      fetchPropertyUsers(currentProperty.id);
      setLoading(false);
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role. Please try again later.');
      setLoading(false);
    }
  };

  // Handle removing a user
  const handleRemoveUser = async (userId) => {
    if (window.confirm('Are you sure you want to remove this user from the property?')) {
      try {
        setLoading(true);
        
        // API call to remove user using the service
        await propertyUserService.removePropertyUser(currentProperty.id, userId);
        
        setMessage('User removed successfully!');
        
        // Refresh users
        fetchPropertyUsers(currentProperty.id);
        setLoading(false);
      } catch (err) {
        console.error('Error removing user:', err);
        setError('Failed to remove user. Please try again later.');
        setLoading(false);
      }
    }
  };

  // Handle canceling an invitation
  const handleCancelInvitation = async (invitationId) => {
    if (window.confirm('Are you sure you want to cancel this invitation?')) {
      try {
        setLoading(true);
        
        // API call to cancel invitation using the service
        await propertyUserService.cancelInvitation(invitationId);
        
        setMessage('Invitation canceled successfully!');
        
        // Refresh invitations
        fetchPendingInvitations(currentProperty.id);
        setLoading(false);
      } catch (err) {
        console.error('Error canceling invitation:', err);
        setError('Failed to cancel invitation. Please try again later.');
        setLoading(false);
      }
    }
  };

  // Get role badge style
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

  // Get role options user can assign (based on their own role)
  const getRoleOptions = (currentUserRole) => {
    // Assuming the current user's role is 'owner'
    // In a real implementation, you would check the current user's role for the property
    if (currentUserRole === 'owner') {
      return [
        { value: 'owner', label: 'Owner' },
        { value: 'manager', label: 'Manager' },
        { value: 'tenant', label: 'Tenant' }
      ];
    } else if (currentUserRole === 'manager') {
      return [
        { value: 'manager', label: 'Manager' },
        { value: 'tenant', label: 'Tenant' }
      ];
    } else {
      return [
        { value: 'tenant', label: 'Tenant' }
      ];
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Property Users & Permissions</h2>
      
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
      
      {/* Property selector */}
      <div className="mb-6">
        <label className="form-label">Select Property</label>
        <PropertySelector 
          currentProperty={currentProperty} 
          onSelectProperty={handleSelectProperty} 
        />
      </div>
      
      {/* Property Users List */}
      <div className="card p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Property Users</h3>
          <button 
            className="btn-secondary text-sm px-4 py-2 rounded-md"
            onClick={() => setShowInviteForm(true)}
          >
            <svg className="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Invite User
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-4">
            <svg className="animate-spin h-5 w-5 text-secondary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : !currentProperty ? (
          <div className="text-center py-6">
            <p className="text-gray-400">Please select a property to manage users</p>
          </div>
        ) : propertyUsers.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-400 mb-4">No users associated with this property yet</p>
            <button 
              className="text-sky-400 hover:text-sky-300 text-sm"
              onClick={() => setShowInviteForm(true)}
            >
              Invite your first user
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700 bg-opacity-50">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">User</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">Email</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">Role</th>
                  <th className="py-3 px-4 text-right text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {propertyUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-700 hover:bg-opacity-30">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium">{user.first_name} {user.last_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">{user.email}</td>
                    <td className="py-4 px-4">
                      {user.is_current_user ? (
                        <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadge(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)} (You)
                        </span>
                      ) : (
                        <select 
                          className="form-input py-1 px-2 text-sm bg-gray-700"
                          value={user.role}
                          onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                          disabled={user.role === 'owner' && user.is_current_user === false}
                        >
                          {getRoleOptions('owner').map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {!user.is_current_user && (
                        <button 
                          className="text-red-500 hover:text-red-400 p-1 rounded"
                          onClick={() => handleRemoveUser(user.id)}
                          title="Remove User"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-medium mb-4">Pending Invitations</h3>
          <div className="divide-y divide-gray-700">
            {pendingInvitations.map(invitation => (
              <div key={invitation.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{invitation.email}</div>
                  <div className="text-sm text-gray-400">
                    Invited as: <span className={`px-2 py-0.5 text-xs rounded-full ${getRoleBadge(invitation.role)}`}>
                      {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                    </span> 
                    • Sent {new Date(invitation.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button 
                  className="text-red-500 hover:text-red-400 p-1 rounded"
                  onClick={() => handleCancelInvitation(invitation.id)}
                  title="Cancel Invitation"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Invite User Form */}
      {showInviteForm && (
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-medium mb-4">Invite User to Property</h3>
          <form onSubmit={handleSendInvite}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="form-label">Email Address*</label>
                <input 
                  type="email" 
                  name="email" 
                  className="form-input" 
                  value={inviteData.email} 
                  onChange={handleInviteInputChange}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Role*</label>
                <select 
                  name="role" 
                  className="form-input" 
                  value={inviteData.role} 
                  onChange={handleInviteInputChange}
                  required
                >
                  {getRoleOptions('owner').map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  {inviteData.role === 'owner' && 'Owner has full control over the property, including user management.'}
                  {inviteData.role === 'manager' && 'Manager can edit property details and manage tenants, but cannot add/remove owners.'}
                  {inviteData.role === 'tenant' && 'Tenant has limited access to property details and can submit maintenance requests.'}
                </p>
              </div>
              
              <div>
                <label className="form-label">Personal Message (Optional)</label>
                <textarea 
                  name="message" 
                  className="form-input" 
                  value={inviteData.message} 
                  onChange={handleInviteInputChange}
                  rows="3"
                  placeholder="Add a personal message to the invitation email..."
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                type="button"
                className="text-gray-400 hover:text-gray-300 px-4 py-2 mr-2"
                onClick={() => setShowInviteForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-secondary px-4 py-2 rounded-md"
                disabled={loading || !inviteData.email || !inviteData.role}
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Help text */}
      <div className="bg-gray-800 p-4 rounded-md text-sm mb-8">
        <h4 className="font-medium mb-2">About Property Users</h4>
        <p className="text-gray-400 mb-2">
          Property users have different levels of access based on their assigned role:
        </p>
        <ul className="list-disc pl-5 text-gray-400 space-y-1">
          <li><span className="text-blue-300 font-medium">Owners</span> have full control over the property, including user management.</li>
          <li><span className="text-sky-200 font-medium">Managers</span> can edit property details and manage tenants, but cannot add/remove owners.</li>
          <li><span className="text-purple-300 font-medium">Tenants</span> have limited access to property details and can submit maintenance requests.</li>
        </ul>
      </div>
      
      {/* My Invitations Section */}
      <div className="card p-6">
        <UserInvitations 
          setMessage={setMessage}
          setError={setError}
        />
      </div>
    </div>
  );
};

export default PropertyUsers;