import { Navigate } from 'react-router-dom';
import { useUserStore } from '../stores';
import { LoadingSpinner } from './ui/LoadingIndicator';


// Protected route component to ensure only authenticated users and beta-verified users can access
const UserRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useUserStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default UserRoute;