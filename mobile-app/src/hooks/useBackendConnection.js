import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/api';

/**
 * Custom hook to check backend server connectivity
 * Prompts user to configure server if not reachable
 */
export const useBackendConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      // Get custom API URL if set
      const customApiUrl = await AsyncStorage.getItem(STORAGE_KEYS.API_URL);
      const apiUrl = customApiUrl || API_BASE_URL;

      // Ensure URL doesn't have trailing slash
      const cleanUrl = apiUrl.replace(/\/$/, '');
      const checkUrl = `${cleanUrl}/auth/login`;

      console.log('[Backend Connection] Checking connection to:', checkUrl);

      // Try to ping the backend (with a short timeout)
      const response = await axios.get(checkUrl, {
        timeout: 5000,
        validateStatus: (status) => {
          // We just want to know if the server is reachable
          // Even a 405 (Method Not Allowed) means it's connected
          return status >= 200 && status < 600;
        },
      });

      console.log('[Backend Connection] Success! Status:', response.status);
      setIsConnected(true);
      setNeedsSetup(false);
    } catch (error) {
      // Connection failed
      console.log('[Backend Connection] Failed:', error.message);
      if (error.response) {
        console.log('[Backend Connection] Response status:', error.response.status);
      }
      setIsConnected(false);
      setNeedsSetup(true);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return {
    isConnected,
    isChecking,
    needsSetup,
    recheckConnection: checkConnection,
  };
};

export default useBackendConnection;
