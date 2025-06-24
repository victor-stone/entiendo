import { useState } from 'react';
import { useUserStore } from '../../stores';
import { Link } from 'react-router-dom';
import { LoginButton, Avatar, Menu } from './index';

// Extracted user info block
const UserInfo = ({ user, greeting = "Hola", className = "", onLogout }) => (
  <div className={`flex items-center ${className}`}>
    <Avatar user={user} size="sm" className="mr-2" />
    <span className="text-gray-700 dark:text-gray-300 mr-4">
      {greeting}, {user.name || 'User'}
    </span>
  </div>
);

// Desktop menu section
const DesktopMenu = ({ isLoggedIn, user, isAdmin }) => (
  <div className="hidden md:flex items-center space-x-4">
    {isLoggedIn && <UserInfo user={user} />}
    <Menu isMobile={false} isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
  </div>
);

// Mobile menu button
const MobileMenuButton = ({ isOpen, onClick }) => (
  <button
    onClick={onClick}
    className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none"
    aria-label="Toggle menu"
  >
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {isOpen ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  </button>
);

// Mobile menu dropdown
const MobileMenu = ({ isOpen, isLoggedIn, user, isAdmin, onClose }) => (
  <div className={`${isOpen ? 'block' : 'hidden'} md:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-700`}>
    <div className="flex flex-col space-y-4 px-2 pb-3">
      <div className="pt-2">
        {isLoggedIn ? (
          <UserInfo user={user} greeting="Hello" className="mb-2" onLogout={onClose} />
        ) : (
          <LoginButton />
        )}
        <Menu isMobile={true} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onClose={onClose} />
      </div>
    </div>
  </div>
);

const Navbar = () => {
  const user       = useUserStore(state => state.user);
  const isAdmin    = useUserStore(state => state.isAdmin);
  const isLoggedIn = !!user;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(open => !open);

  return (
    <nav style={{zIndex: 4}} className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="container-wide py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-gradient-primary text-xl font-bold mr-1">Entiendo</span>
              <span className="text-gray-600 dark:text-gray-300 text-sm">| Language Comprehension</span>
            </Link>
          </div>

          <div className="flex items-center">
            <DesktopMenu isLoggedIn={isLoggedIn} user={user} isAdmin={isAdmin} />
            <MobileMenuButton isOpen={isMobileMenuOpen} onClick={toggleMobileMenu} />
          </div>
        </div>

        <MobileMenu
          isOpen={isMobileMenuOpen}
          isLoggedIn={isLoggedIn}
          user={user}
          isAdmin={isAdmin}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>
    </nav>
  );
};

export default Navbar;