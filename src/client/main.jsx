import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import { Auth } from './components/Auth.jsx'
import App from './App.jsx'
import './styles/index.css'
import { applyInitialFont } from './lib/fontLoader.js';

applyInitialFont('noto');

// Set font globally on app load (even if user never visits Preferences)
(function setInitialFont() {
  try {
    const font = localStorage.getItem('fontPref') || 'avenir';
    const html = document.documentElement;
    html.classList.remove('font-nunito', 'font-avenir');
    if (font === 'nunito') {
      if (!document.getElementById('nunito-font')) {
        const link = document.createElement('link');
        link.id = 'nunito-font';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap';
        document.head.appendChild(link);
      }
      html.classList.add('font-nunito');
    } else {
      html.classList.add('font-avenir');
    }
  } catch (e) {}
})();

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
          <App />
        </BrowserRouter>
    </Auth0Provider>
);