import { useState } from 'react';
import { useUserStore, useSettingsStore } from '../../stores';
import { Link } from 'react-router-dom';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import Avatar from './Avatar';
import AdminMenu from './AdminMenu';

const Navbar = () => {
  const user       = useUserStore(state => state.user);
  const isAdmin    = useUserStore(state => state.isAdmin);
  const needBetaTest = useSettingsStore(state => state.needBetaTest);
  const isLoggedIn = !!user;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="container-wide py-3">
        <div className="flex items-center justify-between">
          {/* Logo and app name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-gradient-primary text-xl font-bold mr-1">Entiendo</span>
              <span className="text-gray-600 dark:text-gray-300 text-sm">| Language Comprehension</span>
            </Link>
          </div>

          {/* Navigation links - desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {isLoggedIn && (
              <Link to="/app/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth buttons */}
          <div className="flex items-center">
            <div className="hidden md:block">
              {isLoggedIn ? (
                <div className="flex items-center">
                  <Avatar user={user} size="sm" className="mr-2" />
                  <span className="text-gray-700 dark:text-gray-300 mr-4">
                    Hola, {user.name || 'User'}
                  </span>
                  {isAdmin && <AdminMenu isMobile={false} />}
                  <LogoutButton />
                </div>
              ) : ('')}
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={toggleMobileMenu} 
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu, toggle classes based on menu state */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-700`}>
          <div className="flex flex-col space-y-4 px-2 pb-3">
            {isLoggedIn && (
              <Link 
                to="/app/dashboard" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <div className="pt-2">
              {isLoggedIn ? (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <Avatar user={user} size="sm" className="mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Hello, {user.name || 'User'}
                    </span>
                  </div>
                  {isAdmin && <AdminMenu isMobile={true} onClose={() => setIsMobileMenuOpen(false)} />}
                  <LogoutButton />
                </div>
              ) : 
                !needBetaTest && <LoginButton />
              }
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 