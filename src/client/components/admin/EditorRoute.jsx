import { Navigate } from 'react-router-dom';
import { useUserStore } from '../../stores';
import LoadingIndicator from '../ui/LoadingIndicator';
import debug from 'debug';

const debugRoute = debug('app:navigation')
/**
 * A wrapper component for routes that should only be accessible to editors
 */
const EditorRoute = ({ children }) => {
  const { isAuthenticated, loading, profile, isAdmin } = useUserStore();
  
  if (loading || !profile) {
    return <LoadingIndicator message="Checking authorization..." />;
  }

  if (!isAuthenticated) {
    debugRoute('EditorRoute - Redirecting: Not authenticated');
    return <Navigate to="/" replace />;
  }

  if (!isAdmin && profile?.role !== 'editor') {
    debugRoute('EditorRoute - Redirecting: Not editor', profile?.role);
    return <Navigate to="/app/dashboard" replace />;
  }

  debugRoute('EditorRoute - Rendering edit content');
  return children;
};

export default EditorRoute; 