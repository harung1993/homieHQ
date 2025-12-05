import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiHelpers, API_BASE_URL } from '../../services/api';
import Navigation from '../layout/Navigation';

const PropertyHub = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalExpenses: 0,
    totalMaintenance: 0
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [expiringAppliances, setExpiringAppliances] = useState([]);
  const [seasonalMaintenanceStats, setSeasonalMaintenanceStats] = useState({
    spring: { total: 0, completed: 0 },
    summer: { total: 0, completed: 0 },
    fall: { total: 0, completed: 0 },
    winter: { total: 0, completed: 0 }
  });
  const [upcomingExpenses, setUpcomingExpenses] = useState([]);

  // Get current season
  const getCurrentSeason = () => {
    const now = new Date();
    const month = now.getMonth();
    
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  };

  // Memoized function to fetch property metrics
  const fetchPropertyMetrics = useCallback(async (properties) => {
    // Setting up stats
    let totalExpenses = 0;
    let totalMaintenance = 0;
    let seasonalStats = {
      spring: { total: 0, completed: 0 },
      summer: { total: 0, completed: 0 },
      fall: { total: 0, completed: 0 },
      winter: { total: 0, completed: 0 }
    };
    
    // Get upcoming expenses for the next 30 days
    const now = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(now.getDate() + 30);
    
    const startDateStr = now.toISOString().split('T')[0];
    const endDateStr = thirtyDaysLater.toISOString().split('T')[0];
    let upcomingExpensesList = [];
    
    // For each property, fetch metrics
    for (const property of properties) {
      try {
        // Fetch current month expenses 
        const expensesResponse = await apiHelpers.get(
          `/finances/expenses/`,
          { property_id: property.id, start_date: startDateStr, end_date: endDateStr }
        ).catch(() => []);  // Return empty array on error
        
        // Add to total expenses
        const expenses = Array.isArray(expensesResponse) ? expensesResponse : [];
        totalExpenses += expenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        // Get upcoming expenses for display
        const filteredExpenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate > now && expenseDate <= thirtyDaysLater;
        }).map(expense => ({
          ...expense,
          propertyAddress: property.address
        }));
        
        upcomingExpensesList = [...upcomingExpensesList, ...filteredExpenses];
        
        // Fetch maintenance items
        const maintenanceResponse = await apiHelpers.get(
          '/maintenance/',
          { status: 'pending', property_id: property.id }
        ).catch(() => []);  // Return empty array on error
        
        const maintenanceItems = Array.isArray(maintenanceResponse) ? maintenanceResponse : [];
        totalMaintenance += maintenanceItems.length;
        
        // Fetch seasonal maintenance checklist data for all seasons
        // Using a try/catch block for each season separately
        const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
        for (const season of seasons) {
          try {
            const seasonResponse = await apiHelpers.get(
              `/maintenance/checklist/${season}`,
              { property_id: property.id }
            ).catch(() => ({ items: [] }));  // Return object with empty items array on error
            
            // Handle different response formats
            let items = [];
            if (Array.isArray(seasonResponse)) {
              items = seasonResponse;
            } else if (seasonResponse && Array.isArray(seasonResponse.items)) {
              items = seasonResponse.items;
            }
            
            // Store season data in lowercase keys for consistency with state
            const seasonKey = season.toLowerCase();
            seasonalStats[seasonKey].total += items.length;
            seasonalStats[seasonKey].completed += items.filter(item => item.is_completed).length;
          } catch (error) {
            console.error(`Error fetching ${season} checklist for property ${property.id}:`, error);
            // Continue with next season
          }
        }
      } catch (error) {
        console.error(`Error fetching data for property ${property.id}:`, error);
        // Continue with next property
      }
    }
    
    // Update state with all metrics
    setStats({
      totalProperties: properties.length,
      totalExpenses,
      totalMaintenance
    });
    
    setSeasonalMaintenanceStats(seasonalStats);
    
    // Sort upcoming expenses by date
    upcomingExpensesList.sort((a, b) => new Date(a.date) - new Date(b.date));
    setUpcomingExpenses(upcomingExpensesList.slice(0, 5)); // Show top 5
  }, []);

  // Fetch expiring appliance warranties
  const fetchExpiringWarranties = useCallback(async (properties) => {
    try {
      // For all properties, get appliances with warranties expiring soon
      let expiringAppliancesList = [];

      for (const property of properties) {
        try {
          // Get appliances with warranties expiring in the next 90 days
          const today = new Date();
          const ninetyDaysLater = new Date();
          ninetyDaysLater.setDate(today.getDate() + 90);

          const appliancesResponse = await apiHelpers.get(
            '/appliances/',
            { property_id: property.id }
          ).catch(() => []);  // Return empty array on error
          
          const appliances = Array.isArray(appliancesResponse) ? appliancesResponse : [];
          
          // Filter for appliances with warranties expiring in the next 90 days
          const expiring = appliances.filter(appliance => {
            if (!appliance.warranty_expiration) return false;
            
            const expirationDate = new Date(appliance.warranty_expiration);
            return expirationDate > today && expirationDate <= ninetyDaysLater;
          }).map(appliance => ({
            ...appliance,
            propertyAddress: property.address
          }));
          
          expiringAppliancesList = [
            ...expiringAppliancesList,
            ...expiring
          ];
        } catch (error) {
          console.error(`Error fetching appliances for property ${property.id}:`, error);
          // Continue with next property
        }
      }
      
      // Sort by expiration date
      expiringAppliancesList.sort((a, b) => {
        return new Date(a.warranty_expiration) - new Date(b.warranty_expiration);
      });
      
      setExpiringAppliances(expiringAppliancesList);
    } catch (err) {
      console.error('Error fetching expiring warranties:', err);
      // Don't throw the error, just log it and continue
      setExpiringAppliances([]);
    }
  }, []);

  // Fetch all properties
  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedProperties = await apiHelpers.get('/properties/');
      
      if (Array.isArray(fetchedProperties)) {
        setProperties(fetchedProperties);
        
        // Only proceed if we have properties
        if (fetchedProperties.length > 0) {
          // Calculate summary stats
          await fetchPropertyMetrics(fetchedProperties);
          
          // Fetch expiring warranties
          await fetchExpiringWarranties(fetchedProperties);
        }
      } else {
        console.error('Expected array of properties but got:', fetchedProperties);
        setProperties([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again later.');
      setProperties([]); // Set empty array on error
      setLoading(false);
    }
  }, [fetchPropertyMetrics, fetchExpiringWarranties]);

  useEffect(() => {
    // Check if user is logged in
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    
    if (!userString || !token) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userString));
    
    // Fetch properties
    fetchProperties();
  }, [navigate, fetchProperties]);

  // Select property to view details
  const selectProperty = (property) => {
    // Show the detail modal
    setSelectedProperty(property);
    setShowDetailModal(true);
  };

  // Set a property as primary residence
  const setAsPrimaryResidence = async (propertyId, event) => {
    event.stopPropagation(); // Prevent selecting the property
    
    try {
      setLoading(true);
      
      await apiHelpers.post(`/properties/${propertyId}/set-primary`, {});
      
      // Update local state
      const updatedProperties = properties.map(property => ({
        ...property,
        is_primary_residence: property.id === propertyId
      }));
      
      setProperties(updatedProperties);
      setMessage('Primary residence updated successfully!');
      
      setLoading(false);
    } catch (err) {
      console.error('Error setting primary residence:', err);
      setError('Failed to update primary residence. Please try again later.');
      setLoading(false);
    }
  };

  // Edit property
  const handleEditProperty = (propertyId, event = {}) => {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    navigate(`/edit-property/${propertyId}`);
  };

  // Delete property
  const handleDeleteProperty = async (propertyId, event = {}) => {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        setLoading(true);
        
        await apiHelpers.delete(`/properties/${propertyId}`);
        
        setMessage('Property deleted successfully!');
        setShowDetailModal(false);
        
        // Refresh properties
        fetchProperties();
      } catch (err) {
        console.error('Error deleting property:', err);
        setError('Failed to delete property. Please try again later.');
        setLoading(false);
      }
    }
  };

  // Manage property function - navigate to dashboard with propertyId
  const handleManageProperty = (propertyId) => {
    localStorage.setItem('currentPropertyId', propertyId);
    navigate('/homie-dashboard');
  };

  // Calculate time until warranty expiration
  const getTimeToExpiration = (warrantyDate) => {
    if (!warrantyDate) return 'No warranty';
    
    const today = new Date();
    const expiration = new Date(warrantyDate);
    const diffTime = expiration - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return 'Expired';
    }
    
    if (diffDays === 1) {
      return '1 day left';
    }
    
    return `${diffDays} days left`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Get property type badge styling
  const getPropertyTypeBadge = (type) => {
    switch(type?.toLowerCase()) {
      case 'residential':
        return 'bg-sky-900 bg-opacity-30 text-sky-200';
      case 'commercial':
        return 'bg-blue-900 bg-opacity-30 text-blue-300';
      case 'industrial':
        return 'bg-purple-900 bg-opacity-30 text-purple-300';
      case 'vacation':
        return 'bg-orange-900 bg-opacity-30 text-orange-300';
      case 'land':
        return 'bg-green-900 bg-opacity-30 text-green-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Filter properties based on active filter
  const filteredProperties = activeFilter === 'all' 
    ? properties 
    : properties.filter(property => property.property_type?.toLowerCase() === activeFilter);
  
  // Calculate seasonal maintenance percentages
  const currentSeason = getCurrentSeason().toLowerCase(); // Convert to lowercase for state access
  const seasonalPercentage = seasonalMaintenanceStats[currentSeason].total > 0 
    ? Math.round((seasonalMaintenanceStats[currentSeason].completed / seasonalMaintenanceStats[currentSeason].total) * 100) 
    : 0;

  // Function to format image URLs correctly
  const getFormattedImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Ensure the URL starts with a slash if needed
    const formattedUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${API_BASE_URL}${formattedUrl}`;
  };

  return (
    <Navigation user={user}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Property Hub</h1>
            <p className="text-gray-400 mt-1">Manage all your properties in one place</p>
          </div>
          
          <Link 
            to="/add-property" 
            className="btn-secondary text-sm px-4 py-2 rounded-md flex items-center"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Property
          </Link>
        </div>
        
        {/* Error and success messages */}
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
        
        {/* Enhanced Property Dashboard Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Maintenance Card */}
          <div className="card p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Maintenance</p>
                <h3 className="text-xl font-bold mt-1">{stats.totalMaintenance} pending</h3>
              </div>
              <div className="p-3 rounded-full bg-orange-900 bg-opacity-30">
                <svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-3">Scheduled maintenance tasks across all properties</p>
            <Link to="/maintenance" className="text-sky-400 hover:text-sky-300 text-sm block mt-3">
              View All Maintenance
            </Link>
          </div>
          
          {/* Monthly Expenses Card */}
          <div className="card p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Monthly Expenses</p>
                <h3 className="text-xl font-bold mt-1">{formatCurrency(stats.totalExpenses)}</h3>
              </div>
              <div className="p-3 rounded-full bg-green-900 bg-opacity-30">
                <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-3">Total expenses for the current month</p>
            <Link to="/expenses" className="text-sky-400 hover:text-sky-300 text-sm block mt-3">
              Manage Expenses
            </Link>
          </div>
          
          {/* Warranty Expiration Card */}
          <div className="card p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Appliance Warranties</p>
                <h3 className="text-xl font-bold mt-1">{expiringAppliances.length} expiring soon</h3>
              </div>
              <div className="p-3 rounded-full bg-red-900 bg-opacity-30">
                <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-3">Appliances with warranties expiring in the next 90 days</p>
            <Link to="/appliances" className="text-sky-400 hover:text-sky-300 text-sm block mt-3">
              View Appliances
            </Link>
          </div>
        </div>

        {/* Additional Dashboard Statistics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Seasonal Maintenance Progress */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Seasonal Maintenance</h3>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm capitalize">{getCurrentSeason()} Checklist</span>
                <span className="text-sm font-medium">{seasonalMaintenanceStats[currentSeason].completed} of {seasonalMaintenanceStats[currentSeason].total} tasks</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-sky-400 h-2.5 rounded-full" 
                  style={{ width: `${seasonalPercentage}%` }}
                ></div>
              </div>
              <div className="mt-4">
                {Object.entries(seasonalMaintenanceStats)
                  .filter(([season]) => season !== currentSeason)
                  .map(([season, stats]) => (
                    <div key={season} className="flex justify-between text-xs text-gray-400 mb-2">
                      <span className="capitalize">{season}:</span>
                      <span>{stats.completed} of {stats.total} tasks completed</span>
                    </div>
                  ))}
              </div>
            </div>
            <Link to="/maintenance" className="text-sky-400 hover:text-sky-300 text-sm block mt-3">
              View Maintenance Checklists
            </Link>
          </div>
          
          {/* Upcoming Expenses */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Upcoming Expenses</h3>
            <div>
              {upcomingExpenses.length > 0 ? (
                <div className="divide-y divide-gray-700">
                  {upcomingExpenses.map(expense => (
                    <div key={expense.id} className="py-2 flex justify-between">
                      <div>
                        <div className="text-sm font-medium">{expense.title}</div>
                        <div className="text-xs text-gray-400">{expense.propertyAddress}</div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-sm font-medium">{formatCurrency(expense.amount)}</div>
                        <div className="text-xs text-gray-400">{formatDate(expense.date)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-4">
                  No upcoming expenses in the next 30 days
                </div>
              )}
            </div>
            <Link to="/expenses" className="text-sky-400 hover:text-sky-300 text-sm block mt-3">
              View Budget & Expenses
            </Link>
          </div>
        </div>
        {/* Property filters */}
        <div className="flex overflow-x-auto pb-2 mb-6">
          <button 
            className={`mr-2 px-4 py-1 rounded-full text-sm whitespace-nowrap ${activeFilter === 'all' ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setActiveFilter('all')}
          >
            All Properties
          </button>
          <button 
            className={`mr-2 px-4 py-1 rounded-full text-sm whitespace-nowrap ${activeFilter === 'residential' ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setActiveFilter('residential')}
          >
            Residential
          </button>
          <button 
            className={`mr-2 px-4 py-1 rounded-full text-sm whitespace-nowrap ${activeFilter === 'commercial' ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setActiveFilter('commercial')}
          >
            Commercial
          </button>
          <button 
            className={`mr-2 px-4 py-1 rounded-full text-sm whitespace-nowrap ${activeFilter === 'vacation' ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setActiveFilter('vacation')}
          >
            Vacation
          </button>
          <button 
            className={`mr-2 px-4 py-1 rounded-full text-sm whitespace-nowrap ${activeFilter === 'land' ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setActiveFilter('land')}
          >
            Land
          </button>
        </div>
        {/* Properties Grid */}
        {loading ? (
          <div className="text-center py-12">
            <svg className="animate-spin h-8 w-8 text-secondary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-3 text-gray-400">Loading properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="card p-6 text-center">
            <svg className="h-16 w-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <h3 className="text-lg font-medium mb-2">No Properties Found</h3>
            <p className="text-gray-400 mb-6">
              {activeFilter !== 'all' 
                ? `You don't have any ${activeFilter} properties yet.` 
                : "You haven't added any properties yet."}
            </p>
            <Link to="/add-property" className="btn-secondary px-4 py-2 rounded-md">
              <svg className="h-4 w-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Your First Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map(property => (
              <div 
                key={property.id} 
                className="card overflow-hidden hover:shadow-lg transition-all border border-gray-700 cursor-pointer"
                onClick={() => selectProperty(property)}
              >
                {/* Property image or fallback */}
                <div className="relative h-48 bg-gray-700 flex items-center justify-center">
                  {property.image_url ? (
                    <>
                      <img 
                        src={getFormattedImageUrl(property.image_url)}
                        alt={property.address}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          const fallbackSvg = document.createElement("div");
                          fallbackSvg.innerHTML = `<svg class="h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                          </svg>`;
                          e.target.parentNode.appendChild(fallbackSvg.firstChild);
                          e.target.parentNode.classList.add('flex', 'items-center', 'justify-center');
                        }}
                      />
                    </>
                  ) : (
                    <svg className="h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPropertyTypeBadge(property.property_type)}`}>
                      {property.property_type?.charAt(0).toUpperCase() + property.property_type?.slice(1) || 'Residential'}
                    </span>
                  </div>
                  {property.is_primary_residence && (
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-sky-400 text-white text-xs px-2 py-1 rounded-full">
                        Primary Residence
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Property details */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{property.address}</h3>
                  <p className="text-gray-400 text-sm mb-4">{property.city}, {property.state} {property.zip}</p>
                  
                  {/* Property details grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {property.bedrooms && (
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                        <span className="text-sm">{property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
                      </div>
                    )}
                    
                    {property.bathrooms && (
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                        <span className="text-sm">{property.bathrooms} {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</span>
                      </div>
                    )}
                    
                    {property.square_footage && (
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                        <span className="text-sm">{property.square_footage.toLocaleString()} sq ft</span>
                      </div>
                    )}
                    
                    {property.current_value && (
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span className="text-sm">{formatCurrency(property.current_value)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Property actions */}
                  <div className="flex justify-between items-center">
                    <div>
                      {!property.is_primary_residence ? (
                        <button 
                          onClick={(e) => setAsPrimaryResidence(property.id, e)}
                          className="text-sky-400 hover:text-sky-300 text-sm"
                        >
                          Set as Primary
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">Primary Residence</span>
                      )}
                    </div>
                    
                    <div>
                      <button 
                        className="text-blue-500 hover:text-blue-400 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/properties/${property.id}`);
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add property card */}
            <Link to="/add-property" className="card border border-dashed border-gray-600 flex flex-col items-center justify-center h-64 hover:border-sky-400 transition-colors">
              <div className="p-6 text-center">
                <div className="h-16 w-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Add New Property</h3>
                <p className="text-gray-400 text-sm">Add another home to your portfolio</p>
              </div>
            </Link>
          </div>
        )}
        
        {/* Property Details Modal */}
        {showDetailModal && selectedProperty && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDetailModal(false)}></div>
              <div className="card w-full max-w-4xl p-6 relative">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">{selectedProperty.address}</h2>
                  <button 
                    className="text-gray-400 hover:text-gray-300 rounded-full p-1"
                    onClick={() => setShowDetailModal(false)}
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="flex flex-col md:grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <div className="h-48 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                      {selectedProperty.image_url ? (
                        <img 
                          src={getFormattedImageUrl(selectedProperty.image_url)}
                          alt={selectedProperty.address}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            const fallbackSvg = document.createElement("div");
                            fallbackSvg.innerHTML = `<svg class="h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>`;
                            e.target.parentNode.appendChild(fallbackSvg.firstChild);
                            e.target.parentNode.classList.add('flex', 'items-center', 'justify-center');
                          }}
                        />
                      ) : (
                        <svg className="h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                      )}
                    </div>
                    
                    <div className="mt-4 flex flex-col space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Type</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPropertyTypeBadge(selectedProperty.property_type)}`}>
                          {selectedProperty.property_type?.charAt(0).toUpperCase() + selectedProperty.property_type?.slice(1) || 'Residential'}
                        </span>
                      </div>
                      
                      {selectedProperty.is_primary_residence && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Primary</span>
                          <span className="text-sky-400">Yes</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Status</span>
                        <span className="text-sky-400">{selectedProperty.status?.charAt(0).toUpperCase() + selectedProperty.status?.slice(1) || 'Active'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold mb-3">{selectedProperty.address}</h3>
                    <p className="text-gray-400 mb-4">{selectedProperty.city}, {selectedProperty.state} {selectedProperty.zip}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {selectedProperty.bedrooms !== undefined && (
                        <div>
                          <p className="text-gray-400 text-sm">Bedrooms</p>
                          <p className="font-medium">{selectedProperty.bedrooms}</p>
                        </div>
                      )}
                      
                      {selectedProperty.bathrooms !== undefined && (
                        <div>
                          <p className="text-gray-400 text-sm">Bathrooms</p>
                          <p className="font-medium">{selectedProperty.bathrooms}</p>
                        </div>
                      )}
                      
                      {selectedProperty.square_footage && (
                        <div>
                          <p className="text-gray-400 text-sm">Square Footage</p>
                          <p className="font-medium">{selectedProperty.square_footage.toLocaleString()} sqft</p>
                        </div>
                      )}
                      
                      {selectedProperty.purchase_price && (
                        <div>
                          <p className="text-gray-400 text-sm">Purchase Price</p>
                          <p className="font-medium">{formatCurrency(selectedProperty.purchase_price)}</p>
                        </div>
                      )}
                      
                      {selectedProperty.current_value && (
                        <div>
                          <p className="text-gray-400 text-sm">Current Value</p>
                          <p className="font-medium">{formatCurrency(selectedProperty.current_value)}</p>
                        </div>
                      )}
                      
                      {selectedProperty.purchase_date && (
                        <div>
                          <p className="text-gray-400 text-sm">Purchase Date</p>
                          <p className="font-medium">{formatDate(selectedProperty.purchase_date)}</p>
                        </div>
                      )}
                    </div>
                    
                    {selectedProperty.description && (
                      <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                        <p className="text-gray-400 text-sm mb-1">Description</p>
                        <p className="text-sm">{selectedProperty.description}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between mt-6 pt-6 border-t border-gray-700">
                  <div>
                    <button 
                      className="text-red-500 hover:text-red-400 px-4 py-2 rounded-md"
                      onClick={() => handleDeleteProperty(selectedProperty.id)}
                    >
                      Delete Property
                    </button>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button 
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                      onClick={() => setShowDetailModal(false)}
                    >
                      Close
                    </button>
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                      onClick={() => handleEditProperty(selectedProperty.id)}
                    >
                      Edit Property
                    </button>
                    <button 
                      className="btn-secondary px-4 py-2 rounded-md"
                      onClick={() => handleManageProperty(selectedProperty.id)}
                    >
                      Manage Property
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Expiring Warranties Section */}
        {expiringAppliances.length > 0 && (
          <div className="card p-6 mt-8">
            <h3 className="text-lg font-semibold mb-4">Expiring Warranties</h3>
            <div className="divide-y divide-gray-700">
              {expiringAppliances.slice(0, 3).map(appliance => (
                <div key={appliance.id} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">{appliance.name}</div>
                    <div className="text-xs text-gray-400">{appliance.propertyAddress}</div>
                  </div>
                  <div className="text-orange-500 text-sm">
                    { getTimeToExpiration(appliance.warranty_expiration)}
                  </div>
                </div>
              ))}
              {expiringAppliances.length > 3 && (
                <div className="py-3 text-center">
                  <Link to="/appliances" className="text-sky-400 hover:text-sky-300 text-sm">
                    View all {expiringAppliances.length} expiring warranties
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Navigation>
  );
};

export default PropertyHub;