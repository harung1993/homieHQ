// ResendVerificationEmail.js - Component to handle resending verification emails
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiHelpers } from '../../services/api'; // Changed to apiHelpers

const ResendVerificationEmail = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      // Call API to resend verification email - using apiHelpers instead of api
      const response = await apiHelpers.post('auth/resend-verification', { email });
      
      setMessage(response.message || 'If your email is registered and not verified, a new verification link has been sent.');
      setLoading(false);
      
      // Clear email field
      setEmail('');
      
      // Navigate back to login after a delay
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Please check your email for the verification link.' } 
        });
      }, 3000);
    } catch (err) {
      setLoading(false);
      console.error('Error resending verification:', err);
      
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('An error occurred. Please try again later.');
      }
    }
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
        
        <h2 className="text-2xl font-semibold mb-6 text-center">Resend Verification Email</h2>
        
        {error && (
          <div className="bg-red-900 bg-opacity-30 text-red-400 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-green-900 bg-opacity-30 text-green-400 p-3 rounded-md mb-4">
            {message}
          </div>
        )}
        
        <p className="text-gray-400 mb-6 text-center">
          Enter your email address and we'll send you a new verification link.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              className="btn-primary w-full py-3 rounded-md"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              <Link to="/login" className="text-secondary hover:text-secondary-light">
                Back to Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResendVerificationEmail;