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
    const fullPath = `/api${req.path}`;
    
    const handlerInfo = getRouteHandler(req.method, fullPath);
    
    if (!handlerInfo) {
      return res.status(404).json({
        message: `ENTIENDO API - missing endpoint: ${fullPath} not found`
      });
    }
    
    let user = null;
    if (handlerInfo.auth) {
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
    
    const requestBody = req.body || {};
        if (req.files || req.file) {
      requestBody.files = req.files || (req.file ? [req.file] : []);
    }
    if (req.headers && req.headers['content-type']) {
      requestBody.contentType = req.headers['content-type'];
    }
    
    const routeContext = {
      params : handlerInfo.params || {},
      query  : req.query || {},
      payload: requestBody,
      user   : user
    };
    
    let result;
    try {
      /* 
        {{{{{{{ CODE CALLED HERE }}}}}}} 
      */

      result = await handlerInfo.handler(routeContext);

    } catch (handlerError) {

      /* 
        {{{{{{{ API ERRORS }}}}}}} 
      */
      console.error(`API Handler error for ${req.method} ${fullPath}:`, handlerError);
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

      /* 
        {{{{{{{ SYSTEM ERRORS }}}}}}} 
      */

    console.error('API System Error:', error);
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
