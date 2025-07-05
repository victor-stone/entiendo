// Class name constants
const USER_INFO_CLASS = "flex items-center ";
const USER_INFO_SPAN_CLASS = "text-gray-700 dark:text-gray-300 mr-4";
const DESKTOP_MENU_CLASS = "hidden md:flex items-center space-x-4";
const MOBILE_MENU_BTN_CLASS = "md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none";
const MOBILE_MENU_CLASS = "md:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-700";
const MOBILE_MENU_INNER_CLASS = "flex flex-col space-y-4 px-2 pb-3";
const MOBILE_MENU_USERINFO_CLASS = "mb-2";
const NAVBAR_CLASS = "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm";
const NAVBAR_CONTAINER_CLASS = "container-wide py-3";
const NAVBAR_FLEX_CLASS = "flex items-center justify-between";
const NAVBAR_LEFT_CLASS = "flex items-center";
const NAVBAR_LINK_CLASS = "flex items-center";
const NAVBAR_TITLE_CLASS = "text-gradient-primary text-xl font-bold mr-1";
const NAVBAR_SUBTITLE_CLASS = "text-gray-600 dark:text-gray-300 text-sm";

import { useState } from 'react';
import { useUserStore } from '../../stores';
import { Link } from 'react-router-dom';
import { LoginButton, Avatar, Menu } from './index';

// Extracted user info block
const UserInfo = ({ user, greeting = "Hola", className = "", onLogout }) => (
  <div className={USER_INFO_CLASS + className}>
    <Avatar user={user} size="sm" className="mr-2" />
    <span className={USER_INFO_SPAN_CLASS}>
      {greeting}, {user.name || 'User'}
    </span>
  </div>
);

const DesktopMenu = ({ isLoggedIn, user, isAdmin, role }) => (
  <div className={DESKTOP_MENU_CLASS}>
    {isLoggedIn && <UserInfo user={user} />}
    <Menu isMobile={false} isLoggedIn={isLoggedIn} isAdmin={isAdmin} role={role} />
  </div>
);

const MobileMenuButton = ({ isOpen, onClick }) => (
  <button
    onClick={onClick}
    className={MOBILE_MENU_BTN_CLASS}
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

// Mobile menu dropdown (no admin/editor stuff)
const MobileMenu = ({ isOpen, isLoggedIn, user, onClose }) => (
  <div className={`${isOpen ? 'block' : 'hidden'} ${MOBILE_MENU_CLASS}`}>
    <div className={MOBILE_MENU_INNER_CLASS}>
      <div className="pt-2">
        {isLoggedIn ? (
          <UserInfo user={user} greeting="Hello" className={MOBILE_MENU_USERINFO_CLASS} onLogout={onClose} />
        ) : (
          <LoginButton />
        )}
        <Menu isMobile={true} isLoggedIn={isLoggedIn} onClose={onClose} />
      </div>
    </div>
  </div>
);

const Navbar = () => {
  const { user, isAdmin, profile } = useUserStore();
  const isLoggedIn = !!user;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(open => !open);

  return (
    <nav style={{zIndex: 4}} className={NAVBAR_CLASS}>
      <div className={NAVBAR_CONTAINER_CLASS}>
        <div className={NAVBAR_FLEX_CLASS}>
          <div className={NAVBAR_LEFT_CLASS}>
            <Link to="/" className={NAVBAR_LINK_CLASS}>
              <span className={NAVBAR_TITLE_CLASS}>Entiendo</span>
              <span className={NAVBAR_SUBTITLE_CLASS}>| Language Comprehension</span>
            </Link>
          </div>

          <div className="flex items-center">
            <DesktopMenu isLoggedIn={isLoggedIn} user={user} isAdmin={isAdmin} role={profile?.role} />
            <MobileMenuButton isOpen={isMobileMenuOpen} onClick={toggleMobileMenu} />
          </div>
        </div>

        <MobileMenu
          isOpen={isMobileMenuOpen}
          isLoggedIn={isLoggedIn}
          user={user}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>
    </nav>
  );
};

export default Navbar;