// src/client/components/Auth.jsx
import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useUserStore } from '../stores';

export function Auth() {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    loginWithRedirect, 
    logout, 
    getAccessTokenSilently 
  } = useAuth0();

  const setAuth     = useUserStore(state => state.setAuth);
  const syncProfile = useUserStore(state => state.syncProfile);
  
  // Sync Auth0 state to Zustand
  useEffect(() => {
    if (isLoading) return;
    
    setAuth({
      isAuthenticated,
      user,
      isLoading,
      login   : loginWithRedirect,
      logout  : () => logout({ returnTo: import.meta.env.VITE_AUTH0_LOGOUT_URL }),
      getToken: getAccessTokenSilently
    });
  }, [isLoading, isAuthenticated, user]);
  
  // Call syncProfile when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      syncProfile();
    }
  }, [isAuthenticated, isLoading, syncProfile]);
  
  return null;
}