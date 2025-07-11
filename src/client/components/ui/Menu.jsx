import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogoutButton } from './index'; // Make sure this import exists

const loggedInItems = [
    { 
      path: '/app/dashboard', label: 'Dashboard'
    },
    {
      logout: true, label: 'Logout'
    }
];

const genericItems = [
    {
      path: '/about', label: 'About'
    },
    {
      path: '/license', label: 'Licenses / Credit'
    },
    {
      path: '/chat', label: 'Help / Support (Chat)'
    },
    { 
      path: '/app/bugreport', label: 'Report Bugs'
    }
  ];

const editorItems = [
  {
    path: '/editor/manage', label: 'Upload Audio'
  },
];

const adminItems = [
    { 
      path: '/admin/idioms', label: 'Idioms'
    },
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
      path: '/admin/audio', label: 'Manage Assignments'
    },
    {
      path: '/admin/settings', label: 'Settings'
    },
    {
      path: '/admin/prompts', label: 'Prompts'
    },
    {
      path: '/admin/resetcache', label: 'Reset Caches'
    },
  ];

const MOBILE_LOGOUT = "block py-1 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer"
// "block py-1 text-left w-full text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400";
const LOGOUT_LINK = "block px-4 py-2 text-sm text-left w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer";
const MOBILE_LINK = "block py-1 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400";
const LINK = "block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";
const BUTTON = "flex items-center text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400";
const EVENODD_SVG = "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z";
const GREY_HR = "my-2 border-t border-gray-300 dark:border-gray-600";
const OPEN_MENU = "absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700";

const Menu = ({ isMobile, isLoggedIn, isAdmin, role, onClose }) => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [];

  if (isLoggedIn) {
    menuItems.push(...loggedInItems);
    menuItems.push({ separator: true }); 
  }
  
  menuItems.push(...genericItems);

  if( isAdmin || role == 'editor' ) {
    menuItems.push({ separator: true }); 
    menuItems.push(...editorItems);
  }

  if (isAdmin) {
    menuItems.push({ separator: true });
    menuItems.push(...adminItems);
  }
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Helper to render menu items
  const renderMenuItem = (item, index) => {
    if (item.separator) return <hr key={`sep-${index}`} className={GREY_HR} />;
    
    if (item.logout) {
      return isMobile ? (
        <LogoutButton key="logout" onClick={onClose} className={MOBILE_LOGOUT} />
      ) : (
        <LogoutButton key="logout" onClick={() => setIsMenuOpen(false)} className={LOGOUT_LINK} />
      );
    }

    return isMobile ? (
      <Link key={index} to={item.path} className={MOBILE_LINK} onClick={onClose}>
        {item.label}
      </Link>
    ) : (
      <Link key={index} to={item.path} className={LINK} onClick={() => setIsMenuOpen(false)}>
        {item.label}
      </Link>
    );
  };

  if (isMobile) {
    return (
      <div className="py-2">
        {menuItems.map(renderMenuItem)}
      </div>
    );
  }

  return (
    <div className="relative mr-4">
      <button onClick={toggleMenu} className={BUTTON} >
        <span>Menu</span>
        <svg className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d={EVENODD_SVG} clipRule="evenodd" />
        </svg>
      </button>
      {isMenuOpen && <div className={OPEN_MENU}>{menuItems.map(renderMenuItem)}</div>}
    </div>
  );
};

export default Menu;