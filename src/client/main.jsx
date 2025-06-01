import ReactDOM from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import { Auth } from './components/Auth.jsx'
import './styles/index.css'
import { applyInitialFont, setInitialFont } from './lib/fontLoader.js';
import { checkAuth0LocalStorage } from './lib/checkAuth0LocalStorage.js';
import { RouterProvider } from 'react-router-dom';
import router from './pages/router.jsx';

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
        audience,
        scope: "openid profile email offline_access"
      }}
      cacheLocation="localstorage"  // important!
      useRefreshTokens={true}
    >
        <Auth />
        <RouterProvider router={router} />
    </Auth0Provider>
);