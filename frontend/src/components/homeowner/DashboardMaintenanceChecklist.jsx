import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiHelpers } from '../../services/api';

/**
 * A compact seasonal checklist component for the dashboard
 */
const DashboardMaintenanceChecklist = ({ propertyId }) => {
  const [checklist, setChecklist] = useState({
    title: '',
    items: [],
    stats: {
      totalItems: 0,
      completedItems: 0,
      completionPercentage: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Get current season
  const getCurrentSeason = () => {
    const now = new Date();
    const month = now.getMonth();
    
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  };
  
  // Fetch current seasonal checklist
  useEffect(() => {
    if (propertyId) {
      fetchChecklist(propertyId);
    }
  }, [propertyId]);
  
  // Fetch checklist from API
  const fetchChecklist = async (propertyId) => {
    setLoading(true);
    console.log(`Fetching checklist for property: ${propertyId}`);
    
    try {
      const season = getCurrentSeason();
      
      // Get checklist items for the current season
      const checklistResponse = await apiHelpers.get(
        `maintenance/checklist/${season}`,
        { property_id: propertyId }
      );
      
      console.log('Checklist API response:', checklistResponse);
      
      // Process the data
      let items = [];
      
      // Check if response data is an array (directly from API) or has an items property
      if (Array.isArray(checklistResponse)) {
        items = checklistResponse;
      } else if (checklistResponse && Array.isArray(checklistResponse.items)) {
        items = checklistResponse.items;
      }
      
      // Calculate statistics
      const totalItems = items.length;
      const completedItems = items.filter(item => item.is_completed).length;
      const completionPercentage = totalItems > 0 
        ? Math.round((completedItems / totalItems) * 100) 
        : 0;
      
      setChecklist({
        title: `${season} Checklist`,
        items,
        stats: { 
          totalItems,
          completedItems,
          completionPercentage
        }
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching seasonal checklist:', err);
      console.error('Error details:', err.response ? err.response.data : 'No response data');
      
      // Don't set mock data - just show the error state
      setChecklist({
        title: `${getCurrentSeason()} Checklist`,
        items: [],
        stats: {
          totalItems: 0,
          completedItems: 0,
          completionPercentage: 0
        }
      });
      
      setError('Failed to load checklist data');
      setLoading(false);
    }
  };
  
  // Toggle item completion status
  const toggleItemCompletion = async (item, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Optimistically update UI
      const updatedItems = checklist.items.map(i => 
        i.id === item.id ? { ...i, is_completed: !i.is_completed } : i
      );
      
      const completedItems = updatedItems.filter(i => i.is_completed).length;
      const totalItems = updatedItems.length;
      const completionPercentage = totalItems > 0 
        ? Math.round((completedItems / totalItems) * 100) 
        : 0;
        
      setChecklist({
        ...checklist,
        items: updatedItems,
        stats: {
          totalItems,
          completedItems,
          completionPercentage
        }
      });
      
      // Call API to update the item
      await apiHelpers.put(
        `maintenance/checklist/${item.id}/toggle`,
        {}
      );
      
      console.log(`Successfully toggled item ${item.id}`);
    } catch (err) {
      console.error('Error toggling item completion:', err);
      console.error('Error details:', err.response ? err.response.data : 'No response data');
      
      // Revert to original state by fetching data again
      fetchChecklist(propertyId);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm">Seasonal Maintenance</p>
          <h3 className="text-xl font-bold mt-1">{checklist.title}</h3>
        </div>
        <div className="relative h-14 w-14">
          <svg className="progress-ring" width="56" height="56">
            <circle className="text-gray-700" strokeWidth="4" stroke="currentColor" fill="transparent" r="24" cx="28" cy="28"></circle>
            <circle 
              className="text-teal-500" 
              strokeWidth="4" 
              strokeDasharray="150.72" 
              strokeDashoffset={150.72 - (150.72 * checklist.stats.completionPercentage / 100)} 
              stroke="currentColor" 
              fill="transparent" 
              r="24" 
              cx="28" 
              cy="28"
            ></circle>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
            {checklist.stats.completionPercentage}%
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm">
        <span className="text-gray-400">
          {checklist.stats.completedItems} of {checklist.stats.totalItems} tasks completed
        </span>
        
        {loading ? (
          <div className="mt-4 flex justify-center">
            <svg className="animate-spin h-5 w-5 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : error ? (
          <div className="mt-4">
            <p className="text-red-400">{error}</p>
            <Link to="/maintenance" className="block mt-2 text-teal-500 hover:text-teal-400">
              Set up your checklist
            </Link>
          </div>
        ) : checklist.items.length === 0 ? (
          <div className="mt-4">
            <p className="text-gray-400">No checklist items found.</p>
            <Link to="/maintenance" className="block mt-2 text-teal-500 hover:text-teal-400">
              Set up your checklist
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {/* Show a few checklist items */}
            {checklist.items.slice(0, 3).map(item => (
              <div key={item.id} className="flex items-center" onClick={(e) => toggleItemCompletion(item, e)}>
                <input 
                  type="checkbox" 
                  checked={item.is_completed}
                  onChange={(e) => toggleItemCompletion(item, e)}
                  className="form-checkbox h-4 w-4 text-teal-500 rounded bg-gray-700 border-gray-600" 
                />
                <span className={`ml-2 ${item.is_completed ? 'text-gray-400 line-through' : 'text-gray-300'}`}>
                  {item.task || item.title}
                </span>
              </div>
            ))}
            
            {/* Show view all link */}
            <Link to="/maintenance" className="block mt-2 text-teal-500 hover:text-teal-400">
              View full checklist
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardMaintenanceChecklist;