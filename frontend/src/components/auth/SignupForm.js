import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../services/api'; // Import base URL

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use direct axios with full URL for debugging
      const fullUrl = `${API_BASE_URL}/api/auth/register`;
      console.log("Attempting to register at:", fullUrl);
      console.log("Form data:", formData);
      
      const response = await axios.post(fullUrl, formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setLoading(false);
      console.log("Registration successful:", response.data);
      
      // If registration is successful, redirect to login
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err) {
      setLoading(false);
      console.error('Registration error:', err);
      
      if (err.message === 'Network Error') {
        setError('Cannot connect to the server. Please check if the backend server is running and properly configured for CORS.');
      } else if (err.response) {
        // The server responded with a status code outside the 2xx range
        if (err.response.data && err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError(`Server error: ${err.response.status} ${err.response.statusText}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please try again later.');
      } else {
        // Something else happened while setting up the request
        setError('An error occurred during registration. Please try again.');
      }
    }
  };

  // For development purposes
  const handleDevelopmentSignup = () => {
    setLoading(true);
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
      navigate('/login', { state: { message: 'Development registration successful! Please login.' } });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <div className="text-3xl font-bold">
            <span className="homie-text">Homie</span>
            <span className="accent-text">HQ</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold mb-6 text-center">Create an Account</h2>
        
        {error && (
          <div className="bg-red-900 bg-opacity-30 text-red-400 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="form-label">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                className="form-input"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="last_name" className="form-label">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                className="form-input"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mt-4">
            <label htmlFor="phone" className="form-label">Phone Number (optional)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          
          <div className="mt-4">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
            <p className="text-xs text-gray-400 mt-1">Password must be at least 6 characters</p>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              className="btn-primary w-full py-3 rounded-md"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>
        
        {/* For development/debugging purposes */}
        <div className="mt-4 text-center">
          <button
            type="button"
            className="text-xs text-gray-400 underline"
            onClick={handleDevelopmentSignup}
          >
            Use Development Mode
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-secondary hover:text-secondary-light">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;