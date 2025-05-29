import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import { Auth } from './components/Auth.jsx'
import App from './App.jsx'
import './styles/index.css'
import { applyInitialFont, setInitialFont } from './lib/fontLoader.js';
import { checkAuth0LocalStorage } from './lib/checkAuth0LocalStorage.js';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';

applyInitialFont('noto');

// LocalStorage integrity check for Auth0
checkAuth0LocalStorage();

// Set font globally on app load (even if user never visits Preferences)
setInitialFont();

const { 
  VITE_AUTH0_DOMAIN: domain, 
  VITE_AUTH0_CLIENT_ID: clientId, 
  VITE_AUTH0_AUDIENCE: audience 
} = import.meta.env

ReactDOM.createRoot(document.getElementById('root')).render(
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience
      }}
      cacheLocation="localstorage"  // important!
      useRefreshTokens={true}
    >
        <Auth />
        <BrowserRouter>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </BrowserRouter>
    </Auth0Provider>
);