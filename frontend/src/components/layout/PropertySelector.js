import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import propertyService from '../../services/propertyService';
import { apiHelpers } from '../../services/api';

const PropertySelector = ({ currentProperty, onSelectProperty }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);

  // Fetch user properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        
        if (!token) return;
        
        const data = await apiHelpers.get('properties/');
        
        setProperties(data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectProperty = (property) => {
    onSelectProperty(property);
    setIsOpen(false);
  };

  // Add this function to handle setting a property as primary
  const handleSetAsPrimary = async (propertyId, event) => {
    // Prevent the click from also selecting the property
    event.stopPropagation();
    
    try {
      setLoading(true);
      await propertyService.setAsPrimaryResidence(propertyId);
      
      // Update local state to reflect the change
      const updatedProperties = properties.map(property => ({
        ...property,
        is_primary_residence: property.id === propertyId
      }));
      
      setProperties(updatedProperties);
      
      // Update current property if it's the one being set as primary
      if (currentProperty && currentProperty.id === propertyId) {
        onSelectProperty({
          ...currentProperty,
          is_primary_residence: true
        });
      }
      
      setMessage('Property set as primary residence successfully!');
      setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
      
      setLoading(false);
    } catch (error) {
      console.error('Error setting property as primary residence:', error);
      setError('Failed to set property as primary residence. Please try again later.');
      setTimeout(() => setError(''), 3000); // Clear error after 3 seconds
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {message && (
        <div className="absolute -top-12 right-0 bg-green-900 bg-opacity-30 text-green-400 p-2 rounded-md text-sm">
          {message}
        </div>
      )}
      
      {error && (
        <div className="absolute -top-12 right-0 bg-red-900 bg-opacity-30 text-red-400 p-2 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div 
        className="flex items-center p-3 bg-sky-900 bg-opacity-20 rounded-lg cursor-pointer"
        onClick={toggleDropdown}
      >
        <svg className="h-6 w-6 text-sky-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
        <div>
          <span className="text-gray-400 text-xs">Current Home</span>
          <h3 className="text-md font-semibold">
            {currentProperty ? currentProperty.address : 'No property added yet'}
            {currentProperty && currentProperty.is_primary_residence && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-sky-900 text-sky-200 bg-opacity-30">
                Primary
              </span>
            )}
          </h3>
          <span className="text-xs text-gray-400">
            {currentProperty ? (currentProperty.city && currentProperty.state ? `${currentProperty.city}, ${currentProperty.state}` : currentProperty.property_type) : 'Add your first property'}
          </span>
        </div>
        <button className="ml-3 p-1 rounded-full hover:bg-gray-700">
          <svg className={`h-4 w-4 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-card-bg rounded-md shadow-lg z-50 overflow-hidden">
          <div className="py-2">
            {loading ? (
              <div className="px-4 py-2 text-sm text-gray-400">Loading properties...</div>
            ) : properties.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-400">No properties available</div>
            ) : (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">
                  Your Properties
                </div>
                
                {properties.map(property => (
                  <div key={property.id} className="relative group">
                    <button 
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${currentProperty && property.id === currentProperty.id ? 'bg-sky-900 bg-opacity-20 text-sky-300' : 'text-gray-300'}`}
                      onClick={() => handleSelectProperty(property)}
                    >
                      <div className="font-medium">
                        {property.address}
                        {property.is_primary_residence && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-sky-900 text-sky-200 bg-opacity-30">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">{property.city}, {property.state}</div>
                    </button>
                    
                    {/* Set as Primary button - only show for non-primary properties */}
                    {!property.is_primary_residence && (
                      <button
                        className="absolute right-2 top-2 p-1 rounded-full bg-sky-900 bg-opacity-30 text-sky-300 hover:bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleSetAsPrimary(property.id, e)}
                        title="Set as primary residence"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                
                <div className="border-t border-gray-700 mt-2 pt-2">
                  <Link
                    to="/add-property"
                    className="block px-4 py-2 text-sm text-sky-400 hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Add New Property
                    </div>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertySelector;