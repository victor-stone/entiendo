import { Navigate } from 'react-router-dom';
import { useUserStore, useBetaSettingStore } from '../stores';
import { LoadingSpinner } from './ui/LoadingIndicator';
import debug from 'debug';
import { useEffect } from 'react';

const debugLogin = debug('app:login');

// Protected route component to ensure only authenticated users and beta-verified users can access
const UserRoute = ({ children }) => {
  const { isAuthenticated, isLoading, preferences} = useUserStore();
  const { inBeta, verifiedBeta }      = useBetaSettingStore();

  // Set theme from preferences
  useEffect(() => {
    // Remove all theme classes
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'dark');
    if (preferences && preferences.theme) {
      if (preferences.theme === 'light') {
        document.documentElement.classList.add('theme-light');
        // Remove Tailwind dark mode
        document.documentElement.classList.remove('dark');
      } else if (preferences.theme === 'dark') {
        document.documentElement.classList.add('theme-dark');
        // Enable Tailwind dark mode
        document.documentElement.classList.add('dark');
      } else {
        // System default: remove all theme classes
        document.documentElement.classList.remove('theme-light', 'theme-dark', 'dark');
      }
    } else {
      // System default: remove all theme classes
      document.documentElement.classList.remove('theme-light', 'theme-dark', 'dark');
    }
  }, [preferences?.theme]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If beta test is required and not verified, redirect to landing
  if (inBeta && !verifiedBeta) {
    debugLogin('inBeta: %s  verifiedBeta: %s', inBeta, verifiedBeta);
    return <Navigate to="/" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default UserRoute;