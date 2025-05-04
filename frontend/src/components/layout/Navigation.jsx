import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Navigation = ({ children, user, property, hideSidebar = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Calculate main content classes based on sidebar visibility
  const mainContentClasses = `pt-20 ${!hideSidebar && sidebarOpen ? 'md:ml-64' : ''}`;

  return (
    <div className="min-h-screen">
      {/* Navbar - Pass user data */}
      <Navbar toggleSidebar={toggleSidebar} user={user} />

      {/* Sidebar - only rendered if not hidden */}
      {!hideSidebar && (
        <Sidebar 
          isOpen={sidebarOpen} 
          closeSidebar={closeSidebar} 
          currentProperty={property}
        />
      )}

      {/* Main Content */}
      <main className={mainContentClasses}>
        {children}
      </main>
    </div>
  );
};

export default Navigation;