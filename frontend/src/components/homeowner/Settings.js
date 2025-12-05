import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../layout/Navigation';
import { apiHelpers } from '../../services/api';
import PropertyUsers from '../property/PropertyUsers'; 

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('account');
  
  // Form data states
  const [accountFormData, setAccountFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });
  
  const [passwordFormData, setPasswordFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    maintenance_reminders: true,
    payment_reminders: true,
    project_updates: true,
    document_updates: false
  });
  
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'dark',
    dashboard_layout: 'default'
  });

  // New state for timezone
  const [timezone, setTimezone] = useState('UTC');
  
  // New state for properties and primary residence
  const [properties, setProperties] = useState([]);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [primaryResidenceId, setPrimaryResidenceId] = useState('');
  const [loadingProperties, setLoadingProperties] = useState(false);
  
  // Fetch user when component mounts
  useEffect(() => {
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    
    if (!userString || !token) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(userString);
    setUser(userData);
    
    // Pre-fill form data with user information
    setAccountFormData({
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      email: userData.email || '',
      phone: userData.phone || ''
    });
    
    // Fetch notification and appearance settings
    fetchSettings();
    
    // Fetch properties for the user
    fetchProperties();
    
    setLoading(false);
  }, [navigate]);
  
  // Fetch user settings from API
  const fetchSettings = async () => {
    try {
      const response = await apiHelpers.get('settings');
      
      // If API returns notification settings, update state
      if (response && response.notifications) {
        setNotificationSettings(response.notifications);
      }
      
      // If API returns appearance settings, update state
      if (response && response.appearance) {
        setAppearanceSettings(response.appearance);
      }

      // If API returns timezone, update state
      if (response && response.timezone) {
        setTimezone(response.timezone);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      // Continue with default settings if fetch fails
    }
  };

  // Fetch properties for the user
  const fetchProperties = async () => {
    try {
      setLoadingProperties(true);
      const response = await apiHelpers.get('properties/');
      
      if (response && Array.isArray(response)) {
        setProperties(response);
        
        // Find and set primary residence
        const primaryProperty = response.find(property => property.is_primary_residence);
        if (primaryProperty) {
          setPrimaryResidenceId(primaryProperty.id.toString());
          setCurrentProperty(primaryProperty);
        } else if (response.length > 0) {
          // If no primary residence, set the first property as current
          setCurrentProperty(response[0]);
        }
      }
      
      setLoadingProperties(false);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setLoadingProperties(false);
    }
  };
  
  // Handle account form input changes
  const handleAccountInputChange = (e) => {
    const { name, value } = e.target;
    setAccountFormData({
      ...accountFormData,
      [name]: value
    });
  };
  
  // Handle password form input changes
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData({
      ...passwordFormData,
      [name]: value
    });
  };
  
  // Handle notification toggle changes
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked
    });
  };
  
  // Handle appearance setting changes
  const handleAppearanceChange = (e) => {
    const { name, value } = e.target;
    setAppearanceSettings({
      ...appearanceSettings,
      [name]: value
    });
  };

  // Handle timezone change
  const handleTimezoneChange = (e) => {
    setTimezone(e.target.value);
  };

  // Handle primary residence change
  const handlePrimaryResidenceChange = async (e) => {
    const propertyId = e.target.value;
    
    if (!propertyId) return;
    
    try {
      setLoading(true);
      
      await apiHelpers.post(`properties/${propertyId}/set-primary`, {});
      
      setPrimaryResidenceId(propertyId);
      setMessage('Primary residence updated successfully!');
      
      // Refresh properties to reflect the change
      fetchProperties();
      setLoading(false);
    } catch (err) {
      console.error('Error updating primary residence:', err);
      setError('Failed to update primary residence. Please try again.');
      setLoading(false);
    }
  };
  
  // Update account information
  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      await apiHelpers.put('users/profile', accountFormData);
      
      // Update local user data
      const updatedUser = { ...user, ...accountFormData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setMessage('Account information updated successfully!');
      setLoading(false);
    } catch (err) {
      console.error('Error updating account:', err);
      setError('Failed to update account information. Please try again.');
      setLoading(false);
    }
  };
  
  // Update password
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    // Validate password match
    if (passwordFormData.new_password !== passwordFormData.confirm_password) {
      setError('New passwords do not match.');
      return;
    }
    
    try {
      setLoading(true);
      
      await apiHelpers.put('users/password', {
        current_password: passwordFormData.current_password,
        new_password: passwordFormData.new_password
      });
      
      // Reset password form
      setPasswordFormData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      setMessage('Password updated successfully!');
      setLoading(false);
    } catch (err) {
      console.error('Error updating password:', err);
      
      if (err.response && err.response.status === 401) {
        setError('Current password is incorrect.');
      } else {
        setError('Failed to update password. Please try again.');
      }
      
      setLoading(false);
    }
  };
  
  // Update notification settings
  const handleNotificationUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      await apiHelpers.put('settings/notifications', notificationSettings);
      
      setMessage('Notification settings updated successfully!');
      setLoading(false);
    } catch (err) {
      console.error('Error updating notification settings:', err);
      setError('Failed to update notification settings. Please try again.');
      setLoading(false);
    }
  };
  
  // Update appearance settings
  const handleAppearanceUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      await apiHelpers.put('settings/appearance', appearanceSettings);
      
      setMessage('Appearance settings updated successfully!');
      setLoading(false);
    } catch (err) {
      console.error('Error updating appearance settings:', err);
      setError('Failed to update appearance settings. Please try again.');
      setLoading(false);
    }
  };

  // Update timezone
  const handleTimezoneUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      await apiHelpers.put('settings/timezone', { timezone });
      
      setMessage('Timezone updated successfully!');
      setLoading(false);
    } catch (err) {
      console.error('Error updating timezone:', err);
      setError('Failed to update timezone. Please try again.');
      setLoading(false);
    }
  };

  // Timezone options based on major regions
  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
    { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
    { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
    { value: 'America/Anchorage', label: 'Alaska' },
    { value: 'Pacific/Honolulu', label: 'Hawaii' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Europe/Berlin', label: 'Berlin' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Asia/Shanghai', label: 'Shanghai' },
    { value: 'Australia/Sydney', label: 'Sydney' },
    { value: 'Pacific/Auckland', label: 'Auckland' },
    { value: 'UTC', label: 'UTC' }
  ];

  return (
    <Navigation user={user}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-gray-400 mt-1">Manage your account and application preferences</p>
          </div>
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
        
        {/* Settings Layout */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Settings Navigation */}
          <div className="md:w-1/4">
            <div className="card p-4">
              <nav className="flex flex-col space-y-1">
                <button
                  className={`px-4 py-2 rounded-md text-left flex items-center ${
                    activeTab === 'account' ? 'bg-sky-900 bg-opacity-20 text-sky-400' : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveTab('account')}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  Account Information
                </button>
                
                <button
                  className={`px-4 py-2 rounded-md text-left flex items-center ${
                    activeTab === 'password' ? 'bg-sky-900 bg-opacity-20 text-sky-400' : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveTab('password')}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  Password
                </button>

                <button
                  className={`px-4 py-2 rounded-md text-left flex items-center ${
                    activeTab === 'property' ? 'bg-sky-900 bg-opacity-20 text-sky-400' : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveTab('property')}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                  Property Settings
                </button>

                {/* New Property Users Tab */}
                <button
                  className={`px-4 py-2 rounded-md text-left flex items-center ${
                    activeTab === 'users' ? 'bg-sky-900 bg-opacity-20 text-sky-400' : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveTab('users')}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                  Property Users
                </button>
                
                <button
                  className={`px-4 py-2 rounded-md text-left flex items-center ${
                    activeTab === 'notifications' ? 'bg-sky-900 bg-opacity-20 text-sky-400' : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                  Notifications
                </button>
                
                <button
                  className={`px-4 py-2 rounded-md text-left flex items-center ${
                    activeTab === 'appearance' ? 'bg-sky-900 bg-opacity-20 text-sky-400' : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveTab('appearance')}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
                  </svg>
                  Appearance
                </button>

                <button
                  className={`px-4 py-2 rounded-md text-left flex items-center ${
                    activeTab === 'timezone' ? 'bg-sky-900 bg-opacity-20 text-sky-400' : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveTab('timezone')}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Time Zone
                </button>
                
                <button
                  className={`px-4 py-2 rounded-md text-left flex items-center ${
                    activeTab === 'data' ? 'bg-sky-900 bg-opacity-20 text-sky-400' : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveTab('data')}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
                  </svg>
                  Data & Privacy
                </button>
              </nav>
            </div>
          </div>
          
          {/* Settings Content */}
          <div className="md:w-3/4">
            <div className="card p-6">
              {/* Account Information Tab */}
              {activeTab === 'account' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Account Information</h2>
                  <form onSubmit={handleAccountUpdate}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">First Name</label>
                        <input
                          type="text"
                          name="first_name"
                          className="form-input"
                          value={accountFormData.first_name}
                          onChange={handleAccountInputChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          name="last_name"
                          className="form-input"
                          value={accountFormData.last_name}
                          onChange={handleAccountInputChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          className="form-input"
                          value={accountFormData.email}
                          onChange={handleAccountInputChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          className="form-input"
                          value={accountFormData.phone}
                          onChange={handleAccountInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <button
                        type="submit"
                        className="btn-secondary px-4 py-2 rounded-md"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Password Tab */}
              {activeTab === 'password' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Update Password</h2>
                  <form onSubmit={handlePasswordUpdate}>
                    <div className="space-y-4">
                      <div>
                        <label className="form-label">Current Password</label>
                        <input
                          type="password"
                          name="current_password"
                          className="form-input"
                          value={passwordFormData.current_password}
                          onChange={handlePasswordInputChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">New Password</label>
                        <input
                          type="password"
                          name="new_password"
                          className="form-input"
                          value={passwordFormData.new_password}
                          onChange={handlePasswordInputChange}
                          minLength="8"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Confirm New Password</label>
                        <input
                          type="password"
                          name="confirm_password"
                          className="form-input"
                          value={passwordFormData.confirm_password}
                          onChange={handlePasswordInputChange}
                          minLength="8"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-400">
                      <p>Password must be at least 8 characters long and include:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>At least one uppercase letter</li>
                        <li>At least one lowercase letter</li>
                        <li>At least one number</li>
                        <li>At least one special character</li>
                      </ul>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <button
                        type="submit"
                        className="btn-secondary px-4 py-2 rounded-md"
                        disabled={loading}
                      >
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Property Settings Tab */}
              {activeTab === 'property' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Property Settings</h2>
                  <form>
                    <div className="space-y-6">
                      <div>
                        <label className="form-label">Primary Residence</label>
                        <p className="text-sm text-gray-400 mb-2">
                          Select which property is your primary residence. This affects seasonal maintenance recommendations 
                          and location-based features.
                        </p>
                        
                        {loadingProperties ? (
                          <div className="flex items-center mt-2">
                            <svg className="animate-spin h-5 w-5 text-sky-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Loading properties...</span>
                          </div>
                        ) : properties.length === 0 ? (
                          <div className="bg-gray-700 p-4 rounded-md text-center">
                            <p className="text-gray-300">No properties found. Add a property to set as your primary residence.</p>
                            <button
                              type="button"
                              className="btn-secondary mt-3 text-sm px-4 py-2 rounded-md"
                              onClick={() => navigate('/add-property')}
                            >
                              Add Property
                            </button>
                          </div>
                        ) : (
                          <select
                            className="form-input"
                            value={primaryResidenceId}
                            onChange={handlePrimaryResidenceChange}
                          >
                            <option value="">Select Primary Residence</option>
                            {properties.map(property => (
                              <option key={property.id} value={property.id.toString()}>
                                {property.address}, {property.city}, {property.state} {property.zip}
                              </option>
                            ))}
                          </select>
                        )}
                        
                        {properties.length > 0 && primaryResidenceId && (
                          <div className="mt-2 flex items-center text-sm text-sky-400">
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Primary residence is set!
                          </div>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* New Property Users Tab */}
              {activeTab === 'users' && (
                <PropertyUsers 
                  currentProperty={currentProperty}
                  setCurrentProperty={setCurrentProperty}
                />
              )}
              
              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
                  <form onSubmit={handleNotificationUpdate}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-700">
                        <div>
                          <h3 className="font-medium">Email Notifications</h3>
                          <p className="text-sm text-gray-400">Receive notifications via email</p>
                        </div>
                        <label className="flex items-center cursor-pointer">
                          <div className="relative">
                            <input 
                              type="checkbox" 
                              name="email_notifications" 
                              checked={notificationSettings.email_notifications} 
                              onChange={handleNotificationChange}
                              className="sr-only" 
                            />
                            <div className={`block w-10 h-6 rounded-full ${notificationSettings.email_notifications ? 'bg-sky-400' : 'bg-gray-600'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${notificationSettings.email_notifications ? 'transform translate-x-4' : ''}`}></div>
                          </div>
                        </label>
                      </div>
                      
                      {/* Other notification settings... */}
                      <div className="flex items-center justify-between py-3 border-b border-gray-700">
                        <div>
                          <h3 className="font-medium">Maintenance Reminders</h3>
                          <p className="text-sm text-gray-400">Get reminders about upcoming maintenance tasks</p>
                        </div>
                        <label className="flex items-center cursor-pointer">
                          <div className="relative">
                            <input 
                              type="checkbox" 
                              name="maintenance_reminders" 
                              checked={notificationSettings.maintenance_reminders} 
                              onChange={handleNotificationChange}
                              className="sr-only" 
                            />
                            <div className={`block w-10 h-6 rounded-full ${notificationSettings.maintenance_reminders ? 'bg-sky-400' : 'bg-gray-600'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${notificationSettings.maintenance_reminders ? 'transform translate-x-4' : ''}`}></div>
                          </div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between py-3 border-b border-gray-700">
                        <div>
                          <h3 className="font-medium">Payment Reminders</h3>
                          <p className="text-sm text-gray-400">Get reminders about upcoming payments</p>
                        </div>
                        <label className="flex items-center cursor-pointer">
                          <div className="relative">
                            <input 
                              type="checkbox" 
                              name="payment_reminders" 
                              checked={notificationSettings.payment_reminders} 
                              onChange={handleNotificationChange}
                              className="sr-only" 
                            />
                            <div className={`block w-10 h-6 rounded-full ${notificationSettings.payment_reminders ? 'bg-sky-400' : 'bg-gray-600'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${notificationSettings.payment_reminders ? 'transform translate-x-4' : ''}`}></div>
                          </div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between py-3 border-b border-gray-700">
                        <div>
                          <h3 className="font-medium">Project Updates</h3>
                          <p className="text-sm text-gray-400">Get notifications about project status changes</p>
                        </div>
                        <label className="flex items-center cursor-pointer">
                          <div className="relative">
                            <input 
                              type="checkbox" 
                              name="project_updates" 
                              checked={notificationSettings.project_updates} 
                              onChange={handleNotificationChange}
                              className="sr-only" 
                            />
                            <div className={`block w-10 h-6 rounded-full ${notificationSettings.project_updates ? 'bg-sky-400' : 'bg-gray-600'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${notificationSettings.project_updates ? 'transform translate-x-4' : ''}`}></div>
                          </div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <h3 className="font-medium">Document Updates</h3>
                          <p className="text-sm text-gray-400">Get notifications when documents are added or updated</p>
                        </div>
                        <label className="flex items-center cursor-pointer">
                          <div className="relative">
                            <input 
                              type="checkbox" 
                              name="document_updates" 
                              checked={notificationSettings.document_updates} 
                              onChange={handleNotificationChange}
                              className="sr-only" 
                            />
                            <div className={`block w-10 h-6 rounded-full ${notificationSettings.document_updates ? 'bg-sky-400' : 'bg-gray-600'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${notificationSettings.document_updates ? 'transform translate-x-4' : ''}`}></div>
                          </div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <button
                        type="submit"
                        className="btn-secondary px-4 py-2 rounded-md"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Preferences'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Appearance Settings</h2>
                  <form onSubmit={handleAppearanceUpdate}>
                    <div className="space-y-6">
                      <div>
                        <label className="form-label">Theme</label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <label className={`flex flex-col items-center border rounded-md p-4 cursor-pointer transition ${
                            appearanceSettings.theme === 'dark' ? 'border-sky-400 bg-sky-900 bg-opacity-10' : 'border-gray-700 hover:border-gray-600'
                          }`}>
                            <input 
                              type="radio" 
                              name="theme" 
                              value="dark" 
                              checked={appearanceSettings.theme === 'dark'} 
                              onChange={handleAppearanceChange}
                              className="sr-only" 
                            />
                            <svg className="h-10 w-10 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                            </svg>
                            <span className="font-medium">Dark Theme</span>
                          </label>
                          
                          <label className={`flex flex-col items-center border rounded-md p-4 cursor-pointer transition ${
                            appearanceSettings.theme === 'light' ? 'border-sky-400 bg-sky-900 bg-opacity-10' : 'border-gray-700 hover:border-gray-600'
                          }`}>
                            <input 
                              type="radio" 
                              name="theme" 
                              value="light" 
                              checked={appearanceSettings.theme === 'light'} 
                              onChange={handleAppearanceChange}
                              className="sr-only" 
                            />
                            <svg className="h-10 w-10 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                            <span className="font-medium">Light Theme</span>
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label className="form-label">Dashboard Layout</label>
                        <select 
                          name="dashboard_layout" 
                          className="form-input mt-2" 
                          value={appearanceSettings.dashboard_layout} 
                          onChange={handleAppearanceChange}
                        >
                          <option value="default">Default Layout</option>
                          <option value="compact">Compact Layout</option>
                          <option value="expanded">Expanded Layout</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <button
                        type="submit"
                        className="btn-secondary px-4 py-2 rounded-md"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Preferences'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Timezone Tab */}
              {activeTab === 'timezone' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Time Zone Settings</h2>
                  <form onSubmit={handleTimezoneUpdate}>
                    <div className="space-y-6">
                      <div>
                        <label className="form-label">Time Zone</label>
                        <p className="text-sm text-gray-400 mb-2">
                          Select your time zone to ensure maintenance reminders, notifications, and other time-sensitive 
                          features are accurate for your location.
                        </p>
                        <select 
                          className="form-input" 
                          value={timezone}
                          onChange={handleTimezoneChange}
                        >
                          {timezoneOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label} ({option.value})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <button
                        type="submit"
                        className="btn-secondary px-4 py-2 rounded-md"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Time Zone'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Data & Privacy Tab */}
              {activeTab === 'data' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Data & Privacy</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Data Export</h3>
                      <p className="text-gray-400 mb-4">Download a copy of your PropertyPal data</p>
                      <button className="btn-secondary text-sm px-4 py-2 rounded-md">
                        <svg className="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"></path>
                        </svg>
                        Export Data
                      </button>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-700">
                      <h3 className="text-lg font-medium mb-2">Delete Account</h3>
                      <p className="text-gray-400 mb-4">Permanently delete your account and all associated data</p>
                      <button className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-md">
                        <svg className="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Navigation>
  );
};

export default Settings;