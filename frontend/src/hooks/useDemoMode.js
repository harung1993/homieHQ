import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook to handle demo mode functionality
 * - Auto-logout after 10 minutes
 * - Warning before logout
 * - Session activity tracking
 */
const useDemoMode = () => {
  const navigate = useNavigate();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const intervalRef = useRef(null);

  // Demo session duration (10 minutes)
  const DEMO_SESSION_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
  const WARNING_TIME = 2 * 60 * 1000; // Show warning 2 minutes before logout

  useEffect(() => {
    // Check if we're in demo mode
    const checkDemoMode = () => {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          // Check if email is a demo account
          const isDemo = userData.email && userData.email.startsWith('demo') &&
                        userData.email.endsWith('@propertypal.com');
          setIsDemoMode(isDemo);
          return isDemo;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      return false;
    };

    const isDemo = checkDemoMode();

    if (isDemo) {
      // Set up auto-logout timer
      const loginTime = localStorage.getItem('demoLoginTime');
      const now = Date.now();

      if (!loginTime) {
        // First time, set login time
        localStorage.setItem('demoLoginTime', now.toString());
      }

      const startTime = loginTime ? parseInt(loginTime) : now;
      const elapsed = now - startTime;
      const remaining = DEMO_SESSION_DURATION - elapsed;

      if (remaining <= 0) {
        // Session already expired
        handleLogout();
        return;
      }

      // Set up warning timer (2 minutes before logout)
      const warningTime = remaining - WARNING_TIME;
      if (warningTime > 0) {
        warningTimeoutRef.current = setTimeout(() => {
          setShowWarning(true);
        }, warningTime);
      } else {
        setShowWarning(true);
      }

      // Set up auto-logout timer
      timeoutRef.current = setTimeout(() => {
        handleLogout();
      }, remaining);

      // Update countdown every second when warning is shown
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const startTime = parseInt(localStorage.getItem('demoLoginTime'));
        const elapsed = now - startTime;
        const remaining = DEMO_SESSION_DURATION - elapsed;

        if (remaining <= WARNING_TIME) {
          setTimeRemaining(Math.floor(remaining / 1000)); // Convert to seconds
        }
      }, 1000);
    }

    // Cleanup timers
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleLogout = () => {
    // Clear all demo-related data
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('demoLoginTime');
    localStorage.removeItem('currentPropertyId');

    // Redirect to login with demo timeout message
    navigate('/login?demo_timeout=true');
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isDemoMode,
    showWarning,
    timeRemaining,
    formattedTimeRemaining: formatTime(timeRemaining),
    handleLogout
  };
};

export default useDemoMode;
