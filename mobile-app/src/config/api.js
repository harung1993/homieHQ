// API Configuration for PropertyPal Mobile App

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // IMPORTANT: Update this with your machine's IP address
  // Find it using:
  //   Mac/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1
  //   Windows: ipconfig
  const LOCAL_IP = '192.168.68.119'; // TODO: Update with your machine's IP address

  // Backend port when running with Docker (from docker-compose.yml)
  const DOCKER_PORT = '5008';

  // Backend port when running directly (without Docker)
  const DIRECT_PORT = '5000';

  // Set this based on how you're running the backend
  const BACKEND_PORT = DOCKER_PORT; // Change to DIRECT_PORT if not using Docker

  // Check if running in Expo Go (on device/simulator)
  if (__DEV__) {
    // For iOS Simulator, use localhost
    // For Android Emulator, use 10.0.2.2
    // For physical device, use your machine's local IP

    // You can uncomment the appropriate one based on your testing device:

    // return `http://localhost:${BACKEND_PORT}/api`;     // iOS Simulator
    // return `http://10.0.2.2:${BACKEND_PORT}/api`;      // Android Emulator
    return `http://${LOCAL_IP}:${BACKEND_PORT}/api`;      // Physical Device (update LOCAL_IP above)
  }

  // Production URL (when deployed)
  return 'https://your-production-api.com/api';
};

export const API_BASE_URL = getApiBaseUrl();

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },

  // Properties endpoints
  PROPERTIES: {
    LIST: '/properties',
    DETAIL: (id) => `/properties/${id}`,
    CREATE: '/properties',
    UPDATE: (id) => `/properties/${id}`,
    DELETE: (id) => `/properties/${id}`,
    PHOTOS: (id) => `/properties/${id}/photos`,
  },

  // Maintenance endpoints
  MAINTENANCE: {
    LIST: '/maintenance',
    DETAIL: (id) => `/maintenance/${id}`,
    CREATE: '/maintenance',
    UPDATE: (id) => `/maintenance/${id}`,
    DELETE: (id) => `/maintenance/${id}`,
  },

  // Finances endpoints
  FINANCES: {
    TRANSACTIONS: '/finances/transactions',
    SUMMARY: '/finances/summary',
    INCOME: '/finances/income',
    EXPENSES: '/finances/expenses',
  },

  // Tenants endpoints
  TENANTS: {
    LIST: '/tenants',
    DETAIL: (id) => `/tenants/${id}`,
    CREATE: '/tenants',
    UPDATE: (id) => `/tenants/${id}`,
    DELETE: (id) => `/tenants/${id}`,
  },

  // Settings endpoints
  SETTINGS: {
    GET: '/settings',
    UPDATE: '/settings',
  },

  // Documents endpoints
  DOCUMENTS: {
    LIST: '/documents',
    UPLOAD: '/documents',
    DETAIL: (id) => `/documents/${id}`,
    UPDATE: (id) => `/documents/${id}`,
    DELETE: (id) => `/documents/${id}`,
    DOWNLOAD: (id) => `/documents/${id}/download`,
    BY_PROPERTY: (propertyId) => `/documents?property_id=${propertyId}`,
    BY_TENANT: (tenantId) => `/documents?tenant_id=${tenantId}`,
    BY_APPLIANCE: (applianceId) => `/documents?appliance_id=${applianceId}`,
    BY_CATEGORY: (category) => `/documents/category/${category}`,
    EXPIRING: '/documents/expiring',
    SEARCH: (query) => `/documents/search?q=${query}`,
  },

  // Property Photos endpoints
  PROPERTY_PHOTOS: {
    UPLOAD: '/property_photos',
    LIST: (propertyId) => `/property_photos/${propertyId}`,
    DELETE: (id) => `/property_photos/${id}`,
  },

  // Appliances endpoints
  APPLIANCES: {
    LIST: '/appliances',
    CREATE: '/appliances',
    DETAIL: (id) => `/appliances/${id}`,
    UPDATE: (id) => `/appliances/${id}`,
    DELETE: (id) => `/appliances/${id}`,
    BY_PROPERTY: (propertyId) => `/appliances?property_id=${propertyId}`,
    EXPIRING_WARRANTIES: '/appliances?warranty_expiring=true',
  },

  // Projects endpoints
  PROJECTS: {
    LIST: '/projects',
    CREATE: '/projects',
    DETAIL: (id) => `/projects/${id}`,
    UPDATE: (id) => `/projects/${id}`,
    DELETE: (id) => `/projects/${id}`,
    BY_PROPERTY: (propertyId) => `/projects?property_id=${propertyId}`,
    BY_STATUS: (status) => `/projects?status=${status}`,
  },

  // Seasonal Maintenance Checklist endpoints
  SEASONAL: {
    GET_CHECKLIST: (season) => `/maintenance/checklist/${season}`,
    TOGGLE_ITEM: (itemId) => `/maintenance/checklist/${itemId}/toggle`,
    UPDATE_ITEM: (itemId) => `/maintenance/checklist/${itemId}`,
    DELETE_ITEM: (itemId) => `/maintenance/checklist/${itemId}`,
    RESET_CHECKLIST: (season) => `/maintenance/checklist/${season}/reset`,
  },
};

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000;

// Storage keys for AsyncStorage
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@propertypal:access_token',
  REFRESH_TOKEN: '@propertypal:refresh_token',
  USER_DATA: '@propertypal:user_data',
  API_URL: '@propertypal:api_url', // For custom API URL setting
};
