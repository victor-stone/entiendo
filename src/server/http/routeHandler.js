// src/server/http/routeHandler.js

import { getRouteHandler } from './routeTable.js';
import { getUserFromRequest, requireAuth } from '../lib/auth.js';

/**
 * Main request handler for the Entiendo API
 * Handles request processing, parameter preparation, authentication check,
 * and calls the appropriate API function
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleRequest = async (req, res) => {
  try {
    // Prepend '/api' to the path to match route definitions in routeTable.js
    const fullPath = `/api${req.path}`;
    
    // Find the route handler for this method and path
    const handlerInfo = getRouteHandler(req.method, fullPath);
    
    // Return 404 if no handler found
    if (!handlerInfo) {
      return res.status(404).json({
        message: `ENTIENDO API - missing endpoint: ${fullPath} not found`
      });
    }
    
    // Check authentication if required
    let user = null;
    if (handlerInfo.auth) {
      // Apply the Auth0 middleware for this request
      try {
        // The middleware will add auth information to the request
        await new Promise((resolve, reject) => {
          requireAuth(req, res, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
        
        // Get user info from the request
        user = await getUserFromRequest(req);
      } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
          message: 'Invalid or expired token'
        });
      }
    }
    
    // Extract only needed file-related information from request
    const requestBody = req.body || {};
    
    // Add file-specific information if present
    if (req.files || req.file) {
      requestBody.files = req.files || (req.file ? [req.file] : []);
    }
    
    // Add any other required request properties for file handling
    if (req.headers && req.headers['content-type']) {
      requestBody.contentType = req.headers['content-type'];
    }
    
    // Prepare unified parameter object for API function
    /**
     * The 'unified' object provides a consistent interface for all API handlers:
     *
     * @property {Object} params   Path parameters for the route, as defined in the route table (e.g., /api/user/:id provides { id: ... }).
     * @property {Object} query    Query string parameters from the request URL (e.g., /api/user?id=123 provides { id: "123" }).
     * @property {Object} payload  The request body, including any file-related information (such as req.body, req.files, or req.file). Used for POST/PUT data and uploaded files.
     * @property {Object|null} user The authenticated user object, if authentication is required for the route. Populated by the authentication middleware and contains user identity and claims.
     */
    const unified = {
      // Path parameters become params
      params: handlerInfo.params || {},
      // Query parameters
      query: req.query || {},
      // Request body becomes payload with file info included
      payload: requestBody,
      // User info
      user: user
    };
    
    // Call the handler function with proper try/catch
    let result;
    try {
      result = await handlerInfo.handler(unified);
    } catch (handlerError) {
      console.error(`Handler error for ${req.method} ${fullPath}:`, handlerError);
      console.error('Request details:', {
        method: req.method,
        path: req.path,
        params: handlerInfo.params,
        query: req.query,
        body: req.body ? JSON.stringify(req.body).substring(0, 500) : null
      });
      
      // Get appropriate status code
      const statusCode = handlerError.statusCode || 500;
      
      // Return error response with more details
      return res.status(statusCode).json({
        message: handlerError.message || 'Internal server error',
        code: handlerError.code || 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? handlerError.stack : undefined
      });
    }
    
    // Determine appropriate status code
    let statusCode = 200;
    if (req.method === 'POST') {
      statusCode = 201; // Created
    }
    
    // Return the result directly
    return res.status(statusCode).json(result);
  } catch (error) {
    console.error('API Error:', error);
    console.error('Stack trace:', error.stack);
    console.error('Request details:', {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body ? JSON.stringify(req.body).substring(0, 500) : null
    });
    
    // Determine status code based on error
    const status = error.statusCode || 500;
    
    // Return error response
    return res.status(status).json({
      message: error.message || 'Internal server error',
      code: error.code || 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Send API result as response to the client
 * @param {Object} res - Express response object
 * @param {string} method - HTTP method
 * @param {Object} result - API result
 */
const sendResponse = (res, method, result) => {
  // Set status code based on method and result
  let statusCode = 200;
  if (method === 'POST' && !result.error) {
    statusCode = 201; // Created
  }
  
  // Send error response if result indicates error
  if (result && result.error) {
    statusCode = result.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      error: result.error
    });
  }
  
  // Send successful response
  return res.status(statusCode).json({
    success: true,
    data: result
  });
};

/**
 * Handle API error and send appropriate response
 * @param {Error} error - API error
 * @param {Object} res - Express response object
 */
const handleApiError = (error, res) => {
  console.error('API error:', error);
  
  // Check for known error types with status codes
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message
    });
  }
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
  
  if (error.name === 'NotFoundError') {
    return res.status(404).json({
      success: false,
      error: error.message
    });
  }
  
  // Default to 500 for unknown errors
  return res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};