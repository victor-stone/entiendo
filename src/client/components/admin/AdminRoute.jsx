import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../../stores';
import LoadingIndicator from '../ui/LoadingIndicator';

/**
 * A wrapper component for routes that should only be accessible to admin users.
 * If user is not authenticated or not an admin, they will be redirected.
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, profile, isAdmin } = useUserStore();
  

  // Show loading indicator while checking authentication status
  if (loading || !profile) {
    return <LoadingIndicator message="Checking authorization..." />;
  }

  // Redirect to landing page if not authenticated
  if (!isAuthenticated) {
    console.log('AdminRoute - Redirecting: Not authenticated');
    return <Navigate to="/" replace />;
  }

  // Redirect to dashboard if authenticated but not admin
  if (!isAdmin) {
    console.log('AdminRoute - Redirecting: Not admin', profile?.role);
    return <Navigate to="/admin" replace />;
  }

  // If authenticated and admin, render the children
  console.log('AdminRoute - Rendering admin content');
  return children;
};

export default AdminRoute; 