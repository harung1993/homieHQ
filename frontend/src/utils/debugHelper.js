// Add this to utils/debugHelper.js or create this file

/**
 * Enhanced logging utility for debugging API calls
 */
const debugLogger = {
    /**
     * Log the start of an API request
     * @param {string} endpoint - The API endpoint being called
     * @param {Object} params - Request parameters (optional)
     */
    apiRequest: (endpoint, params = {}) => {
      const timestamp = new Date().toISOString();
      console.group(`🔷 API Request: ${endpoint} [${timestamp}]`);
      console.log('Endpoint:', endpoint);
      if (Object.keys(params).length > 0) {
        console.log('Parameters:', params);
      }
      console.groupEnd();
    },
  
    /**
     * Log a successful API response
     * @param {string} endpoint - The API endpoint that was called
     * @param {Object} data - The response data
     */
    apiSuccess: (endpoint, data) => {
      const timestamp = new Date().toISOString();
      console.group(`✅ API Success: ${endpoint} [${timestamp}]`);
      console.log('Endpoint:', endpoint);
      console.log('Response:', data);
      
      // Additional checks for array data
      if (Array.isArray(data)) {
        console.log('Array length:', data.length);
        if (data.length > 0) {
          console.log('First item:', data[0]);
          console.log('Data structure:', Object.keys(data[0]));
        }
      }
      console.groupEnd();
    },
  
    /**
     * Log an API error
     * @param {string} endpoint - The API endpoint that was called
     * @param {Error} error - The error object
     */
    apiError: (endpoint, error) => {
      const timestamp = new Date().toISOString();
      console.group(`❌ API Error: ${endpoint} [${timestamp}]`);
      console.log('Endpoint:', endpoint);
      console.error('Error:', error);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      console.groupEnd();
    },
  
    /**
     * Log the state of a component
     * @param {string} componentName - Name of the component
     * @param {Object} state - Current component state
     */
    componentState: (componentName, state) => {
      const timestamp = new Date().toISOString();
      console.group(`🔷 Component State: ${componentName} [${timestamp}]`);
      Object.keys(state).forEach(key => {
        const value = state[key];
        if (Array.isArray(value)) {
          console.log(`${key} (Array, length: ${value.length})`);
        } else if (typeof value === 'object' && value !== null) {
          console.log(`${key} (Object, keys: ${Object.keys(value).join(', ')})`);
        } else {
          console.log(`${key}:`, value);
        }
      });
      console.groupEnd();
    }
  };
  
  export default debugLogger;