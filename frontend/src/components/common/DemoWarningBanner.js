import React from 'react';
import useDemoMode from '../../hooks/useDemoMode';

/**
 * Banner component that displays demo mode warnings
 * Shows countdown when session is about to expire
 */
const DemoWarningBanner = () => {
  const { isDemoMode, showWarning, formattedTimeRemaining } = useDemoMode();

  if (!isDemoMode) {
    return null;
  }

  return (
    <>
      {/* Info banner - always shown in demo mode */}
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-3 mb-4" role="alert">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Demo Mode</span>
          </div>
          <span className="text-sm">
            You're using a demo account. Session expires after 10 minutes.
          </span>
        </div>
      </div>

      {/* Warning banner - shown when time is running out */}
      {showWarning && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 animate-pulse" role="alert">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="font-bold">Session Expiring Soon!</span>
                <p className="text-sm mt-1">
                  Your demo session will expire in <span className="font-bold">{formattedTimeRemaining}</span>.
                  You'll be automatically logged out.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DemoWarningBanner;
