// src/client/main.jsx
import ReactDOM from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import { Auth } from './components/Auth.jsx'
import './styles/index.css'
import { checkAuth0LocalStorage } from './lib/checkAuth0LocalStorage.js'
import { RouterProvider } from 'react-router-dom'
import router from './pages/router.jsx'
import { useUserStore } from './stores'
import { LoadingIndicator } from './components/ui'
import debug from 'debug';
import BetaGate from './components/BetaGate.jsx'

const debugApp = debug('app');
const debugLogin = debug('app:login');

checkAuth0LocalStorage()

function EntiendoApp() {
  debugApp('Entiendo app');
  const authReady = useUserStore(state => state.authReady)
  debugLogin('AUTH READY: ', authReady);
  return (
    <>
      <Auth />
      {authReady ? <RouterProvider router={router} /> : <LoadingIndicator />}
    </>
  )
}

const {
  VITE_AUTH0_DOMAIN: domain,
  VITE_AUTH0_CLIENT_ID: clientId,
  VITE_AUTH0_AUDIENCE: audience
} = import.meta.env

ReactDOM.createRoot(document.getElementById('root')).render(
  <BetaGate>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience,
        scope: "openid profile email offline_access"
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      <EntiendoApp />
    </Auth0Provider>
  </BetaGate>
)