import debug from 'debug';
const debugLogin = debug('app:login');

/**
 * Checks Auth0-related localStorage for corruption. If corruption is found, clears localStorage and reloads the page.
 * Should be called before Auth0Provider is mounted.
 */
export function checkAuth0LocalStorage() {
  try {
    const keys = Object.keys(localStorage);
    const auth0Keys = keys.filter(k => k.startsWith('auth0.'));
    for (const key of auth0Keys) {
      const value = localStorage.getItem(key);
      try {
        if (value && (value.startsWith('{') || value.startsWith('['))) {
          JSON.parse(value);
        }
      } catch (e) {
        debugLogin('Corrupt Auth0 localStorage detected in key %s, clearing...', key);
        localStorage.clear();
        window.location.reload();
        return;
      }
    }
    debugLogin('Auth0 localStorage integrity check passed.');
  } catch (e) {
    debugLogin('Error during Auth0 localStorage check, clearing all.');
    localStorage.clear();
    window.location.reload();
  }
}
