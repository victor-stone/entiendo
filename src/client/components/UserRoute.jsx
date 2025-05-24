import { Navigate } from 'react-router-dom';
import { useUserStore, useSettingsStore } from '../stores';

// Protected route component to ensure only authenticated users and beta-verified users can access
const UserRoute = ({ children }) => {
  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  const needBetaTest = useSettingsStore(state => state.needBetaTest);
  const verifiedBeta = useSettingsStore(state => state.verifiedBeta);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If beta test is required and not verified, redirect to landing
  if (needBetaTest && !verifiedBeta) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default UserRoute;