// Updated LoginForm.js with prominent resend verification option and no dev mode button
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../services/api';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if there's a message from the signup page or password reset
    if (location.state && location.state.message) {
      setMessage(location.state.message);
    }
  }, [location]);

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
    setMessage('');

    try {
      // Use the API service instead of direct axios calls
      const response = await api.post('/auth/login', formData);
      
      setLoading(false);
      
      if (response && response.access_token) {
        // Store the tokens in localStorage
        localStorage.setItem('accessToken', response.access_token);
        
        if (response.refresh_token) {
          localStorage.setItem('refreshToken', response.refresh_token);
        }
        
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Check if email is verified (if your API includes this field)
          if (response.user.email_verified === false) {
            setError('Please verify your email address before logging in.');
            return;
          }
        }
        
        // Redirect to landing route which will determine where to go next
        navigate('/landing');
      } else {
        setError('Invalid response from server. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      console.error('Login error:', err);
      
      // Check if the error indicates email verification is needed
      const errorMessage = err.response?.data?.error || '';
      const needsVerification = 
        errorMessage.toLowerCase().includes('verify') ||
        errorMessage.toLowerCase().includes('verification') ||
        errorMessage.toLowerCase().includes('verified');
      
      if (needsVerification) {
        setError('Please verify your email address before logging in.');
      } else if (err.message === 'Network Error') {
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
        setError('An error occurred during login. Please try again.');
      }
    }
  };

  // Handle resend verification email
  const handleResendVerification = () => {
    navigate('/resend-verification', {
      state: { email: formData.email }
    });
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
        
        <h2 className="text-2xl font-semibold mb-6 text-center">Log In to Your Account</h2>
        
        {error && (
          <div className="bg-red-900 bg-opacity-30 text-red-400 p-3 rounded-md mb-4">
            {error}
            {error.toLowerCase().includes('verify') && (
              <div className="mt-2">
                <button
                  type="button"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-md text-sm"
                  onClick={handleResendVerification}
                >
                  Resend verification email
                </button>
              </div>
            )}
          </div>
        )}
        
        {message && (
          <div className="bg-green-900 bg-opacity-30 text-green-400 p-3 rounded-md mb-4">
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div>
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
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            {/* Add Forgot Password link */}
            <div className="flex justify-end mt-2">
              <Link to="/forgot-password" className="text-sm text-secondary hover:text-secondary-light">
                Forgot Password?
              </Link>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              className="btn-primary w-full py-3 rounded-md"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-secondary hover:text-secondary-light">
              Sign up
            </Link>
          </p>
        </div>
        
        {/* Only show resend option when there's a verification error */}
        {error && error.toLowerCase().includes('verify') && (
          <div className="mt-4 text-center border-t border-gray-700 pt-4">
            <p className="text-gray-400 text-sm">
              Didn't receive verification email?{' '}
              <button
                type="button"
                className="text-secondary hover:text-secondary-light text-sm"
                onClick={handleResendVerification}
              >
                Resend verification
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;