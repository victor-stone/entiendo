import { Navigate } from 'react-router-dom';
import { useUserStore, useSettingsStore } from '../stores';
import { LoadingSpinner } from './ui/LoadingIndicator';
import debug from 'debug';

const debugLogin = debug('app:login');

// Protected route component to ensure only authenticated users and beta-verified users can access
const UserRoute = ({ children }) => {
  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  const isLoading = useUserStore(state => state.loading);
  const needBetaTest = useSettingsStore(state => state.needBetaTest);
  const verifiedBeta = useSettingsStore(state => state.verifiedBeta);

  // Wait for Auth0/Zustand to finish loading before making a decision
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If beta test is required and not verified, redirect to landing
  if (needBetaTest && !verifiedBeta) {
    debugLogin('needBetaTest: %s  verifiedBeta: %s', needBetaTest, verifiedBeta);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default UserRoute;