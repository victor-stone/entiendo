import { Navigate } from 'react-router-dom';
import { useUserStore, useSettingsStore } from '../stores';
import { LoadingSpinner } from './ui/LoadingIndicator';
import debug from 'debug';

const debugLogin = debug('app:login');

// Protected route component to ensure only authenticated users and beta-verified users can access
const UserRoute = ({ children }) => {
  const { isAuthenticated, isLoading} = useUserStore();
  const { inBeta, verifiedBeta }      = useSettingsStore();

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