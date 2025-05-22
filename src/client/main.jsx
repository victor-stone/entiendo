import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import { Auth } from './components/Auth.jsx'
import App from './App.jsx'
import './styles/index.css'

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