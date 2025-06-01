// src/server/lib/userUtils.js
// Utility functions for user operations

/**
 * Validate user from routeContext parameter object
 * @param {Object} routeContext - Unified parameter object
 * @param {Object} options - Options for validation
 * @returns {Object} - Validation result with user if valid
 */
export function validateUser(routeContext, options = {}) {
  const { user } = routeContext;
  
  if (!user || !user.sub) {
    return { 
      valid: false, 
      error: { 
        message: options.errorMessage || 'No valid user information provided', 
        statusCode: options.errorCode || 400 
      }
    };
  }
  
  return { valid: true, userId: user.sub, user };
}

/**
 * Validate required fields in payload
 * @param {Object} routeContext - Unified parameter object
 * @param {Array} requiredFields - List of required fields
 * @returns {Object} - Validation result
 */
export function validateFields(routeContext, requiredFields) {
  const { payload } = routeContext;
  
  if (!payload) {
    return {
      valid: false,
      error: {
        message: 'No data provided',
        statusCode: 400
      }
    };
  }
  
  for (const field of requiredFields) {
    if (payload[field] === undefined) {
      return {
        valid: false,
        error: {
          message: `Missing required field: ${field}`,
          statusCode: 400
        }
      };
    }
  }
  
  return { valid: true };
}
