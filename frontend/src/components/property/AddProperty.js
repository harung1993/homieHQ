import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiHelpers } from '../../services/api'; // Use apiHelpers instead of direct axios

const SimpleAddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Get form data directly from the form
    const formData = {
      address: e.target.address.value,
      city: e.target.city.value,
      state: e.target.state.value,
      zip: e.target.zip.value,
      property_type: e.target.property_type.value,
      status: 'active',
      // Add string values for other fields
      description: e.target.description.value || '',
      is_primary_residence: e.target.is_primary_residence.checked,
      // Add the subject field as string
      subject: 'Property Addition'
    };

    // Add numerical fields if they have values
    if (e.target.bedrooms.value) {
      formData.bedrooms = parseInt(e.target.bedrooms.value, 10);
    }
    if (e.target.bathrooms.value) {
      formData.bathrooms = parseFloat(e.target.bathrooms.value);
    }
    if (e.target.square_footage.value) {
      formData.square_footage = parseInt(e.target.square_footage.value, 10);
    }
    if (e.target.purchase_price.value) {
      formData.purchase_price = parseFloat(e.target.purchase_price.value);
    }
    if (e.target.current_value.value) {
      formData.current_value = parseFloat(e.target.current_value.value);
    }

    console.log('Submitting property data:', formData);

    try {
      // Use apiHelpers instead of direct axios call - it handles JWT properly
      await apiHelpers.post('properties', formData);

      console.log('Success! Property added');
      navigate('/properties', { state: { message: 'Property added successfully!' } });
    } catch (err) {
      setLoading(false);
      console.error('Error:', err);
      
      if (err.response && err.response.data) {
        console.error('Error data:', err.response.data);
        if (err.response.data.msg) {
          setError(err.response.data.msg);
        } else if (err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError('An error occurred. Please try again.');
        }
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add Property</h1>
      
      {error && (
        <div className="bg-red-900 bg-opacity-30 text-red-400 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Required Fields */}
          <div>
            <label className="form-label">Address*</label>
            <input 
              name="address" 
              className="form-input" 
              required 
            />
          </div>
          <div>
            <label className="form-label">City*</label>
            <input 
              name="city" 
              className="form-input" 
              required 
            />
          </div>
          <div>
            <label className="form-label">State*</label>
            <input 
              name="state" 
              className="form-input" 
              required 
            />
          </div>
          <div>
            <label className="form-label">ZIP*</label>
            <input 
              name="zip" 
              className="form-input" 
              required 
            />
          </div>
          
          {/* Property Type */}
          <div>
            <label className="form-label">Property Type*</label>
            <select name="property_type" className="form-input" required>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="vacation">Vacation</option>
              <option value="land">Land</option>
            </select>
          </div>
          
          {/* Optional Fields */}
          <div>
            <label className="form-label">Bedrooms</label>
            <input type="number" name="bedrooms" min="0" className="form-input" />
          </div>
          <div>
            <label className="form-label">Bathrooms</label>
            <input type="number" name="bathrooms" min="0" step="0.5" className="form-input" />
          </div>
          <div>
            <label className="form-label">Square Footage</label>
            <input type="number" name="square_footage" min="0" className="form-input" />
          </div>
          <div>
            <label className="form-label">Purchase Price</label>
            <input type="number" name="purchase_price" min="0" step="0.01" className="form-input" />
          </div>
          <div>
            <label className="form-label">Current Value</label>
            <input type="number" name="current_value" min="0" step="0.01" className="form-input" />
          </div>
          
          {/* Description */}
          <div className="md:col-span-2">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-input" rows="3"></textarea>
          </div>
          
          {/* Primary Residence Checkbox */}
          <div className="md:col-span-2">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                name="is_primary_residence" 
                className="h-4 w-4 text-sky-400 rounded bg-gray-700 border-gray-600" 
              />
              <span className="ml-2 text-gray-300">Set as primary residence</span>
            </label>
          </div>
        </div>
        
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/properties')}
            className="btn-secondary px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-4 py-2 rounded-md"
          >
            {loading ? 'Adding...' : 'Add Property'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SimpleAddProperty;