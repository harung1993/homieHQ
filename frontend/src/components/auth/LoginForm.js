// Updated LoginForm.js with prominent resend verification option and no dev mode button
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { apiHelpers } from '../../services/api'; // Changed to apiHelpers

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
      // Use apiHelpers instead of direct api call
      const response = await apiHelpers.post('auth/login', formData);
      
      setLoading(false);
      
      if (response && response.access_token) {
        // Store the tokens in localStorage
        localStorage.setItem('accessToken', response.access_token);

        if (response.refresh_token) {
          localStorage.setItem('refreshToken', response.refresh_token);
        }

        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));

          // Check if this is a demo account and store login time
          const isDemoAccount = response.user.email &&
                               response.user.email.startsWith('demo') &&
                               response.user.email.endsWith('@propertypal.com');

          if (isDemoAccount) {
            localStorage.setItem('demoLoginTime', Date.now().toString());
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
            <span className="property-text">Property</span>Pal
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
                  className="bg-sky-400 hover:bg-sky-500 text-white px-3 py-1 rounded-md text-sm"
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

        {/* Demo Accounts Section */}
        <div className="mt-6 border-t border-gray-700 pt-6">
          <div className="bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Try Demo Accounts
            </h3>
            <p className="text-gray-400 text-sm mb-3">
              Test PropertyPal with pre-loaded demo accounts. Sessions expire after 10 minutes.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-800 bg-opacity-50 p-2 rounded">
                <div className="text-gray-400">demo1@propertypal.com</div>
                <div className="text-gray-500">Password: Demo123!</div>
              </div>
              <div className="bg-gray-800 bg-opacity-50 p-2 rounded">
                <div className="text-gray-400">demo2@propertypal.com</div>
                <div className="text-gray-500">Password: Demo123!</div>
              </div>
              <div className="bg-gray-800 bg-opacity-50 p-2 rounded">
                <div className="text-gray-400">demo3@propertypal.com</div>
                <div className="text-gray-500">Password: Demo123!</div>
              </div>
              <div className="bg-gray-800 bg-opacity-50 p-2 rounded">
                <div className="text-gray-400">demo4@propertypal.com</div>
                <div className="text-gray-500">Password: Demo123!</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;