import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AdminMenu = ({ isMobile, onClose }) => {
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  const toggleAdminMenu = () => {
    setIsAdminMenuOpen(!isAdminMenuOpen);
  };

  // Single source of truth for menu items
  const menuItems = [
    { 
      path: '/admin/import', label: 'Import Idioms (CSV)'
    },
    {
      path: '/admin/idiom', label: 'Create Idiom'
    },
    {
      path: '/admin/example', label: 'Create Example'
    },
    {
      path: '/admin/audio', label: 'Upload Audio'
    },
  ];

  if (isMobile) {
    return (
      <div className="py-2">
        <div className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-1">Admin Menu</div>
        {menuItems.map((item, index) => (
          <Link 
            key={index}
            to={item.path} 
            className="block py-1 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
            onClick={onClose}
          >
            {item.label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="relative mr-4">
      <button 
        onClick={toggleAdminMenu}
        className="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
      >
        <span>Admin</span>
        <svg className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      {isAdminMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
          {menuItems.map((item, index) => (
            <Link 
              key={index}
              to={item.path} 
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsAdminMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMenu; 