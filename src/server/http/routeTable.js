// src/server/http/routeTable.js

/**
 * Route table for the Entiendo API
 * Maps HTTP methods and paths to handler functions
 * 
 * This is a centralized mapping between URL patterns and their handlers
 * based on the API endpoints defined in the documentation
 */

// Import API modules
import * as idiomAPI    from  '../api/idiomAPI.js';
import * as userAPI     from  '../api/userAPI.js';
import * as exerciseAPI from  '../api/exercise/index.js';
import * as adminAPI    from  '../api/adminAPI.js';
import * as settingsAPI from '../lib/settingsAPI.js';

/**
 * The route table maps HTTP methods and paths to handler functions
 * Each entry specifies:
 * - handler: Function to handle the request with unified parameter object
 * - auth: Whether authentication is required for this endpoint
 */
export const routeTable = {
  // POST routes
  POST: {
    '/api/exercises/evaluate': {
      handler: (unified) => exerciseAPI.evaluateResponse(unified),
      auth: true
    },

    '/api/admin/idioms/validate': {
      handler: (unified) => adminAPI.importValidateCSV(unified),
      auth: true
    },

    '/api/admin/idioms': {
      handler: (unified) => adminAPI.importIdioms(unified),
      auth: true
    },

    '/api/admin/idiom': {
      handler: (unified) => adminAPI.createIdiom(unified),
      auth: true
    },

    '/api/admin/idiom-examples': {
      handler: (unified) => adminAPI.createIdiomExample(unified),
      auth: true
    },
    
    '/api/admin/example-audio': {
      handler: (unified) => adminAPI.uploadExampleAudio(unified),
      auth: true
    },

    // User routes
    '/api/users/sync': {
      handler: (unified) => userAPI.syncUserFromAuth0(unified),
      auth: true
    },

    '/api/users/preferences': {
      handler: (unified) => userAPI.updatePreferences(unified),
      auth: true
    },

  },
  
  // GET routes
  GET: {
    '/api/idioms': { 
      handler: (unified) => idiomAPI.getIdiomsList(unified),
      auth: false 
    },
    '/api/idioms/tones': { 
      handler: (unified) => idiomAPI.getTones(unified),
      auth: false 
    },
    '/api/exercises/:idiomId': {
      handler: (unified) => exerciseAPI.getIdiomExamples(unified),
      auth: false
    },
    '/api/exercises/next': {
      handler: (unified) => exerciseAPI.getNext(unified),
      auth: true
    },
    '/api/exercises': {
      handler: (unified) => exerciseAPI.dueList(unified),
      auth: true
    },
    '/api/exercises/stats': {
      handler: (unified) => exerciseAPI.dueStats(unified),
      auth: true
    },
    '/api/exercises/missed': {
      handler: (unified) => exerciseAPI.missedWords(unified),
      auth: true
    },
    '/api/settings': {
      handler: (unified) => settingsAPI.getSettings(unified),
      auth: false
    }
  },
  
  // PUT routes
  PUT: {
  },
  
  // DELETE routes
  DELETE: {
  }
};

/**
 * Get the handler function for a given method and path
 * @param {String} method - HTTP method (GET, POST, etc.)
 * @param {String} path - Request path
 * @returns {Object|null} - Handler info or null if not found
 */
export const getRouteHandler = (method, path) => {
  // Get routes for this method
  const routes = routeTable[method];
  if (!routes) {
    return null;
  }
  
  // Try direct match first
  if (routes[path]) {
    return { 
      ...routes[path],
      params: {}
    };
  }
  
  // Check for parameterized routes
  for (const routePath in routes) {
    if (routePath.includes(':')) {
      const routeParts = routePath.split('/');
      const pathParts = path.split('/');
      
      // Skip if path parts count doesn't match
      if (routeParts.length !== pathParts.length) {
        continue;
      }
      
      // Try to match with parameters
      const params = {};
      let matches = true;
      
      for (let i = 0; i < routeParts.length; i++) {
        // Parameter segment
        if (routeParts[i].startsWith(':')) {
          const paramName = routeParts[i].substring(1);
          params[paramName] = pathParts[i];
        } 
        // Regular segment - must match exactly
        else if (routeParts[i] !== pathParts[i]) {
          matches = false;
          break;
        }
      }
      
      if (matches) {
        return {
          ...routes[routePath],
          params
        };
      }
    }
  }
  
  // No match found
  return null;
};