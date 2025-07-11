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
import * as adminAPI    from  '../api/admin/index.js';
import * as settingsAPI from  '../api/settingsAPI.js';
import * as sandboxAPI  from  '../api/sandboxAPI.js';
import * as exampleAPI  from  '../api/exampleAPI.js';

/**
 * The route table maps HTTP methods and paths to handler functions
 * Each entry specifies:
 * - handler: Function to handle the request with routeContext parameter object
 * - auth: Whether authentication is required for this endpoint
 */
export const routeTable = {
  // POST routes
  POST: {
    '/api/editor/assign': { 
      handler: (routeContext) => adminAPI.assignEditorToIdiom(routeContext),
      auth: true
    },
    '/api/editor/publish': { 
      handler: (routeContext) => adminAPI.assignPublish(routeContext),
      auth: true
    },
    '/api/editor/fulfill': {
      handler: (routeContext) => adminAPI.assignmentFulfill(routeContext),
      auth: true
    },
    '/api/editor/assignmentreports': { 
      handler: (routeContext) => adminAPI.assignmentReports(routeContext),
      auth: true
    },


    '/api/admin/example-audio': {
      handler: (routeContext) => adminAPI.uploadExampleAudio(routeContext),
      auth: true
    },
    '/api/admin/idiom': {
      handler: (routeContext) => adminAPI.createIdiom(routeContext),
      auth: true
    },
    '/api/admin/idiom-examples': {
      handler: (routeContext) => adminAPI.createExample(routeContext),
      auth: true
    },
    '/api/admin/idiom/update': {
      handler: (routeContext) => adminAPI.updateIdiom(routeContext),
      auth: true
    },
    '/api/admin/idioms': {
      handler: (routeContext) => adminAPI.importIdioms(routeContext),
      auth: true
    },
    '/api/admin/idioms/validate': {
      handler: (routeContext) => adminAPI.importValidateCSV(routeContext),
      auth: true
    },

    '/api/admin/prompts': { 
      handler: (routeContext) => adminAPI.putPrompts(routeContext),
      auth: true
    },
    '/api/admin/reportbug': {
      handler: (routeContext) => adminAPI.reportAppBug(routeContext),
      auth: true
    },

    '/api/example/:exampleId': {
      handler: (routeContext) => exampleAPI.updateExample(routeContext),
      auth: false
    },
    '/api/exercises/evaluate': {
      handler: (routeContext) => exerciseAPI.evaluateResponse(routeContext),
      auth: true
    },
    '/api/sandbox/evaluate': {
      handler: (routeContext) => sandboxAPI.evaluate(routeContext),
      auth: true
    },
    '/api/sandbox/next': {
      handler: (routeContext) => sandboxAPI.getNext(routeContext),
      auth: true
    },
    
    '/api/settings': {
      handler: (routeContext) => settingsAPI.putSettings(routeContext),
      auth: true
    },
    '/api/users/preferences': {
      handler: (routeContext) => userAPI.updatePreferences(routeContext),
      auth: true
    },
    '/api/users/sync': {
      handler: (routeContext) => userAPI.syncUserFromAuth0(routeContext),
      auth: true
    }
  },
  
  // GET routes
  GET: {
    '/api/editors': { 
      handler: (routeContext) => adminAPI.editors(routeContext),
      auth: true
    },

    '/api/admin/resetcaches': { 
      handler: (routeContext) => adminAPI.resetCaches(routeContext),
      auth: true
    },
    '/api/admin/prompts': { 
      handler: (routeContext) => adminAPI.getPrompts(routeContext),
      auth: true
    },
    '/api/example/:exampleId': {
      handler: (routeContext) => exampleAPI.getExampleById(routeContext),
      auth: false
    },
    '/api/example/idiom/:idiomId': {
      handler: (routeContext) => exampleAPI.getExamplesForIdiom(routeContext),
      auth: false
    },
    '/api/exercises': {
      handler: (routeContext) => exerciseAPI.schedule(routeContext),
      auth: true
    },
    '/api/exercises/next': {
      handler: (routeContext) => exerciseAPI.getNext(routeContext),
      auth: true
    },
    '/api/exercises/stats': {
      handler: (routeContext) => exerciseAPI.scheduleStats(routeContext),
      auth: true
    },
    '/api/idiom/:idiomId': { 
      handler: (routeContext) => idiomAPI.getIdiom(routeContext),
      auth: false 
    },
    '/api/idioms': { 
      handler: (routeContext) => idiomAPI.getIdiomsList(routeContext),
      auth: false 
    },
    '/api/idioms/tones': { 
      handler: (routeContext) => idiomAPI.getTones(routeContext),
      auth: false 
    },
    '/api/settings': {
      handler: (routeContext) => settingsAPI.getSettings(routeContext),
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