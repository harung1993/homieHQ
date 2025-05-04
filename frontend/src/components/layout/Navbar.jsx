import React from 'react';

const Navbar = ({ toggleSidebar, user }) => {
  // Get user initials for the avatar
  const getUserInitials = () => {
    if (user && user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`;
    }
    return 'U';
  };

  return (
    <nav className="navbar fixed top-0 w-full z-40 py-3 px-4 md:px-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <button 
            className="mobile-menu-btn mr-4 text-gray-300 focus:outline-none" 
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <div className="flex items-center">
            <svg className="h-8 w-8 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span className="text-xl font-bold">
              <span className="homie-text">Homie</span><span className="accent-text">HQ</span>
            </span>
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
              {getUserInitials()}
            </div>
            <span className="ml-2 text-sm hidden md:block">
              {user ? `${user.first_name} ${user.last_name}` : 'User'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;