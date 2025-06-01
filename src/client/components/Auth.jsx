// src/client/components/Auth.jsx
import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useUserStore } from '../stores';
import debug from 'debug';

const debugLogin = debug('app:login');

/*
return from useAuth0
| isAuthenticated | boolean | Whether the user is authenticated |
| user | object | The user profile (if authenticated) |
| loginWithRedirect | function | Starts login via redirect |
| loginWithPopup | function | Starts login via popup |
| logout | function | Logs out the user |
| isLoading | boolean | Whether the SDK is still loading the auth state |
| getAccessTokenSilently | function | Retrieves an access token without prompting the user |
| getAccessTokenWithPopup | function | Retrieves an access token via popup |
| error | object | Auth error (if any) |
*/
export function Auth() {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    loginWithRedirect, 
    logout, 
    getAccessTokenSilently,
    error
  } = useAuth0();

  const setAuth     = useUserStore(state => state.setAuth);
  const syncProfile = useUserStore(state => state.syncProfile);
  
  // Sync Auth0 state to Zustand
  useEffect(() => {
    debugLogin('Auth0 user: %o', user);
    debugLogin('Auth0 state changed: isLoading=%s, isAuthenticated=%s, error: %o', isLoading, isAuthenticated, error);
    if( error ) {
      debugLogin('Auth0 error: %o', error);
    }
    if (isLoading) 
      return;
    
    setAuth({
      isAuthenticated,
      user,
      isLoading,
      login   : loginWithRedirect,
      logout  : () => logout({ returnTo: import.meta.env.VITE_AUTH0_LOGOUT_URL }),
      getToken: getAccessTokenSilently,
      error
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