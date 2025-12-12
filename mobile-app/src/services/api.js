// API Service for PropertyPal Mobile App
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, REQUEST_TIMEOUT, STORAGE_KEYS } from '../config/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Get custom API URL if set
    const customApiUrl = await AsyncStorage.getItem(STORAGE_KEYS.API_URL);
    if (customApiUrl) {
      config.baseURL = customApiUrl;
    }

    console.log('[API Service] Request to:', config.baseURL + config.url);

    // Add auth token to requests
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );

          const { access_token } = response.data;

          // Save new access token
          await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_DATA,
        ]);
        // You might want to emit an event here to navigate to login screen
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Service object with all methods
const apiService = {
  // ===== AUTH METHODS =====
  auth: {
    login: async (email, password) => {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });
      const { access_token, refresh_token, user } = response.data;

      // Store tokens and user data
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return response.data;
    },

    register: async (userData) => {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return response.data;
    },

    logout: async () => {
      // Clear all stored data
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    },

    getCurrentUser: async () => {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
      return response.data;
    },

    forgotPassword: async (email) => {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      return response.data;
    },

    updateProfile: async (profileData) => {
      const response = await apiClient.put('/users/profile', profileData);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
      return response.data;
    },

    updatePassword: async (passwordData) => {
      const response = await apiClient.put('/users/password', passwordData);
      return response.data;
    },
  },

  // ===== PROPERTIES METHODS =====
  properties: {
    getAll: async () => {
      const response = await apiClient.get(API_ENDPOINTS.PROPERTIES.LIST);
      return response.data;
    },

    getById: async (id) => {
      const response = await apiClient.get(API_ENDPOINTS.PROPERTIES.DETAIL(id));
      return response.data;
    },

    create: async (propertyData) => {
      const response = await apiClient.post(API_ENDPOINTS.PROPERTIES.CREATE, propertyData);
      return response.data;
    },

    update: async (id, propertyData) => {
      const response = await apiClient.put(API_ENDPOINTS.PROPERTIES.UPDATE(id), propertyData);
      return response.data;
    },

    delete: async (id) => {
      const response = await apiClient.delete(API_ENDPOINTS.PROPERTIES.DELETE(id));
      return response.data;
    },
  },

  // ===== MAINTENANCE METHODS =====
  maintenance: {
    getAll: async () => {
      const response = await apiClient.get(API_ENDPOINTS.MAINTENANCE.LIST);
      return response.data;
    },

    getById: async (id) => {
      const response = await apiClient.get(API_ENDPOINTS.MAINTENANCE.DETAIL(id));
      return response.data;
    },

    create: async (maintenanceData) => {
      const response = await apiClient.post(API_ENDPOINTS.MAINTENANCE.CREATE, maintenanceData);
      return response.data;
    },

    update: async (id, maintenanceData) => {
      const response = await apiClient.put(
        API_ENDPOINTS.MAINTENANCE.UPDATE(id),
        maintenanceData
      );
      return response.data;
    },

    delete: async (id) => {
      const response = await apiClient.delete(API_ENDPOINTS.MAINTENANCE.DELETE(id));
      return response.data;
    },
  },

  // ===== FINANCES METHODS =====
  finances: {
    getTransactions: async () => {
      const response = await apiClient.get(API_ENDPOINTS.FINANCES.TRANSACTIONS);
      return response.data;
    },

    getSummary: async () => {
      const response = await apiClient.get(API_ENDPOINTS.FINANCES.SUMMARY);
      return response.data;
    },

    getIncome: async () => {
      const response = await apiClient.get(API_ENDPOINTS.FINANCES.INCOME);
      return response.data;
    },

    getExpenses: async () => {
      const response = await apiClient.get(API_ENDPOINTS.FINANCES.EXPENSES);
      return response.data;
    },
  },

  // ===== TENANTS METHODS =====
  tenants: {
    getAll: async () => {
      const response = await apiClient.get(API_ENDPOINTS.TENANTS.LIST);
      return response.data;
    },

    getById: async (id) => {
      const response = await apiClient.get(API_ENDPOINTS.TENANTS.DETAIL(id));
      return response.data;
    },

    create: async (tenantData) => {
      const response = await apiClient.post(API_ENDPOINTS.TENANTS.CREATE, tenantData);
      return response.data;
    },

    update: async (id, tenantData) => {
      const response = await apiClient.put(API_ENDPOINTS.TENANTS.UPDATE(id), tenantData);
      return response.data;
    },

    delete: async (id) => {
      const response = await apiClient.delete(API_ENDPOINTS.TENANTS.DELETE(id));
      return response.data;
    },
  },

  // ===== SETTINGS METHODS =====
  settings: {
    get: async () => {
      const response = await apiClient.get(API_ENDPOINTS.SETTINGS.GET);
      return response.data;
    },

    update: async (settingsData) => {
      const response = await apiClient.put(API_ENDPOINTS.SETTINGS.UPDATE, settingsData);
      return response.data;
    },

    updateNotifications: async (notificationData) => {
      const response = await apiClient.put('/settings/notifications', notificationData);
      return response.data;
    },

    updateAppearance: async (appearanceData) => {
      const response = await apiClient.put('/settings/appearance', appearanceData);
      return response.data;
    },

    updateTimezone: async (timezone) => {
      const response = await apiClient.put('/settings/timezone', { timezone });
      return response.data;
    },

    // Custom API URL management
    setCustomApiUrl: async (url) => {
      await AsyncStorage.setItem(STORAGE_KEYS.API_URL, url);
    },

    getCustomApiUrl: async () => {
      return await AsyncStorage.getItem(STORAGE_KEYS.API_URL);
    },

    clearCustomApiUrl: async () => {
      await AsyncStorage.removeItem(STORAGE_KEYS.API_URL);
    },
  },

  // ===== DOCUMENTS METHODS =====
  documents: {
    getAll: async (params = {}) => {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = queryParams ? `${API_ENDPOINTS.DOCUMENTS.LIST}?${queryParams}` : API_ENDPOINTS.DOCUMENTS.LIST;
      const response = await apiClient.get(endpoint);
      return response.data;
    },

    getById: async (id) => {
      const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS.DETAIL(id));
      return response.data;
    },

    upload: async (formData) => {
      const response = await apiClient.post(API_ENDPOINTS.DOCUMENTS.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },

    update: async (id, documentData) => {
      const response = await apiClient.put(API_ENDPOINTS.DOCUMENTS.UPDATE(id), documentData);
      return response.data;
    },

    delete: async (id) => {
      const response = await apiClient.delete(API_ENDPOINTS.DOCUMENTS.DELETE(id));
      return response.data;
    },

    download: async (id) => {
      const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS.DOWNLOAD(id), {
        responseType: 'blob',
      });
      return response.data;
    },

    getByProperty: async (propertyId) => {
      const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS.BY_PROPERTY(propertyId));
      return response.data;
    },

    getByTenant: async (tenantId) => {
      const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS.BY_TENANT(tenantId));
      return response.data;
    },

    getByAppliance: async (applianceId) => {
      const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS.BY_APPLIANCE(applianceId));
      return response.data;
    },

    getByCategory: async (category) => {
      const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS.BY_CATEGORY(category));
      return response.data;
    },

    getExpiring: async (days = 30) => {
      const response = await apiClient.get(`${API_ENDPOINTS.DOCUMENTS.EXPIRING}?days=${days}`);
      return response.data;
    },

    search: async (query) => {
      const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS.SEARCH(query));
      return response.data;
    },
  },

  // ===== PROPERTY PHOTOS METHODS =====
  propertyPhotos: {
    upload: async (formData) => {
      const response = await apiClient.post(API_ENDPOINTS.PROPERTY_PHOTOS.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },

    getByProperty: async (propertyId) => {
      const response = await apiClient.get(API_ENDPOINTS.PROPERTY_PHOTOS.LIST(propertyId));
      return response.data;
    },

    delete: async (id) => {
      const response = await apiClient.delete(API_ENDPOINTS.PROPERTY_PHOTOS.DELETE(id));
      return response.data;
    },
  },

  // ===== APPLIANCES METHODS =====
  appliances: {
    getAll: async (params = {}) => {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = queryParams ? `${API_ENDPOINTS.APPLIANCES.LIST}?${queryParams}` : API_ENDPOINTS.APPLIANCES.LIST;
      const response = await apiClient.get(endpoint);
      return response.data;
    },

    getById: async (id) => {
      const response = await apiClient.get(API_ENDPOINTS.APPLIANCES.DETAIL(id));
      return response.data;
    },

    create: async (applianceData) => {
      const response = await apiClient.post(API_ENDPOINTS.APPLIANCES.CREATE, applianceData);
      return response.data;
    },

    update: async (id, applianceData) => {
      const response = await apiClient.put(API_ENDPOINTS.APPLIANCES.UPDATE(id), applianceData);
      return response.data;
    },

    delete: async (id) => {
      const response = await apiClient.delete(API_ENDPOINTS.APPLIANCES.DELETE(id));
      return response.data;
    },

    getByProperty: async (propertyId) => {
      const response = await apiClient.get(API_ENDPOINTS.APPLIANCES.BY_PROPERTY(propertyId));
      return response.data;
    },

    getExpiringWarranties: async () => {
      const response = await apiClient.get(API_ENDPOINTS.APPLIANCES.EXPIRING_WARRANTIES);
      return response.data;
    },
  },

  // ===== PROJECTS METHODS =====
  projects: {
    getAll: async (params = {}) => {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = queryParams ? `${API_ENDPOINTS.PROJECTS.LIST}?${queryParams}` : API_ENDPOINTS.PROJECTS.LIST;
      const response = await apiClient.get(endpoint);
      return response.data;
    },

    getById: async (id) => {
      const response = await apiClient.get(API_ENDPOINTS.PROJECTS.DETAIL(id));
      return response.data;
    },

    create: async (projectData) => {
      const response = await apiClient.post(API_ENDPOINTS.PROJECTS.CREATE, projectData);
      return response.data;
    },

    update: async (id, projectData) => {
      const response = await apiClient.put(API_ENDPOINTS.PROJECTS.UPDATE(id), projectData);
      return response.data;
    },

    delete: async (id) => {
      const response = await apiClient.delete(API_ENDPOINTS.PROJECTS.DELETE(id));
      return response.data;
    },

    getByProperty: async (propertyId) => {
      const response = await apiClient.get(API_ENDPOINTS.PROJECTS.BY_PROPERTY(propertyId));
      return response.data;
    },

    getByStatus: async (status) => {
      const response = await apiClient.get(API_ENDPOINTS.PROJECTS.BY_STATUS(status));
      return response.data;
    },
  },

  // ===== SEASONAL MAINTENANCE METHODS =====
  seasonal: {
    getChecklist: async (season) => {
      const response = await apiClient.get(API_ENDPOINTS.SEASONAL.GET_CHECKLIST(season));
      return response.data;
    },

    toggleItem: async (itemId) => {
      const response = await apiClient.put(API_ENDPOINTS.SEASONAL.TOGGLE_ITEM(itemId));
      return response.data;
    },

    updateItem: async (itemId, data) => {
      const response = await apiClient.put(API_ENDPOINTS.SEASONAL.UPDATE_ITEM(itemId), data);
      return response.data;
    },

    deleteItem: async (itemId) => {
      const response = await apiClient.delete(API_ENDPOINTS.SEASONAL.DELETE_ITEM(itemId));
      return response.data;
    },

    resetChecklist: async (season) => {
      const response = await apiClient.post(API_ENDPOINTS.SEASONAL.RESET_CHECKLIST(season));
      return response.data;
    },
  },
};

export default apiService;
