import axios from 'axios';

// Add proper protocol to URLs without one
const addProtocol = (url) => {
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    return `http://${url}`;
  }
  return url;
};

// Get runtime config from global `window` object
const runtimeApiUrl = window?.REACT_APP_API_URL || '';

// Convert Docker service name 'web' to localhost for browser environment
let rawBaseUrl;
if (runtimeApiUrl.includes('web:')) {
  // Replace 'web' hostname with 'localhost' for browser environment
  rawBaseUrl = runtimeApiUrl.replace('web:', 'localhost:');
  console.log('Converted Docker service name to localhost:', rawBaseUrl);
} else {
  rawBaseUrl = runtimeApiUrl || 'http://localhost:5008/api';
}

// Normalize and clean base URL
export const API_BASE_URL = rawBaseUrl.endsWith('/api')
  ? rawBaseUrl.slice(0, -4)
  : rawBaseUrl;

const BASE_URL = addProtocol(rawBaseUrl);

console.log('API Base URL:', BASE_URL);


// Create an axios instance with default settings
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in cross-origin requests if needed
  timeout: 30000, // 30 second timeout
});

// Helper function to ensure consistent trailing slashes
const normalizeUrl = (url) => {
  // Add trailing slash if not present and not empty
  if (url && !url.endsWith('/') && !url.includes('?')) {
    return `${url}/`;
  }
  return url;
};

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    // Normalize URL to include trailing slash
    config.url = normalizeUrl(config.url);
    
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Ensure all IDs in the request data are strings when needed for JWT
    if (config.method === 'post' && config.url.includes('auth/login')) {
     
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.message, error.response?.status);
    
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper methods for common operations
const apiHelpers = {
  get: (url, params = {}) => {
    return api.get(url, { params })
      .then(response => response.data);
  },
  
  post: (url, data = {}) => {
    // Log URL for debugging
    console.log('API POST request to:', url);
    
    return api.post(url, data)
      .then(response => response.data);
  },
  
  put: (url, data = {}) => {
    return api.put(url, data)
      .then(response => response.data);
  },
  
  delete: (url) => {
    return api.delete(url)
      .then(response => response.data);
  },
  
  upload: (url, formData) => {
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => response.data);
  },
  
  download: (url) => {
    return api.get(url, {
      responseType: 'blob'
    }).then(response => response.data);
  }
};

export { api, apiHelpers };
export default apiHelpers;