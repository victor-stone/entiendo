// src/client/components/Auth.jsx
import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useUserStore } from '../stores';
import debug from 'debug';
import { jwtDecode } from "jwt-decode";
import { format } from 'timeago.js';

const debugLogin = debug('app:login');

/* 
 Returned from useAuth0:
const auth0State = {
  
// Whether the user is authenticated
  isAuthenticated: false,

  // The user profile (if authenticated)
  user: null,

  // Starts login via redirect
  loginWithRedirect: () => {},

  // Starts login via popup
  loginWithPopup: () => {},

  // Logs out the user
  logout: () => {},

  // Whether the SDK is still loading the auth state
  isLoading: true,

  // Retrieves an access token without prompting the user
  getAccessTokenSilently: () => {},

  // Retrieves an access token via popup
  getAccessTokenWithPopup: () => {},

  // Auth error (if any)
  error: null,
};
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

  const { setAuth, syncProfile, authReady } = useUserStore();
  
  // Sync Auth0 state to Zustand
  useEffect(() => {
    debugLogin('Auth0 user: %o', user);
    debugLogin('Auth0 state changed: isLoading=%s, isAuthenticated=%s, error: %o', isLoading, isAuthenticated, error);
    if( error ) {
      debugLogin('Auth0 error: %o', error);
    }
    if (isLoading) 
      return;
    
    const authSpec = {
          isAuthenticated,
          user,
          loading : isLoading,
          login   : loginWithRedirect,
          logout  : () => logout({ returnTo: import.meta.env.VITE_AUTH0_LOGOUT_URL }),
          getToken: getAccessTokenSilently,
          error
        };

    if( isAuthenticated ) {
      (async () => {
        try {
          const token = await getAccessTokenSilently();
          const decoded = jwtDecode(token);
          const now = Date.now();
          const fromnow = format(decoded.exp * 1000);
          const _now = format(now);
          debugLogin('Decoded token expires %s vs. %s', fromnow, _now);
          if (decoded.exp && (decoded.exp * 1000) < now) {
            debugLogin('Token is expired! Logging out.');
            logout({ returnTo: window.location.origin });
            return;
          }
          debugLogin('Login token still fresh');
          setAuth(authSpec);
          syncProfile(user);
        } catch(err) {
            debugLogin("token won't refresh, logging out");
            logout({ returnTo: window.location.origin });
        }
      })();
    } else {
      setAuth(authSpec);
    }
  }, [isLoading, isAuthenticated, user]);
  
  
  return null;
}